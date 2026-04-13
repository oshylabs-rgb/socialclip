import * as cheerio from "cheerio";

export interface ScrapedData {
  title: string;
  description: string;
  ogImage: string | null;
  favicon: string | null;
  headings: string[];
  bodyText: string;
  links: string[];
  metaKeywords: string[];
  themeColor: string | null;
}

export async function scrapeUrl(url: string): Promise<ScrapedData> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  const title =
    $("title").text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    "";

  const description =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    "";

  const ogImage =
    $('meta[property="og:image"]').attr("content") || null;

  const favicon =
    $('link[rel="icon"]').attr("href") ||
    $('link[rel="shortcut icon"]').attr("href") ||
    null;

  const headings: string[] = [];
  $("h1, h2, h3").each((_, el) => {
    const text = $(el).text().trim();
    if (text && headings.length < 20) headings.push(text);
  });

  // Get visible text, limit to ~4000 chars
  $("script, style, noscript, nav, footer, header").remove();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 4000);

  const links: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (href && links.length < 10) links.push(href);
  });

  const metaKeywords = ($('meta[name="keywords"]').attr("content") || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const themeColor =
    $('meta[name="theme-color"]').attr("content") || null;

  return {
    title,
    description,
    ogImage,
    favicon,
    headings,
    bodyText,
    links,
    metaKeywords,
    themeColor,
  };
}
