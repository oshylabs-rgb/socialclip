import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects, scenes, generatedAssets } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt));
    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, brandData, sceneList, assetList } = body;

    // Create project
    const [project] = await db
      .insert(projects)
      .values({
        url: url || null,
        brandData: brandData || null,
        status: "complete",
      })
      .returning();

    // Insert scenes
    if (sceneList?.length) {
      await db.insert(scenes).values(
        sceneList.map((s: { title: string; script: string; duration: number; visualDescription?: string }, i: number) => ({
          projectId: project.id,
          orderIndex: i,
          title: s.title,
          script: s.script,
          duration: s.duration,
          visualDescription: s.visualDescription || null,
        }))
      );
    }

    // Insert assets
    if (assetList?.length) {
      await db.insert(generatedAssets).values(
        assetList.map((a: { format: string; label: string; width: number; height: number; status?: string }) => ({
          projectId: project.id,
          format: a.format,
          label: a.label,
          width: a.width,
          height: a.height,
          status: a.status || "pending",
        }))
      );
    }

    return NextResponse.json(project, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
