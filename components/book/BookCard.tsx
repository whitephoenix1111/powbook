"use client";

import Image from "next/image";
import { Bookmark, Star } from "lucide-react";
import type { Book } from "@/lib/mockData";

interface BookCardProps {
  book: Book;
  onSelect?: (book: Book) => void;
  isActive?: boolean;
}

export default function BookCard({ book, onSelect, isActive }: BookCardProps) {
  return (
    <div
      className="flex-shrink-0 cursor-pointer group"
      style={{ width: "130px" }}
      onClick={() => onSelect?.(book)}
    >
      {/* Cover */}
      <div
        className={`relative w-full rounded-lg overflow-hidden mb-2 border transition-shadow group-hover:shadow-md bg-surface-sunken
          ${isActive ? "border-brand border-2" : "border-warm-border border"}`}
        style={{ height: "170px" }}
      >
        <Image
          src={book.cover}
          alt={book.title}
          fill
          className="object-cover"
          sizes="130px"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      {/* Info */}
      <div className="space-y-0.5">
        <h4 className="font-display text-[13px] font-semibold text-ink leading-tight line-clamp-2">
          {book.title}
        </h4>
        <p className="font-sans text-[11px] text-ink-secondary">
          {book.author}
        </p>

        {/* Rating row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={10}
                fill={i < book.rating ? "var(--color-brand)" : "none"}
                stroke={i < book.rating ? "var(--color-brand)" : "var(--color-warm-border)"}
                strokeWidth={1.5}
              />
            ))}
          </div>
          <Bookmark
            size={13}
            className="text-ink-secondary hover:fill-brand hover:text-brand cursor-pointer transition-colors"
            strokeWidth={1.5}
          />
        </div>
      </div>
    </div>
  );
}
