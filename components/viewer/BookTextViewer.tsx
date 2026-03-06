"use client";

import { useState, useEffect } from "react";
import { Book } from "@/lib/mockData";
import { Bookmark, Languages, ChevronLeft, ChevronRight } from "lucide-react";

interface BookTextViewerProps {
  book: Book;
}

const FONT_SIZES = [14, 16, 18];

export default function BookTextViewer({ book }: BookTextViewerProps) {
  const BOOKMARK_KEY = `bookmark_${book.id}`;

  const [fontIndex, setFontIndex]     = useState(1);
  const [bookmarked, setBookmarked]   = useState(false);
  const [pageOffset, setPageOffset]   = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOOKMARK_KEY);
      if (stored === "true") setBookmarked(true);
    } catch { /* SSR guard */ }
  }, [BOOKMARK_KEY]);

  const toggleBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    try { localStorage.setItem(BOOKMARK_KEY, String(next)); } catch { /* ignore */ }
  };

  const pages      = book.pages ?? [];
  const totalSpreads = Math.ceil(pages.length / 2);
  const leftPage   = pages[pageOffset * 2];
  const rightPage  = pages[pageOffset * 2 + 1];
  const textSizePx = FONT_SIZES[fontIndex];

  return (
    <div
      className="flex flex-1 h-full gap-4 px-6 py-5 overflow-hidden"
      style={{ "--reader-font-size": `${textSizePx}px` } as React.CSSProperties}
    >

      {/* ══════════════════════════════════
          Book spread
      ══════════════════════════════════ */}
      <div className="flex flex-col flex-1 overflow-hidden gap-3">

        {/* Pages */}
        <div className="flex flex-1 overflow-hidden rounded-2xl border border-warm-border shadow-sm bg-[#FDFAF4]">

          {/* Left page */}
          <div className="flex flex-col flex-1 border-r border-warm-border px-10 py-8 overflow-hidden">
            {leftPage ? (
              <>
                {leftPage.chapter && (
                  <p
                    className="font-display font-bold text-ink mb-5 whitespace-pre-line flex-shrink-0 leading-snug"
                    style={{ fontSize: `calc(var(--reader-font-size) * 1.05)` }}
                  >
                    {leftPage.chapter}
                  </p>
                )}
                <p
                  className="font-sans text-ink leading-[1.9] text-justify"
                  style={{ fontSize: "var(--reader-font-size)" }}
                >
                  {leftPage.content}
                </p>
              </>
            ) : (
              <p className="font-sans text-sm text-ink-secondary">No content</p>
            )}
            <div className="mt-auto pt-4 text-center font-sans text-[11px] text-ink-secondary/50 tracking-widest flex-shrink-0">
              {leftPage?.pageNumber?.toString().padStart(2, "0")}
            </div>
          </div>

          {/* Right page */}
          <div className="flex flex-col flex-1 px-10 py-8 overflow-hidden">
            <p className="font-sans text-[10px] text-ink-secondary/40 text-center mb-6 tracking-[0.2em] uppercase flex-shrink-0">
              {book.title}
            </p>
            {rightPage ? (
              <p
                className="font-sans text-ink leading-[1.9] text-justify"
                style={{ fontSize: "var(--reader-font-size)" }}
              >
                {rightPage.content}
              </p>
            ) : book.description ? (
              <>
                <hr className="mb-6 border-warm-border flex-shrink-0" />
                <p
                  className="font-sans text-ink-secondary leading-[1.9] text-justify italic"
                  style={{ fontSize: "var(--reader-font-size)" }}
                >
                  {book.description}
                </p>
              </>
            ) : null}
            <div className="mt-auto pt-4 text-center font-sans text-[11px] text-ink-secondary/50 tracking-widest flex-shrink-0">
              {(rightPage ?? leftPage)?.pageNumber?.toString().padStart(2, "0")}
            </div>
          </div>

        </div>

        {/* ── Page navigation ── */}
        {totalSpreads > 1 && (
          <div className="flex items-center justify-center gap-3 flex-shrink-0">
            <button
              onClick={() => setPageOffset((p) => Math.max(0, p - 1))}
              disabled={pageOffset === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-warm-border
                text-ink-secondary hover:bg-surface-sunken hover:text-ink transition-colors
                disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} strokeWidth={2} />
            </button>
            <span className="font-sans text-[12px] text-ink-secondary">
              {pageOffset + 1} / {totalSpreads}
            </span>
            <button
              onClick={() => setPageOffset((p) => Math.min(totalSpreads - 1, p + 1))}
              disabled={pageOffset >= totalSpreads - 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-warm-border
                text-ink-secondary hover:bg-surface-sunken hover:text-ink transition-colors
                disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════
          Action buttons — right rail
      ══════════════════════════════════ */}
      <div className="flex flex-col gap-2 pt-1 flex-shrink-0">

        {/* Bookmark */}
        <button
          onClick={toggleBookmark}
          title={bookmarked ? "Remove bookmark" : "Bookmark"}
          className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all
            ${bookmarked
              ? "bg-brand border-brand text-white shadow-sm"
              : "border-warm-border bg-surface-card text-ink-secondary hover:border-brand/40 hover:text-brand"
            }`}
        >
          <Bookmark size={14} fill={bookmarked ? "white" : "none"} strokeWidth={1.8} />
        </button>

        {/* Translate */}
        <button
          title="Translate (coming soon)"
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-warm-border
            bg-surface-card text-ink-secondary hover:border-brand/40 hover:text-brand transition-all"
        >
          <Languages size={14} strokeWidth={1.8} />
        </button>

        {/* Text size */}
        <button
          onClick={() => setFontIndex((i) => (i + 1) % FONT_SIZES.length)}
          title={`Text size: ${textSizePx}px`}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-warm-border
            bg-surface-card text-ink-secondary hover:border-brand/40 hover:text-brand transition-all font-display font-bold"
          style={{ fontSize: `${11 + fontIndex * 2}px` }}
        >
          T
        </button>
      </div>

    </div>
  );
}
