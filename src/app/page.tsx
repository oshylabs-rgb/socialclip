"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Upload, Sparkles, Film, Download, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { mockBrand, mockScenes, mockAssets } from "@/lib/mock-data";

export default function Home() {
  const router = useRouter();
  const { setUrl, url, setDemoMode, setBrand, setScenes, setAssets, setStatus } = useAppStore();
  const [localUrl, setLocalUrl] = useState("");

  const handleGenerate = useCallback(() => {
    if (localUrl.trim()) {
      setUrl(localUrl.trim());
    }
    router.push("/dashboard");
  }, [localUrl, setUrl, router]);

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
          <Button size="lg" onClick={handleGenerate}>
            Generate <ArrowRight className="h-4 w-4" />
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
            Upload docs
            <input type="file" className="hidden" multiple accept=".pdf,.docx,.md,.txt" />
          </label>
        </motion.div>
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
