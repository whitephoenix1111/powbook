"use client";

import { useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { getBookById } from "@/lib/mockData";
import { useAudioStore } from "@/lib/store/audioStore";
import BookTextViewer from "@/components/viewer/BookTextViewer";

/* ────────────────────────────────────────────────
   Book Reader Page
   Shell (Sidebar + Navbar) được app/(main)/layout.tsx xử lý.
   Page này chỉ chứa title strip + viewer.
──────────────────────────────────────────────── */
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
    /* flex-1 + flex-col: lấp đầy vùng content trong layout */
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* Title strip — ngay dưới Navbar */}
      <div className="flex items-center gap-4 px-6 py-2.5 border-b-2 border-black bg-yellow flex-shrink-0">
        <span className="font-bold font-mono text-sm truncate">{book.title}</span>
        {book.author && (
          <span className="text-xs font-mono text-black/60">— {book.author}</span>
        )}
        {book.narrator && (
          <span className="text-xs font-mono text-black/60">
            | Narrator: {book.narrator}
          </span>
        )}
      </div>

      {/* Reader content */}
      <div className="flex flex-1 overflow-hidden">
        <BookTextViewer book={book} />
      </div>

    </div>
  );
}
