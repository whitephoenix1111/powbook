"use client";

import { useState } from "react";
import { Book } from "@/lib/mockData";
import { Bookmark, Languages } from "lucide-react";

interface PdfViewerProps {
  book: Book;
}

const FONT_SIZES = ["text-xs", "text-sm", "text-base"];

export default function PdfViewer({ book }: PdfViewerProps) {
  const [fontIndex, setFontIndex] = useState(1);
  const [bookmarked, setBookmarked] = useState(false);

  const pages = book.pages ?? [];
  const leftPage = pages[0];
  const rightPage = pages[1];
  const fontSize = FONT_SIZES[fontIndex];

  return (
    <div className="flex flex-1 h-full items-stretch gap-3 px-6 pt-6 overflow-hidden">
      {/* ── Book frame (2 columns) — full height, upright rectangle ── */}
      <div className="flex flex-1 h-full border-2 border-black overflow-hidden bg-[#FDFAF4]">
        {/* Left page */}
        <div className="flex flex-col flex-1 border-r-2 border-black px-10 py-8 overflow-hidden">
          {leftPage ? (
            <>
              {leftPage.chapter && (
                <p className={`font-bold ${fontSize} mb-4 whitespace-pre-line font-mono flex-shrink-0`}>
                  {leftPage.chapter}
                </p>
              )}
              <p className={`${fontSize} font-mono leading-relaxed text-justify overflow-hidden`}>
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
            <p className={`${fontSize} font-mono leading-relaxed text-justify overflow-hidden`}>
              {rightPage.content}
            </p>
          ) : (
            <p className="text-gray-400 font-mono text-sm">No content</p>
          )}
          {book.description && (
            <>
              <hr className="my-6 border-black/20 flex-shrink-0" />
              <p className={`${fontSize} font-mono leading-relaxed text-justify text-gray-600 overflow-hidden`}>
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
        <button
          onClick={() => setBookmarked((v) => !v)}
          className={`w-10 h-10 flex items-center justify-center border-2 border-black rounded transition ${
            bookmarked
              ? "bg-[#F97316] text-white"
              : "bg-white text-black hover:bg-orange-100"
          }`}
          title="Bookmark"
        >
          <Bookmark size={16} />
        </button>
        <button
          className="w-10 h-10 flex items-center justify-center border-2 border-black rounded bg-white text-black hover:bg-orange-100 transition"
          title="Translate (coming soon)"
        >
          <Languages size={16} />
        </button>
        <button
          onClick={() => setFontIndex((i) => (i + 1) % FONT_SIZES.length)}
          className="w-10 h-10 flex items-center justify-center border-2 border-black rounded bg-[#F97316] text-white font-bold text-sm hover:bg-orange-600 transition"
          title="Text size"
        >
          T
        </button>
      </div>
    </div>
  );
}
