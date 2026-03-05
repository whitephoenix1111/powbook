"use client";

import { useState, useEffect } from "react";
import { Book } from "@/lib/mockData";
import { Bookmark, Languages } from "lucide-react";

interface BookTextViewerProps {
  book: Book;
}

const FONT_SIZES = [13, 15, 17]; // px — maps to CSS variable

export default function BookTextViewer({ book }: BookTextViewerProps) {
  const BOOKMARK_KEY = `bookmark_${book.id}`;

  const [fontIndex, setFontIndex] = useState(1);
  const [bookmarked, setBookmarked] = useState(false);

  /* ── Load bookmark từ localStorage khi mount ── */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOOKMARK_KEY);
      if (stored === "true") setBookmarked(true);
    } catch {
      // localStorage không khả dụng (SSR guard)
    }
  }, [BOOKMARK_KEY]);

  /* ── Lưu bookmark vào localStorage mỗi khi thay đổi ── */
  const toggleBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    try {
      localStorage.setItem(BOOKMARK_KEY, String(next));
    } catch {
      // ignore
    }
  };

  const pages = book.pages ?? [];
  const leftPage = pages[0];
  const rightPage = pages[1];

  /* ── CSS variable text size ── */
  const textSizePx = FONT_SIZES[fontIndex];

  return (
    <div
      className="flex flex-1 h-full items-stretch gap-3 px-6 pt-6 overflow-hidden"
      style={{ "--reader-font-size": `${textSizePx}px` } as React.CSSProperties}
    >
      {/* ── Book frame (2 columns) — full height, upright rectangle ── */}
      <div className="flex flex-1 h-full border-2 border-black overflow-hidden bg-[#FDFAF4]">

        {/* Left page */}
        <div className="flex flex-col flex-1 border-r-2 border-black px-10 py-8 overflow-hidden">
          {leftPage ? (
            <>
              {leftPage.chapter && (
                <p
                  className="font-bold mb-4 whitespace-pre-line font-mono flex-shrink-0"
                  style={{ fontSize: "var(--reader-font-size)" }}
                >
                  {leftPage.chapter}
                </p>
              )}
              <p
                className="font-mono leading-relaxed text-justify overflow-hidden"
                style={{ fontSize: "var(--reader-font-size)" }}
              >
                {leftPage.content}
              </p>
            </>
          ) : (
            <p className="text-gray-400 font-mono text-sm">No content</p>
          )}
          <div className="mt-auto pt-4 text-center font-mono text-xs text-gray-400 flex-shrink-0">
            {leftPage?.pageNumber?.toString().padStart(2, "0")}
          </div>
        </div>

        {/* Right page */}
        <div className="flex flex-col flex-1 px-10 py-8 overflow-hidden">
          <p className="font-mono text-xs text-gray-400 text-center mb-6 tracking-widest uppercase flex-shrink-0">
            {book.title}
          </p>
          {rightPage ? (
            <p
              className="font-mono leading-relaxed text-justify overflow-hidden"
              style={{ fontSize: "var(--reader-font-size)" }}
            >
              {rightPage.content}
            </p>
          ) : (
            <p className="text-gray-400 font-mono text-sm">No content</p>
          )}
          {book.description && (
            <>
              <hr className="my-6 border-black/20 flex-shrink-0" />
              <p
                className="font-mono leading-relaxed text-justify text-gray-600 overflow-hidden"
                style={{ fontSize: "var(--reader-font-size)" }}
              >
                {book.description}
              </p>
            </>
          )}
          <div className="mt-auto pt-4 text-center font-mono text-xs text-gray-400 flex-shrink-0">
            {rightPage?.pageNumber?.toString().padStart(2, "0")}
          </div>
        </div>
      </div>

      {/* ── 3 action buttons ── */}
      <div className="flex flex-col gap-2 pt-4 flex-shrink-0">
        {/* Bookmark — localStorage */}
        <button
          onClick={toggleBookmark}
          className={`w-10 h-10 flex items-center justify-center border-2 border-black rounded transition ${
            bookmarked
              ? "bg-[#F97316] text-white"
              : "bg-white text-black hover:bg-orange-100"
          }`}
          title={bookmarked ? "Remove bookmark" : "Bookmark this page"}
        >
          <Bookmark size={16} fill={bookmarked ? "white" : "none"} />
        </button>

        {/* Translate — UI only */}
        <button
          className="w-10 h-10 flex items-center justify-center border-2 border-black rounded bg-white text-black hover:bg-orange-100 transition"
          title="Translate (coming soon)"
        >
          <Languages size={16} />
        </button>

        {/* Text size — CSS variable thật */}
        <button
          onClick={() => setFontIndex((i) => (i + 1) % FONT_SIZES.length)}
          className="w-10 h-10 flex items-center justify-center border-2 border-black rounded bg-[#F97316] text-white font-bold hover:bg-orange-600 transition"
          title={`Text size: ${textSizePx}px`}
          style={{ fontSize: `${11 + fontIndex * 2}px` }}
        >
          T
        </button>
      </div>
    </div>
  );
}
