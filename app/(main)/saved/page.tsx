"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, BookOpen, Download, ListPlus, Star } from "lucide-react";
import { ALL_BOOKS, ACTIVE_BOOK, type Book } from "@/lib/mockData";
import { useBookPanelStore } from "@/lib/store/bookPanelStore";

/* ── Mock saved list ── */
const SAVED_BOOKS: (Book & { pagesLeft: number })[] = [
  { ...ACTIVE_BOOK,  pagesLeft: 312 },
  { ...ALL_BOOKS[0], pagesLeft: 189, description: "A portrait of the Jazz Age in all of its decadence and excess, The Great Gatsby follows Jay Gatsby as he pursues his illusive dream across the water." },
  { ...ALL_BOOKS[2], pagesLeft: 74,  description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it." },
  { ...ALL_BOOKS[6], pagesLeft: 201, description: "A spellbinding and humorous portrait of the fictional sport of Quidditch through the ages, for Potterheads everywhere." },
  { ...ALL_BOOKS[3], pagesLeft: 440, description: "The story of Philip Carey, an orphaned boy with a club foot, struggling to find meaning in his life through art, medicine, and love." },
];

const TABS = ["Titles", "Following", "Lists", "Notebook", "History"] as const;

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Titles");
  const [query, setQuery] = useState("");
  const { toggle, selectedBook } = useBookPanelStore();

  const filtered = useMemo(
    () =>
      SAVED_BOOKS.filter(
        (b) =>
          b.title.toLowerCase().includes(query.toLowerCase()) ||
          b.author.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <main className="flex-1 px-6 py-6 space-y-5">

      <h1 className="font-display text-2xl font-bold text-ink">My Library</h1>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-warm-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-sans text-sm font-medium transition-colors border-b-2 -mb-px
              ${activeTab === tab
                ? "border-brand text-brand"
                : "border-transparent text-ink-secondary hover:text-ink"
              }`}
          >
            {tab}
            {tab === "Titles" && (
              <span className="ml-1.5 font-sans text-[10px] bg-brand text-white rounded-full px-1.5 py-0.5">
                {SAVED_BOOKS.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "Titles" ? (
        <>
          {/* Search */}
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary" />
            <input
              type="text"
              placeholder="Search in Titles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2 font-sans text-sm rounded-lg border border-warm-border bg-surface-card text-ink placeholder:text-ink-secondary focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          {/* Grid 3 col */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((book) => (
                <SavedBookCard
                  key={book.id}
                  book={book}
                  isActive={selectedBook?.id === book.id}
                  onSelect={() => toggle(book)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-ink-secondary">
              <BookOpen size={36} strokeWidth={1.4} />
              <p className="font-sans text-sm">No books match your search.</p>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-ink-secondary">
          <BookOpen size={40} strokeWidth={1.4} />
          <p className="font-sans text-sm font-medium">{activeTab}</p>
          <p className="font-sans text-xs">Coming soon</p>
        </div>
      )}

    </main>
  );
}

/* SavedBookCard */
function SavedBookCard({
  book,
  isActive,
  onSelect,
}: {
  book: Book & { pagesLeft: number };
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`flex gap-3 rounded-2xl border bg-surface-card p-4 cursor-pointer transition-all
        ${
          isActive
            ? "border-brand border-2 shadow-md shadow-brand/15"
            : "border-warm-border hover:shadow-md hover:border-brand/40"
        }`}
    >
      <div className="relative flex-shrink-0 w-[72px] h-[96px] rounded-lg overflow-hidden border border-warm-border bg-surface-sunken">
        <Image
          src={book.cover}
          alt={book.title}
          fill
          className="object-cover"
          sizes="72px"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        <h3 className={`font-display text-[14px] font-bold leading-tight line-clamp-2 transition-colors
          ${isActive ? "text-brand" : "text-ink"}`}>
          {book.title}
        </h3>
        <p className="font-sans text-[12px] text-ink-secondary">{book.author}</p>
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
        {book.description && (
          <p className="font-sans text-[11px] text-ink-secondary leading-relaxed line-clamp-2 mt-0.5">
            {book.description}
          </p>
        )}
        <p className="font-mono text-[10px] text-ink-secondary/70 mt-auto">
          {book.pagesLeft} pages left
        </p>
        {/* Action row — stopPropagation để không trigger onSelect khi click icon */}
        <div
          className="flex items-center gap-2 mt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="flex-1 py-1.5 rounded-lg bg-brand/10 text-brand font-sans text-[12px] font-medium text-center">
            View Details
          </span>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-warm-border bg-surface-raised text-ink-secondary hover:bg-surface-sunken transition-colors"
            title="Download"
          >
            <Download size={14} />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-warm-border bg-surface-raised text-ink-secondary hover:bg-surface-sunken transition-colors"
            title="Add to List"
          >
            <ListPlus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
