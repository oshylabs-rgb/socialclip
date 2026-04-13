import { NextRequest, NextResponse } from "next/server";
import { scrapeUrl } from "@/lib/scraper";
import { analyzeBrand, generateScenes, buildAssetList } from "@/lib/ai";
import { normalizeUrl } from "@/lib/normalize-url";
import { mockBrand, mockScenes, mockAssets } from "@/lib/mock-data";
import { db } from "@/lib/db";
import { projects, scenes as scenesTable, generatedAssets } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let normalizedUrl: string;
    try {
      normalizedUrl = normalizeUrl(url);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid URL";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const hasOpenAI = !!process.env.OPENAI_API_KEY;

    // Step 1: Scrape (always attempt — no API key needed)
    let scraped;
    try {
      scraped = await scrapeUrl(normalizedUrl);
    } catch {
      scraped = null;
    }

    let brand;
    let sceneList;
    let assetList;
    let demo = false;

    if (hasOpenAI && scraped) {
      // Step 2: Analyze brand
      brand = await analyzeBrand(scraped);
      // Step 3: Generate scenes
      sceneList = await generateScenes(brand);
      // Step 4: Build asset list
      assetList = buildAssetList();
    } else {
      // Fallback: use mock data enriched with scraped title if available
      demo = true;
      brand = {
        ...mockBrand,
        ...(scraped?.title ? { name: scraped.title } : {}),
        ...(scraped?.description ? { tagline: scraped.description } : {}),
      };
      sceneList = mockScenes;
      assetList = mockAssets;
    }

    // Step 5: Persist to DB
    let projectId: string | null = null;
    try {
      const [project] = await db
        .insert(projects)
        .values({ url: normalizedUrl, brandData: brand, status: "complete" })
        .returning();
      projectId = project.id;

      if (sceneList.length) {
        await db.insert(scenesTable).values(
          sceneList.map((s, i) => ({
            projectId: project.id,
            orderIndex: i,
            title: s.title,
            script: s.script,
            duration: s.duration,
            visualDescription: s.visualDescription || null,
          }))
        );
      }

      if (assetList.length) {
        await db.insert(generatedAssets).values(
          assetList.map((a) => ({
            projectId: project.id,
            format: a.format,
            label: a.label,
            width: a.width,
            height: a.height,
            status: a.status,
          }))
        );
      }
    } catch (dbErr) {
      console.error("DB save failed (non-fatal):", dbErr);
    }

    return NextResponse.json({
      projectId,
      brand,
      scenes: sceneList,
      assets: assetList.map((a) => ({ ...a, status: "done" })),
      ...(demo ? { demo: true, message: "Demo mode active: OPENAI_API_KEY is not set." } : {}),
    });
  } catch (e: unknown) {
    console.error("Generate error:", e);
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
