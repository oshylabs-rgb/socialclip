"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 max-w-md">
        <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {error.message || "An unexpected error occurred."}
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
