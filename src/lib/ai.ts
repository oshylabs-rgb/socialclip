import OpenAI from "openai";
import type { ScrapedData } from "./scraper";
import type { BrandData, Scene, GeneratedAsset } from "./store";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const BRAND_PROMPT = `You are a social media marketing expert. Analyze the following website data and extract brand information.

IMPORTANT: Base your analysis on the ACTUAL page content provided. Do not guess or hallucinate details. Use the hero text, CTA buttons, features, testimonials, headings, and body text to derive accurate brand information.

Return ONLY valid JSON with this exact shape:
{
  "name": "Brand Name (from the actual site, not a generic name)",
  "tagline": "The site's actual tagline or hero text, quoted if possible",
  "colors": ["#hex1", "#hex2", "#hex3"],
  "tone": "Description of the brand's actual communication tone based on its copy",
  "audience": "Target audience as described or implied by the site content",
  "cta": "The primary CTA from the actual site buttons/links",
  "features": ["real feature 1 from site", "real feature 2", "real feature 3", "real feature 4", "real feature 5"],
  "screenshots": []
}

Rules:
- Use the actual brand name from the site, not a generic placeholder.
- Features must come from the site's actual feature/benefit/service sections.
- CTA must be the actual button text found on the page.
- Tagline should reflect the site's actual hero/headline copy.
- If colors aren't explicit, infer from the theme color or make professional choices. Always return exactly 3 colors and 5 features.
- Audience should reflect who the site is clearly targeting based on its messaging.`;

const SCENES_PROMPT = `You are a video scriptwriter for social media promos. Given the brand data AND raw website content, create a 5-scene video script that accurately represents this specific product/service.

Return ONLY valid JSON with key "scenes" containing an array with this exact shape:
{
  "scenes": [
    {
      "id": "s1",
      "title": "Hook",
      "script": "Attention-grabbing opening line using actual brand messaging",
      "duration": 3,
      "visualDescription": "What should be shown visually"
    }
  ]
}

Rules:
- Scene 1: Hook (3s) - grab attention using the brand's actual hero message or value prop
- Scene 2: Problem (3s) - identify the real pain point the product solves (from testimonials or copy)
- Scene 3: Solution (4s) - introduce the product by name with its actual tagline or description
- Scene 4: Features (4s) - highlight real features from the website, not generic ones
- Scene 5: CTA (3s) - use the actual CTA text from the website
- Total duration should be ~17 seconds
- Keep scripts punchy and under 15 words each
- Visual descriptions should reference the actual product's look and feel
- NEVER use generic placeholder text. Every line must reflect the real brand.`;

function buildScrapedContext(scraped: ScrapedData): string {
  const parts: string[] = [];
  parts.push(`Website Title: ${scraped.title}`);
  if (scraped.ogSiteName) parts.push(`Site Name: ${scraped.ogSiteName}`);
  parts.push(`Description: ${scraped.description}`);
  if (scraped.heroText) parts.push(`Hero Section: ${scraped.heroText.slice(0, 600)}`);
  if (scraped.headings.length) parts.push(`Headings: ${scraped.headings.join(" | ")}`);
  if (scraped.ctaButtons.length) parts.push(`CTA Buttons: ${scraped.ctaButtons.join(", ")}`);
  if (scraped.navLabels.length) parts.push(`Navigation: ${scraped.navLabels.join(", ")}`);
  if (scraped.features.length) parts.push(`Features/Benefits:\n${scraped.features.map(f => `- ${f}`).join("\n")}`);
  if (scraped.testimonials.length) parts.push(`Testimonials/Social Proof:\n${scraped.testimonials.join("\n")}`);
  if (scraped.pricingText) parts.push(`Pricing: ${scraped.pricingText.slice(0, 400)}`);
  if (scraped.faqText) parts.push(`FAQ: ${scraped.faqText.slice(0, 400)}`);
  if (scraped.footerText) parts.push(`Footer/Company Info: ${scraped.footerText.slice(0, 300)}`);
  if (scraped.imageAlts.length) parts.push(`Image Descriptions: ${scraped.imageAlts.join(", ")}`);
  if (scraped.metaKeywords.length) parts.push(`Keywords: ${scraped.metaKeywords.join(", ")}`);
  if (scraped.themeColor) parts.push(`Theme Color: ${scraped.themeColor}`);
  parts.push(`Body Text (excerpt): ${scraped.bodyText.slice(0, 3000)}`);
  return parts.join("\n\n");
}

export async function analyzeBrand(scraped: ScrapedData, fileContext?: string): Promise<BrandData> {
  let content = buildScrapedContext(scraped);

  if (fileContext) {
    content += `\n\nAdditional context from uploaded files:\n${fileContext.slice(0, 3000)}`;
  }

  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: BRAND_PROMPT },
      { role: "user", content },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const text = res.choices[0]?.message?.content || "{}";
  return JSON.parse(text) as BrandData;
}

export async function generateScenes(brand: BrandData, scraped?: ScrapedData | null): Promise<Scene[]> {
  let content = `Brand: ${brand.name}
Tagline: ${brand.tagline}
Tone: ${brand.tone}
Audience: ${brand.audience}
Features: ${brand.features.join(", ")}
CTA: ${brand.cta}`;

  if (scraped) {
    if (scraped.heroText) content += `\nHero Text: ${scraped.heroText.slice(0, 300)}`;
    if (scraped.testimonials.length) content += `\nTestimonial: ${scraped.testimonials[0].slice(0, 200)}`;
    if (scraped.pricingText) content += `\nPricing: ${scraped.pricingText.slice(0, 200)}`;
  }

  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SCENES_PROMPT },
      { role: "user", content },
    ],
    temperature: 0.8,
    response_format: { type: "json_object" },
  });

  const text = res.choices[0]?.message?.content || "[]";
  const parsed = JSON.parse(text);
  // Handle both { scenes: [...] } and direct array
  return Array.isArray(parsed) ? parsed : parsed.scenes || [];
}

export function buildAssetList(): GeneratedAsset[] {
  return [
    { id: "a1", format: "reel", label: "Instagram Reel (9:16)", width: 1080, height: 1920, status: "pending" },
    { id: "a2", format: "story", label: "Story (9:16)", width: 1080, height: 1920, status: "pending" },
    { id: "a3", format: "square", label: "Square Post (1:1)", width: 1080, height: 1080, status: "pending" },
    { id: "a4", format: "landscape", label: "Landscape (16:9)", width: 1920, height: 1080, status: "pending" },
    { id: "a5", format: "linkedin", label: "LinkedIn Video (16:9)", width: 1920, height: 1080, status: "pending" },
  ];
}
