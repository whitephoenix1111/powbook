import { Suspense } from "react";
import { CategoryContent } from "./CategoryContent";

export default function CategoryPage() {
  return (
    <Suspense fallback={<CategoryPageFallback />}>
      <CategoryContent />
    </Suspense>
  );
}

function CategoryPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="text-center">
        <div className="mb-4 h-8 w-32 animate-pulse rounded-lg bg-surface-sunken mx-auto" />
        <p className="font-sans text-sm text-ink-secondary">Loading category…</p>
      </div>
    </div>
  );
}
