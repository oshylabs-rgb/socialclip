"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";
import type { VideoProps } from "@/remotion/types";

const VideoPlayer = dynamic(() => import("@/components/video-player").then((m) => m.VideoPlayer), {
  ssr: false,
  loading: () => <div className="bg-muted flex items-center justify-center h-64 rounded-xl">Loading player...</div>,
});

export default function PreviewPage() {
  const router = useRouter();
  const { assets, brand, scenes } = useAppStore();
  const [selectedIdx, setSelectedIdx] = useState(0);

  const doneAssets = assets.filter((a) => a.status === "done");

  if (doneAssets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <h2 className="text-2xl font-bold text-foreground">No assets ready</h2>
        <p className="mt-2 text-muted-foreground">Generate content first from the dashboard.</p>
        <Button className="mt-6" onClick={() => router.push("/dashboard")}>
          ← Dashboard
        </Button>
      </div>
    );
  }

  const current = doneAssets[selectedIdx];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Button>
        <h1 className="text-xl font-bold text-foreground">Preview & Export</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview area */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {brand && scenes.length > 0 ? (
                  <VideoPlayer
                    videoProps={{
                      brandName: brand.name,
                      tagline: brand.tagline,
                      colors: brand.colors,
                      cta: brand.cta,
                      scenes: scenes.map((s) => ({
                        title: s.title,
                        script: s.script,
                        duration: s.duration,
                        visualDescription: s.visualDescription,
                      })),
                      width: current.width,
                      height: current.height,
                    }}
                    width={current.width}
                    height={current.height}
                  />
                ) : (
                  <div className="bg-muted flex items-center justify-center h-64 rounded-xl text-muted-foreground">
                    No video data
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Nav */}
            <div className="flex items-center justify-between p-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                disabled={selectedIdx === 0}
                onClick={() => setSelectedIdx((i) => i - 1)}
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedIdx + 1} / {doneAssets.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={selectedIdx === doneAssets.length - 1}
                onClick={() => setSelectedIdx((i) => i + 1)}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Formats
          </h3>
          {doneAssets.map((a, i) => (
            <button
              key={a.id}
              onClick={() => setSelectedIdx(i)}
              className={`w-full text-left rounded-lg border p-3 transition-colors ${
                i === selectedIdx
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{a.label}</p>
              <p className="text-xs text-muted-foreground">
                {a.width}×{a.height}
              </p>
            </button>
          ))}

          <div className="pt-4 space-y-2">
            <Button className="w-full" size="lg">
              <Download className="h-4 w-4" /> Download Current
            </Button>
            <Button className="w-full" variant="secondary" size="md">
              Download All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
