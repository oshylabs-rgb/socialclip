"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Download, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";

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
            <div className="bg-muted relative" style={{ aspectRatio: `${current.width}/${current.height}`, maxHeight: 500 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Scene preview mockup */}
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: brand
                          ? `linear-gradient(135deg, ${brand.colors[0]}, ${brand.colors[1] || brand.colors[0]})`
                          : "linear-gradient(135deg, #7c3aed, #06b6d4)",
                      }}
                    />
                    <div className="relative z-10 text-center space-y-3">
                      <h2 className="text-2xl font-bold text-foreground">{brand?.name}</h2>
                      <p className="text-muted-foreground">{brand?.tagline}</p>
                      {scenes[0] && (
                        <p className="text-sm text-foreground/80 mt-4 italic">
                          &ldquo;{scenes[0].script}&rdquo;
                        </p>
                      )}
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <Play className="h-10 w-10 text-primary opacity-60" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {current.width}×{current.height} • {current.label}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

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
