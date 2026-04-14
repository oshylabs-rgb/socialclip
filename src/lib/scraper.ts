import * as cheerio from "cheerio";

export interface ScrapedData {
  title: string;
  description: string;
  ogImage: string | null;
  ogSiteName: string | null;
  ogType: string | null;
  favicon: string | null;
  headings: string[];
  heroText: string;
  navLabels: string[];
  ctaButtons: string[];
  features: string[];
  testimonials: string[];
  pricingText: string;
  faqText: string;
  footerText: string;
  imageAlts: string[];
  bodyText: string;
  links: string[];
  metaKeywords: string[];
  themeColor: string | null;
}

function unique(arr: string[], max: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of arr) {
    const norm = s.trim().replace(/\s+/g, " ");
    if (norm && norm.length > 1 && !seen.has(norm.toLowerCase())) {
      seen.add(norm.toLowerCase());
      out.push(norm);
      if (out.length >= max) break;
    }
  }
  return out;
}

export async function scrapeUrl(url: string): Promise<ScrapedData> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(15000),
    redirect: "follow",
  });

  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  // --- Metadata ---
  const title =
    $("title").text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    "";

  const description =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    "";

  const ogImage = $('meta[property="og:image"]').attr("content") || null;
  const ogSiteName = $('meta[property="og:site_name"]').attr("content") || null;
  const ogType = $('meta[property="og:type"]').attr("content") || null;

  const favicon =
    $('link[rel="icon"]').attr("href") ||
    $('link[rel="shortcut icon"]').attr("href") ||
    null;

  const metaKeywords = ($('meta[name="keywords"]').attr("content") || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const themeColor = $('meta[name="theme-color"]').attr("content") || null;

  // --- Navigation labels ---
  const navLabels: string[] = [];
  $("nav a, header a, [role=navigation] a").each((_, el) => {
    const t = $(el).text().trim();
    if (t && t.length < 40) navLabels.push(t);
  });

  // --- Headings (all levels, before stripping) ---
  const rawHeadings: string[] = [];
  $("h1, h2, h3, h4").each((_, el) => {
    rawHeadings.push($(el).text().trim());
  });

  // --- Hero section (first prominent text block) ---
  let heroText = "";
  const heroSelectors = [
    "[class*=hero]", "[class*=Hero]", "[id*=hero]",
    "[class*=banner]", "[class*=Banner]",
    "main > section:first-child", "main > div:first-child",
    ".landing", "#landing",
  ];
  for (const sel of heroSelectors) {
    const el = $(sel).first();
    if (el.length) {
      heroText = el.text().replace(/\s+/g, " ").trim().slice(0, 1000);
      if (heroText.length > 30) break;
    }
  }

  // --- CTA buttons ---
  const ctaButtons: string[] = [];
  $("a, button").each((_, el) => {
    const t = $(el).text().trim();
    const cls = ($(el).attr("class") || "").toLowerCase();
    const role = ($(el).attr("role") || "").toLowerCase();
    const isCta =
      cls.includes("cta") || cls.includes("btn") || cls.includes("button") ||
      role === "button" || el.tagName === "button" ||
      /^(get started|sign up|try|start|book|buy|subscribe|contact|learn more|request|download|join)/i.test(t);
    if (isCta && t && t.length > 1 && t.length < 60) ctaButtons.push(t);
  });

  // --- Feature lists ---
  const features: string[] = [];
  $("[class*=feature], [class*=Feature], [class*=benefit], [class*=Benefit], [class*=service], [class*=Service]")
    .find("h2, h3, h4, p, li")
    .each((_, el) => {
      const t = $(el).text().trim();
      if (t && t.length > 5 && t.length < 200) features.push(t);
    });

  // --- Testimonials / social proof ---
  const testimonials: string[] = [];
  $("[class*=testimonial], [class*=Testimonial], [class*=review], [class*=Review], [class*=quote], blockquote")
    .each((_, el) => {
      const t = $(el).text().replace(/\s+/g, " ").trim();
      if (t && t.length > 10) testimonials.push(t.slice(0, 300));
    });

  // --- Pricing ---
  let pricingText = "";
  $("[class*=pricing], [class*=Pricing], [class*=price], [id*=pricing], [id*=price]").each((_, el) => {
    if (!pricingText) {
      pricingText = $(el).text().replace(/\s+/g, " ").trim().slice(0, 800);
    }
  });

  // --- FAQ ---
  let faqText = "";
  $("[class*=faq], [class*=FAQ], [class*=accordion], [id*=faq], details").each((_, el) => {
    if (!faqText) {
      faqText = $(el).text().replace(/\s+/g, " ").trim().slice(0, 800);
    }
  });

  // --- Footer ---
  const footerText = $("footer").text().replace(/\s+/g, " ").trim().slice(0, 500);

  // --- Image alt text ---
  const imageAlts: string[] = [];
  $("img[alt]").each((_, el) => {
    const alt = $(el).attr("alt")?.trim();
    if (alt && alt.length > 3 && alt.length < 150) imageAlts.push(alt);
  });

  // --- Links ---
  const links: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (href && links.length < 15) links.push(href);
  });

  // --- Body text (cleaned, after structured extraction) ---
  $("script, style, noscript, svg, iframe").remove();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 6000);

  return {
    title,
    description,
    ogImage,
    ogSiteName,
    ogType,
    favicon,
    headings: unique(rawHeadings, 30),
    heroText,
    navLabels: unique(navLabels, 15),
    ctaButtons: unique(ctaButtons, 10),
    features: unique(features, 20),
    testimonials: unique(testimonials, 5),
    pricingText,
    faqText,
    footerText,
    imageAlts: unique(imageAlts, 15),
    bodyText,
    links,
    metaKeywords,
    themeColor,
  };
}
