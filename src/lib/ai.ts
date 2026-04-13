import OpenAI from "openai";
import type { ScrapedData } from "./scraper";
import type { BrandData, Scene, GeneratedAsset } from "./store";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const BRAND_PROMPT = `You are a social media marketing expert. Analyze the following website data and extract brand information.

Return ONLY valid JSON with this exact shape:
{
  "name": "Brand Name",
  "tagline": "Short tagline",
  "colors": ["#hex1", "#hex2", "#hex3"],
  "tone": "Description of brand tone",
  "audience": "Target audience description",
  "cta": "Primary call to action",
  "features": ["feature1", "feature2", "feature3", "feature4", "feature5"],
  "screenshots": []
}

If colors aren't explicit, infer from the theme or make professional choices. Always return exactly 3 colors and 5 features.`;

const SCENES_PROMPT = `You are a video scriptwriter for social media promos. Given the brand data, create a 5-scene video script.

Return ONLY valid JSON array with this exact shape:
[
  {
    "id": "s1",
    "title": "Hook",
    "script": "Attention-grabbing opening line",
    "duration": 3,
    "visualDescription": "What should be shown visually"
  }
]

Rules:
- Scene 1: Hook (3s) - grab attention
- Scene 2: Problem (3s) - identify pain point  
- Scene 3: Solution (4s) - introduce the product
- Scene 4: Features (4s) - highlight key features
- Scene 5: CTA (3s) - call to action
- Total duration should be ~17 seconds
- Keep scripts punchy and under 15 words each
- Visual descriptions should be specific and actionable`;

export async function analyzeBrand(scraped: ScrapedData): Promise<BrandData> {
  const content = `Website Title: ${scraped.title}
Description: ${scraped.description}
Headings: ${scraped.headings.join(", ")}
Keywords: ${scraped.metaKeywords.join(", ")}
Theme Color: ${scraped.themeColor || "none"}
Body Text (excerpt): ${scraped.bodyText.slice(0, 2000)}`;

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

export async function generateScenes(brand: BrandData): Promise<Scene[]> {
  const content = `Brand: ${brand.name}
Tagline: ${brand.tagline}
Tone: ${brand.tone}
Audience: ${brand.audience}
Features: ${brand.features.join(", ")}
CTA: ${brand.cta}`;

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
