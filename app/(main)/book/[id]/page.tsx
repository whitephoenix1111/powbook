"use client";

import { useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { getBookById } from "@/lib/mockData";
import { useAudioStore } from "@/lib/store/audioStore";
import BookTextViewer from "@/components/viewer/BookTextViewer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const book = getBookById(id);
  const { setBook } = useAudioStore();

  useEffect(() => {
    if (book?.audioUrl) {
      setBook(book, book.audioUrl);
    }
  }, [book, setBook]);

  if (!book) return notFound();

  return (
    <div className="flex flex-col flex-1 overflow-hidden h-full">

      {/* ── Title strip ── */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-warm-border bg-surface-raised flex-shrink-0">
        <Link
          href="/"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-secondary hover:bg-surface-sunken hover:text-ink transition-colors flex-shrink-0"
        >
          <ArrowLeft size={14} strokeWidth={2} />
        </Link>

        <div className="w-px h-4 bg-warm-border" />

        <p className="font-display text-[14px] font-bold text-ink truncate">
          {book.title}
        </p>
        {book.author && (
          <span className="font-sans text-[12px] text-ink-secondary flex-shrink-0">
            — {book.author}
          </span>
        )}
        {book.narrator && (
          <>
            <div className="w-px h-3 bg-warm-border flex-shrink-0" />
            <span className="font-sans text-[12px] text-ink-secondary flex-shrink-0">
              Narrator: {book.narrator}
            </span>
          </>
        )}
      </div>

      {/* ── Reader ── */}
      <div className="flex flex-1 overflow-hidden">
        <BookTextViewer book={book} />
      </div>

    </div>
  );
}
