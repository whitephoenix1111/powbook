"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Headphones, Radio, BookMarked } from "lucide-react";
import { ALL_BOOKS, ACTIVE_BOOK, type Book } from "@/lib/mockData";

/* ── 4 category cards ── */
const CATEGORIES = [
  { key: "ebook" as Book["type"],     label: "E-Books",    icon: BookOpen,   bg: "#F5C842", count: "1,240 titles" },
  { key: "audiobook" as Book["type"], label: "Audiobooks", icon: Headphones, bg: "#E8580A", count: "890 titles",  light: true },
  { key: "podcast" as Book["type"],   label: "Podcasts",   icon: Radio,      bg: "#1A1410", count: "320 shows",  light: true },
  { key: "comic" as Book["type"],     label: "Comics",     icon: BookMarked, bg: "#D9CFBE", count: "460 issues" },
];

/* ── Pool sách ── */
const ALL_POOL: Book[] = [ACTIVE_BOOK, ...ALL_BOOKS].filter(
  (b, i, arr) => arr.findIndex((x) => x.id === b.id) === i
);

/* ────────────────────────────────────────────────
   Page component
   Shell (Sidebar + Navbar) được app/(main)/layout.tsx xử lý.
──────────────────────────────────────────────── */
export default function CategoryPage() {
  const [activeKey, setActiveKey] = useState<Book["type"]>("ebook");

  const filtered = ALL_POOL.filter((b) => b.type === activeKey);

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6 pb-32 space-y-6">

      {/* ── 4 category cards ── */}
      <div className="grid grid-cols-4 gap-4">
        {CATEGORIES.map(({ key, label, icon: Icon, bg, count, light }) => (
          <button
            key={key}
            onClick={() => setActiveKey(key)}
            className={`relative flex flex-col justify-between rounded-2xl p-5 h-32 border-2 transition-all text-left
              ${activeKey === key
                ? "border-brand shadow-lg scale-[1.02]"
                : "border-warm-border hover:border-brand/40 hover:shadow-md"
              }`}
            style={{ background: bg }}
          >
            <Icon size={28} strokeWidth={1.8} className={light ? "text-white" : "text-ink"} />
            <div>
              <p className={`font-display font-bold text-[15px] leading-tight ${light ? "text-white" : "text-ink"}`}>
                {label}
              </p>
              <p className={`font-sans text-[11px] mt-0.5 ${light ? "text-white/70" : "text-ink-secondary"}`}>
                {count}
              </p>
            </div>
            {activeKey === key && (
              <div className="absolute top-2.5 right-3 w-2 h-2 rounded-full bg-brand" />
            )}
          </button>
        ))}
      </div>

      {/* ── Section header ── */}
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl font-bold text-ink">
          {CATEGORIES.find((c) => c.key === activeKey)?.label}
        </h2>
        <span className="font-sans text-sm text-ink-secondary">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Book grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
          {filtered.map((book) => (
            <Link key={book.id} href={`/book/${book.id}`} className="group flex flex-col gap-2 no-underline">
              <div
                className="relative w-full rounded-xl overflow-hidden border border-warm-border bg-surface-sunken group-hover:shadow-md transition-shadow"
                style={{ height: "170px" }}
              >
                <Image
                  src={book.cover}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="160px"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div>
                <p className="font-display text-[13px] font-semibold text-ink leading-tight line-clamp-2 group-hover:text-brand transition-colors">
                  {book.title}
                </p>
                <p className="font-sans text-[11px] text-ink-secondary mt-0.5">{book.author}</p>
                {book.length && (
                  <p className="font-sans text-[10px] text-ink-secondary/70 mt-0.5">{book.length}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-ink-secondary">
          <BookOpen size={40} strokeWidth={1.4} />
          <p className="font-sans text-sm">No titles in this category yet.</p>
        </div>
      )}

    </main>
  );
}
