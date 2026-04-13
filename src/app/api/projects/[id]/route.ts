import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects, scenes, generatedAssets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const projectScenes = await db
      .select()
      .from(scenes)
      .where(eq(scenes.projectId, id));

    const projectAssets = await db
      .select()
      .from(generatedAssets)
      .where(eq(generatedAssets.projectId, id));

    return NextResponse.json({
      ...project,
      scenes: projectScenes,
      assets: projectAssets,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
