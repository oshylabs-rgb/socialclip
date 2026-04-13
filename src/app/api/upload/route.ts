import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const texts: string[] = [];

    for (const file of files) {
      const name = file.name.toLowerCase();
      if (name.endsWith(".txt") || name.endsWith(".md")) {
        const text = await file.text();
        texts.push(`--- ${file.name} ---\n${text}`);
      } else if (name.endsWith(".pdf")) {
        // PDF parsing would require a library; return placeholder
        texts.push(`--- ${file.name} ---\n[PDF content - parsing not yet supported in serverless]`);
      } else if (name.endsWith(".docx")) {
        texts.push(`--- ${file.name} ---\n[DOCX content - parsing not yet supported in serverless]`);
      } else {
        texts.push(`--- ${file.name} ---\n[Unsupported format]`);
      }
    }

    const combined = texts.join("\n\n");

    return NextResponse.json({
      text: combined,
      fileCount: files.length,
      fileNames: files.map((f) => f.name),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
