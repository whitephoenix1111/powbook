"use client";

import { useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { getBookById } from "@/lib/mockData";
import { useAudioStore } from "@/lib/store/audioStore";
import Sidebar from "@/components/layout/Sidebar";
import PdfViewer from "@/components/viewer/PdfViewer";
import AudioPlayer from "@/components/player/AudioPlayer";

export default function ReaderPage() {
  const { id } = useParams<{ id: string }>();
  const book = getBookById(id);
  const { setBook, currentBook } = useAudioStore();

  useEffect(() => {
    if (book && book.audioUrl) {
      setBook(book, book.audioUrl);
    }
  }, [book, setBook]);

  if (!book) return notFound();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F0EBE0]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Navbar strip */}
        <div className="flex items-center gap-4 px-6 py-3 border-b-2 border-black bg-[#F5C842]">
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
          <PdfViewer book={book} />
        </div>

        {/* Audio Player — có margin trái phải */}
        {currentBook && <AudioPlayer />}
      </div>
    </div>
  );
}
