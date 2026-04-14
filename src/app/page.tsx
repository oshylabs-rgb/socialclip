"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Upload, Sparkles, Film, Download, Zap, Loader2, X, FileText, Image, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { mockBrand, mockScenes, mockAssets } from "@/lib/mock-data";
import type { UploadedFile } from "@/lib/store";

const ACCEPT = ".pdf,.docx,.md,.txt,.png,.jpg,.jpeg,.webp,.mp4,.mov,.webm";

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["png", "jpg", "jpeg", "webp"].includes(ext)) return Image;
  if (["mp4", "mov", "webm"].includes(ext)) return Video;
  return FileText;
}

export default function Home() {
  const router = useRouter();
  const { setUrl, setDemoMode, setBrand, setScenes, setAssets, setStatus, setUploadedFiles, setFileContext } = useAppStore();
  const [localUrl, setLocalUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    setFiles((prev) => [...prev, ...Array.from(newFiles)]);
  }, []);

  const removeFile = useCallback((idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleGenerate = useCallback(async () => {
    const trimmed = localUrl.trim();
    if (!trimmed) return;
    setUrl(trimmed);
    setStatus("analyzing");
    setLoading(true);
    router.push("/dashboard");

    try {
      // Step 1: Upload files if any
      let fileContext = "";
      let uploadedResults: UploadedFile[] = [];

      if (files.length > 0) {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          fileContext = uploadData.combinedContext || "";
          uploadedResults = (uploadData.files || []).map((f: { name: string; type: string; size: number; status: string; context: string }) => ({
            name: f.name,
            type: f.type,
            size: f.size,
            status: f.status as "parsed" | "error",
            context: f.context,
          }));
        }
      }

      setUploadedFiles(uploadedResults);
      setFileContext(fileContext);

      // Step 2: Generate with URL + file context
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed, fileContext }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }
      const data = await res.json();
      setBrand(data.brand);
      setScenes(data.scenes);
      setAssets(data.assets);
      if (data.projectId) useAppStore.getState().setProjectId(data.projectId);
      setStatus("complete");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      useAppStore.getState().setError(msg);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }, [localUrl, files, setUrl, setStatus, setBrand, setScenes, setAssets, setUploadedFiles, setFileContext, router]);

  const handleDemo = useCallback(() => {
    setDemoMode(true);
    setBrand(mockBrand);
    setScenes(mockScenes);
    setAssets(mockAssets);
    setStatus("complete");
    router.push("/dashboard");
  }, [setDemoMode, setBrand, setScenes, setAssets, setStatus, router]);

  const features = [
    { icon: Sparkles, title: "AI Analysis", desc: "Extracts brand, tone, features & audience" },
    { icon: Film, title: "Multi-Format", desc: "Reels, Stories, Square, Landscape, LinkedIn" },
    { icon: Download, title: "Export Ready", desc: "Download rendered videos instantly" },
    { icon: Zap, title: "One Click", desc: "Paste a URL and get social content" },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            Turn any product into{" "}
            <span className="text-primary">social media videos</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Paste a URL, upload your docs, and generate export-ready promo videos, reels,
            stories, and posts — powered by AI.
          </p>
        </motion.div>

        {/* Input */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <input
            type="url"
            placeholder="https://your-product.com"
            value={localUrl}
            onChange={(e) => setLocalUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            className="flex-1 h-12 rounded-lg border border-border bg-card px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button size="lg" onClick={handleGenerate} disabled={loading || !localUrl.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Generate <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </motion.div>

        <motion.div
          className="mt-4 flex items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={handleDemo}
            className="text-sm text-primary hover:underline"
          >
            Try demo mode →
          </button>
          <span className="text-muted-foreground text-xs">or</span>
          <label className="text-sm text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1">
            <Upload className="h-3.5 w-3.5" />
            Upload files
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              multiple
              accept={ACCEPT}
              onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
            />
          </label>
        </motion.div>

        {/* File chips */}
        {files.length > 0 && (
          <motion.div
            className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            {files.map((f, i) => {
              const Icon = fileIcon(f.name);
              return (
                <span
                  key={`${f.name}-${i}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                >
                  <Icon className="h-3 w-3" />
                  {f.name.length > 25 ? f.name.slice(0, 22) + "..." : f.name}
                  <button onClick={() => removeFile(i)} className="hover:text-foreground ml-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
            <span className="text-xs text-muted-foreground">
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </span>
          </motion.div>
        )}
      </section>

      {/* Features */}
      <section className="w-full max-w-4xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="rounded-xl border border-border bg-card p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i + 0.3 }}
            >
              <f.icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
