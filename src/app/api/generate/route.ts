import { NextRequest, NextResponse } from "next/server";
import { scrapeUrl } from "@/lib/scraper";
import { analyzeBrand, generateScenes, buildAssetList } from "@/lib/ai";
import { db } from "@/lib/db";
import { projects, scenes as scenesTable, generatedAssets } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Step 1: Scrape
    const scraped = await scrapeUrl(url);

    // Step 2: Analyze brand
    const brand = await analyzeBrand(scraped);

    // Step 3: Generate scenes
    const sceneList = await generateScenes(brand);

    // Step 4: Build asset list
    const assetList = buildAssetList();

    // Step 5: Persist to DB
    let projectId: string | null = null;
    try {
      const [project] = await db
        .insert(projects)
        .values({ url, brandData: brand, status: "complete" })
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
    });
  } catch (e: unknown) {
    console.error("Generate error:", e);
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
