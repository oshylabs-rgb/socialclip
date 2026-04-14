import { NextRequest, NextResponse } from "next/server";

const ALLOWED_EXTENSIONS = [
  ".txt", ".md",
  ".pdf", ".docx",
  ".png", ".jpg", ".jpeg", ".webp",
  ".mp4", ".mov", ".webm",
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

interface FileResult {
  name: string;
  type: string;
  size: number;
  status: "parsed" | "error";
  context: string;
}

function getExtension(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

async function parseFile(file: File): Promise<FileResult> {
  const ext = getExtension(file.name);
  const base: Omit<FileResult, "status" | "context"> = {
    name: file.name,
    type: file.type || ext,
    size: file.size,
  };

  if (file.size > MAX_FILE_SIZE) {
    return { ...base, status: "error", context: `File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.` };
  }

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { ...base, status: "error", context: `Unsupported file type: ${ext}` };
  }

  try {
    // Text / Markdown
    if (ext === ".txt" || ext === ".md") {
      const text = await file.text();
      return { ...base, status: "parsed", context: text.slice(0, 8000) };
    }

    // PDF — extract raw text layer (best-effort without a PDF lib)
    if (ext === ".pdf") {
      const buf = await file.arrayBuffer();
      const text = extractPdfText(buf);
      return { ...base, status: "parsed", context: text || "[PDF uploaded — no extractable text layer found]" };
    }

    // DOCX — extract text from XML
    if (ext === ".docx") {
      const text = await extractDocxText(file);
      return { ...base, status: "parsed", context: text || "[DOCX uploaded — no extractable text found]" };
    }

    // Images
    if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
      return {
        ...base,
        status: "parsed",
        context: `[Image: ${file.name}, ${file.type}, ${(file.size / 1024).toFixed(1)}KB]`,
      };
    }

    // Videos
    if ([".mp4", ".mov", ".webm"].includes(ext)) {
      return {
        ...base,
        status: "parsed",
        context: `[Video: ${file.name}, ${file.type}, ${(file.size / 1024 / 1024).toFixed(1)}MB]`,
      };
    }

    return { ...base, status: "error", context: "Unhandled file type." };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Parse failed";
    return { ...base, status: "error", context: msg };
  }
}

function extractPdfText(buf: ArrayBuffer): string {
  // Lightweight: scan for text between BT/ET operators in the raw PDF stream
  const bytes = new Uint8Array(buf);
  const raw = new TextDecoder("latin1").decode(bytes);
  const parts: string[] = [];
  const regex = /\(([^)]{1,500})\)/g;
  let m;
  while ((m = regex.exec(raw)) !== null && parts.length < 200) {
    const t = m[1].replace(/\\[nrt]/g, " ").trim();
    if (t.length > 2) parts.push(t);
  }
  return parts.join(" ").slice(0, 8000);
}

async function extractDocxText(file: File): Promise<string> {
  // DOCX is a ZIP; the main text lives in word/document.xml
  // We'll do a naive scan for <w:t> tags without pulling in a ZIP library
  const buf = await file.arrayBuffer();
  const raw = new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(buf));
  const parts: string[] = [];
  const regex = /<w:t[^>]*>([^<]+)<\/w:t>/g;
  let m;
  while ((m = regex.exec(raw)) !== null && parts.length < 500) {
    parts.push(m[1]);
  }
  return parts.join(" ").slice(0, 8000);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const results: FileResult[] = [];
    for (const file of files) {
      results.push(await parseFile(file));
    }

    const combinedContext = results
      .filter((r) => r.status === "parsed" && r.context)
      .map((r) => `--- ${r.name} ---\n${r.context}`)
      .join("\n\n");

    return NextResponse.json({
      files: results,
      fileCount: results.length,
      combinedContext,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
