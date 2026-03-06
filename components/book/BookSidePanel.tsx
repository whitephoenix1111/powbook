"use client";

import Image from "next/image";
import Link from "next/link";
import { Download, Bookmark, ListPlus, Play, BookOpen, Star, X } from "lucide-react";
import { useAudioStore } from "@/lib/store/audioStore";
import { useBookPanelStore } from "@/lib/store/bookPanelStore";
import type { Book } from "@/lib/mockData";

interface BookSidePanelProps {
  book: Book;
}

const ICON_ACTIONS = [
  { icon: Download, label: "Download" },
  { icon: Bookmark, label: "Save"     },
  { icon: ListPlus, label: "Add to List" },
];

export default function BookSidePanel({ book }: BookSidePanelProps) {
  const setBook = useAudioStore((s) => s.setBook);
  const close   = useBookPanelStore((s) => s.close);

  const isEbook     = !!book.pages;
  const isAudiobook = !!book.audioUrl;

  function handlePlay() {
    if (!book.audioUrl) return;
    setBook(book, book.audioUrl);
  }

  return (
    <aside className="flex flex-col w-[280px] min-w-[280px] flex-shrink-0 bg-surface-raised">

      {/* Book header */}
      <div className="flex gap-3 p-4 border-b border-warm-border">
        <div className="relative flex-shrink-0 w-[68px] h-[88px] rounded-md overflow-hidden border border-warm-border bg-surface-sunken">
          <Image src={book.cover} alt={book.title} fill className="object-cover" sizes="68px" />
        </div>
        <div className="flex flex-col justify-center gap-1 min-w-0 flex-1">
          <h2 className="font-display text-[14px] font-bold text-ink leading-tight">
            {book.title}
          </h2>
          <p className="font-sans text-[12px] text-ink-secondary">
            By: <span className="underline cursor-pointer text-brand">{book.author}</span>
          </p>
          {book.narrator && (
            <p className="font-sans text-[12px] text-ink-secondary">
              Narrator: <span className="underline cursor-pointer text-brand">{book.narrator}</span>
            </p>
          )}
        </div>
        {/* Close button */}
        <button
          onClick={close}
          className="self-start flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-ink-secondary hover:bg-surface-sunken hover:text-ink transition-colors"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Action buttons — render dựa vào optional fields */}
      <div className="flex flex-col gap-2 p-4 border-b border-warm-border">

        {/* Read button — chỉ hiện nếu có pages */}
        {isEbook && (
          <Link
            href={`/book/${book.id}`}
            className="w-full py-2.5 rounded-lg border border-ink text-ink text-[13px] font-medium font-sans transition-colors hover:bg-ink hover:text-surface-card text-center flex items-center justify-center gap-2 no-underline"
          >
            <BookOpen size={14} strokeWidth={1.9} />
            Read
          </Link>
        )}

        {/* Play button — chỉ hiện nếu có audioUrl */}
        {isAudiobook && (
          <button
            onClick={handlePlay}
            className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 bg-brand text-surface-card text-[13px] font-medium font-sans transition-opacity hover:opacity-90"
          >
            <Play size={14} fill="white" strokeWidth={0} />
            {isEbook ? "Play Audiobook" : "Play Sample"}
          </button>
        )}

        {/* Icon actions */}
        <div className="flex border border-warm-border rounded-lg overflow-hidden mt-1">
          {ICON_ACTIONS.map(({ icon: Icon, label }, i) => (
            <button
              key={label}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-ink-secondary font-sans hover:bg-brand-muted transition-colors
                ${i < 2 ? "border-r border-warm-border" : ""}`}
            >
              <Icon size={16} strokeWidth={1.8} />
              <span className="text-[10px]">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="p-4 border-b border-warm-border">
        <table className="w-full font-sans text-[12px]">
          <tbody>
            {[
              { label: "Rating",    value: null },
              { label: "Length",    value: book.length    ?? "—" },
              { label: "Format",    value: book.format    ?? "—" },
              { label: "Publisher", value: book.publisher ?? "—" },
              { label: "Released",  value: book.released  ?? "—" },
            ].map(({ label, value }) => (
              <tr key={label}>
                <td className="py-1 pr-3 text-ink-secondary whitespace-nowrap">{label}</td>
                <td className="text-ink">
                  {label === "Rating" ? (
                    <span className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={10} fill="var(--color-brand)" stroke="var(--color-brand)" strokeWidth={1} />
                      ))}
                      <span className="text-ink-secondary">({book.ratingCount})</span>
                    </span>
                  ) : value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Description */}
      {book.description && (
        <div className="p-4">
          <p className="font-sans text-[12px] text-ink leading-relaxed">
            {book.description}
          </p>
        </div>
      )}
    </aside>
  );
}
