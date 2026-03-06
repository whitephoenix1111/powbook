"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpen, Headphones } from "lucide-react";
import { ALL_BOOKS, ACTIVE_BOOK, type Book, type Genre } from "@/lib/mockData";
import { useBookPanelStore } from "@/lib/store/bookPanelStore";

/* ── Content type tabs ── */
type ContentTab = "E-Books" | "Audiobooks";
const CONTENT_TABS: ContentTab[] = ["E-Books", "Audiobooks"];

/* ── Genre tabs ── */
type GenreTab = "All" | Genre;
const GENRE_TABS: { key: GenreTab; label: string }[] = [
  { key: "All",                 label: "All"           },
  { key: "history",             label: "History"       },
  { key: "fiction",             label: "Fiction"       },
  { key: "science-technology",  label: "Sci & Tech"    },
  { key: "dark-thriller",       label: "Dark & Thriller" },
];

/* ── Full book pool (dedup) ── */
const ALL_POOL: Book[] = [ACTIVE_BOOK, ...ALL_BOOKS].filter(
  (b, i, arr) => arr.findIndex((x) => x.id === b.id) === i
);

/* ────────────────────────────────────────────────
   Page component
──────────────────────────────────────────────── */
export default function CategoryPage() {
  const [contentTab, setContentTab] = useState<ContentTab>("E-Books");
  const [genreTab, setGenreTab]     = useState<GenreTab>("All");
  const { selectedBook, toggle }    = useBookPanelStore();

  /* Filter chiều 1: content type */
  const byType = ALL_POOL.filter((b) =>
    contentTab === "E-Books" ? !!b.pages : !!b.audioUrl
  );

  /* Filter chiều 2: genre */
  const filtered =
    genreTab === "All"
      ? byType
      : byType.filter((b) => b.genres.includes(genreTab as Genre));

  return (
    <main className="flex-1 px-6 py-6 space-y-6">

      {/* ── Content type tabs ── */}
      <div className="flex items-center gap-2">
        {CONTENT_TABS.map((tab) => {
          const Icon = tab === "E-Books" ? BookOpen : Headphones;
          return (
            <button
              key={tab}
              onClick={() => { setContentTab(tab); setGenreTab("All"); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-[13px] font-medium border-2 transition-all
                ${contentTab === tab
                  ? "bg-brand text-white border-brand shadow-sm"
                  : "bg-surface-card border-warm-border text-ink-secondary hover:border-brand/40 hover:text-ink"
                }`}
            >
              <Icon size={15} strokeWidth={1.9} />
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── Genre sub-tabs ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {GENRE_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setGenreTab(key)}
            className={`px-4 py-1.5 rounded-full font-sans text-[12px] font-medium border transition-all
              ${genreTab === key
                ? "bg-ink text-surface-card border-ink"
                : "bg-surface-card border-warm-border text-ink-secondary hover:border-ink/30 hover:text-ink"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Section header ── */}
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl font-bold text-ink">
          {contentTab}
          {genreTab !== "All" && (
            <span className="ml-2 text-brand">
              · {GENRE_TABS.find((g) => g.key === genreTab)?.label}
            </span>
          )}
        </h2>
        <span className="font-sans text-sm text-ink-secondary">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Book grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
          {filtered.map((book) => (
            <button
              key={book.id}
              onClick={() => toggle(book)}
              className={`group flex flex-col gap-2 text-left transition-all
                ${selectedBook?.id === book.id ? "opacity-100" : ""}`}
            >
              <div
                className={`relative w-full rounded-xl overflow-hidden bg-surface-sunken transition-all
                  ${
                    selectedBook?.id === book.id
                      ? "border-2 border-brand shadow-md shadow-brand/15"
                      : "border border-warm-border group-hover:shadow-md"
                  }`}
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
                <p className={`font-display text-[13px] font-semibold leading-tight line-clamp-2 transition-colors
                  ${selectedBook?.id === book.id ? "text-brand" : "text-ink group-hover:text-brand"}`}>
                  {book.title}
                </p>
                <p className="font-sans text-[11px] text-ink-secondary mt-0.5">{book.author}</p>
                {book.length && (
                  <p className="font-sans text-[10px] text-ink-secondary/70 mt-0.5">{book.length}</p>
                )}
              </div>
            </button>
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
