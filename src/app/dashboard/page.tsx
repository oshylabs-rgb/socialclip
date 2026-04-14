"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Palette,
  Users,
  MessageSquare,
  Layers,
  ArrowRight,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Image,
  Video,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";

export default function DashboardPage() {
  const router = useRouter();
  const { brand, scenes, assets, status, demoMode, url, error, uploadedFiles } = useAppStore();

  if (!brand && status === "idle") {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <h2 className="text-2xl font-bold text-foreground">No project loaded</h2>
        <p className="mt-2 text-muted-foreground">
          Go back and enter a URL or try demo mode.
        </p>
        <Button className="mt-6" onClick={() => router.push("/")}>
          ← Back to Home
        </Button>
      </div>
    );
  }

  const statusConfig = {
    analyzing: { icon: Loader2, label: "Analyzing...", color: "text-yellow-500" },
    generating: { icon: Loader2, label: "Generating...", color: "text-blue-500" },
    rendering: { icon: Loader2, label: "Rendering...", color: "text-purple-500" },
    complete: { icon: CheckCircle2, label: "Complete", color: "text-green-500" },
    error: { icon: AlertCircle, label: "Error", color: "text-destructive" },
    idle: { icon: Clock, label: "Idle", color: "text-muted-foreground" },
  };

  const sc = statusConfig[status];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Status bar */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {brand?.name || "Project"} {demoMode && <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary">DEMO</span>}
          </h1>
          {url && (
            <p className="text-sm text-muted-foreground mt-1 truncate max-w-md">{url}</p>
          )}
        </div>
        <div className={`flex items-center gap-2 ${sc.color}`}>
          <sc.icon className={`h-4 w-4 ${status === "analyzing" || status === "generating" || status === "rendering" ? "animate-spin" : ""}`} />
          <span className="text-sm font-medium">{sc.label}</span>
        </div>
      </motion.div>

      {error && (
        <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/30 p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" /> Brand
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {brand && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">Tagline</p>
                  <p className="text-sm font-medium">{brand.tagline}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Colors</p>
                  <div className="flex gap-1 mt-1">
                    {brand.colors.map((c) => (
                      <div
                        key={c}
                        className="w-6 h-6 rounded-full border border-border"
                        style={{ background: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> Tone
                    </p>
                    <p className="text-sm">{brand.tone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" /> Audience
                    </p>
                    <p className="text-sm">{brand.audience}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CTA</p>
                  <p className="text-sm font-medium text-primary">{brand.cta}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Features</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {brand.features.map((f) => (
                      <span
                        key={f}
                        className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Scenes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Scenes ({scenes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scenes.map((scene, i) => (
                <motion.div
                  key={scene.id}
                  className="rounded-lg border border-border p-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                        {i + 1}
                      </span>
                      <span className="text-sm font-semibold">{scene.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{scene.duration}s</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{scene.script}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 italic">
                    {scene.visualDescription}
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Uploaded Context ({uploadedFiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {uploadedFiles.map((f, i) => {
                  const ext = f.name.split(".").pop()?.toLowerCase() || "";
                  const Icon = ["png", "jpg", "jpeg", "webp"].includes(ext)
                    ? Image
                    : ["mp4", "mov", "webm"].includes(ext)
                    ? Video
                    : FileText;
                  return (
                    <div
                      key={`${f.name}-${i}`}
                      className={`rounded-lg border p-3 text-sm ${
                        f.status === "error"
                          ? "border-destructive/30 bg-destructive/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium truncate">{f.name}</span>
                        {f.status === "error" ? (
                          <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 ml-auto" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 ml-auto" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {(f.size / 1024).toFixed(1)}KB &middot; {f.status === "parsed" ? "Parsed" : f.context}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assets */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Play className="h-4 w-4 text-primary" /> Generated Assets
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {assets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden">
              <div
                className="bg-muted flex items-center justify-center text-muted-foreground"
                style={{ aspectRatio: `${asset.width}/${asset.height}`, maxHeight: 200 }}
              >
                <div className="text-center">
                  <Play className="h-8 w-8 mx-auto mb-1 opacity-40" />
                  <p className="text-xs">
                    {asset.width}×{asset.height}
                  </p>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{asset.label}</p>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`text-xs capitalize ${
                      asset.status === "done"
                        ? "text-green-500"
                        : asset.status === "error"
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {asset.status}
                  </span>
                  {asset.status === "done" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`/preview?id=${asset.id}`)}
                    >
                      Preview
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Actions */}
      {status === "complete" && (
        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Button size="lg" onClick={() => router.push("/preview")}>
            View All Previews <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
