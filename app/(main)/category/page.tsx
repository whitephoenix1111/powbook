"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { BookOpen, Headphones, ChevronRight, Heart, Check, Search, X } from "lucide-react";
import { ALL_BOOKS, ACTIVE_BOOK, type Book, type Genre } from "@/lib/mockData";
import { useBookPanelStore } from "@/lib/store/bookPanelStore";
import { useLibraryStore } from "@/lib/store/libraryStore";

/* ── Types ── */
type ContentTab = "E-Books" | "Audiobooks";
type GenreTab   = "All" | Genre;

const GENRE_TABS: { key: GenreTab; label: string }[] = [
  { key: "All",                label: "All"             },
  { key: "history",            label: "History"         },
  { key: "fiction",            label: "Fiction"         },
  { key: "science-technology", label: "Sci & Tech"      },
  { key: "dark-thriller",      label: "Dark & Thriller" },
];

/* ── Book pool ── */
const ALL_POOL: Book[] = [ACTIVE_BOOK, ...ALL_BOOKS].filter(
  (b, i, arr) => arr.findIndex((x) => x.id === b.id) === i
);

/* ────────────────────────────────────────────────
   Page
──────────────────────────────────────────────── */
export default function CategoryPage() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as ContentTab) ?? "E-Books";

  const [contentTab, setContentTab] = useState<ContentTab>(initialType);
  const [genreTab,   setGenreTab]   = useState<GenreTab>("All");
  const [query,      setQuery]      = useState("");
  const { selectedBook, toggle }    = useBookPanelStore();

  useEffect(() => {
    const t = searchParams.get("type") as ContentTab | null;
    if (t === "E-Books" || t === "Audiobooks") setContentTab(t);
    setQuery(""); // reset search khi đổi type qua URL
  }, [searchParams]);
  const { isOwned, isWishlisted, acquire, toggleWishlist } = useLibraryStore();

  /* Filter */
  const byType = ALL_POOL.filter((b) =>
    contentTab === "E-Books" ? !!b.pages : !!b.audioUrl
  );
  const byGenre =
    genreTab === "All"
      ? byType
      : byType.filter((b) => b.genres.includes(genreTab as Genre));
  const filtered = useMemo(
    () =>
      query.trim() === ""
        ? byGenre
        : byGenre.filter(
            (b) =>
              b.title.toLowerCase().includes(query.toLowerCase()) ||
              b.author.toLowerCase().includes(query.toLowerCase())
          ),
    [byGenre, query]
  );

  return (
    <div className="flex min-h-screen">

      {/* ══════════════════════════════════
          LEFT SIDEBAR — Filter panel
      ══════════════════════════════════ */}
      <aside className="w-[220px] flex-shrink-0 border-r border-warm-border bg-surface-raised px-5 py-6 flex flex-col gap-8 self-stretch">

        {/* Format */}
        <div>
          <p className="font-sans text-[10px] font-semibold text-ink-secondary uppercase tracking-widest mb-3">
            Format
          </p>
          <div className="flex flex-col gap-1.5">
            {(["E-Books", "Audiobooks"] as ContentTab[]).map((tab) => {
              const Icon = tab === "E-Books" ? BookOpen : Headphones;
              const active = contentTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => { setContentTab(tab); setGenreTab("All"); }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-sans text-[13px] font-medium text-left transition-all
                    ${active
                      ? "bg-brand text-white shadow-sm"
                      : "text-ink-secondary hover:bg-surface-sunken hover:text-ink"
                    }`}
                >
                  <Icon size={14} strokeWidth={1.9} />
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-warm-border" />

        {/* Genre */}
        <div>
          <p className="font-sans text-[10px] font-semibold text-ink-secondary uppercase tracking-widest mb-3">
            Genre
          </p>
          <div className="flex flex-col gap-1">
            {GENRE_TABS.map(({ key, label }) => {
              const active = genreTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setGenreTab(key)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl font-sans text-[13px] text-left transition-all
                    ${active
                      ? "bg-ink text-white font-medium"
                      : "text-ink-secondary hover:bg-surface-sunken hover:text-ink"
                    }`}
                >
                  <span>{label}</span>
                  {active && <ChevronRight size={12} strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1" />

        {/* Result count */}
        <div className="font-sans text-[11px] text-ink-secondary border border-warm-border rounded-xl px-3 py-2.5 text-center">
          <span className="font-bold text-ink text-[16px] block font-display">{filtered.length}</span>
          title{filtered.length !== 1 ? "s" : ""} found
        </div>
      </aside>

      {/* ══════════════════════════════════
          RIGHT — Header + Book Grid
      ══════════════════════════════════ */}
      <main className="flex-1 min-w-0 px-7 py-6 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-[24px] font-bold text-ink leading-none">
              {contentTab}
              {genreTab !== "All" && (
                <span className="text-brand ml-2">
                  · {GENRE_TABS.find((g) => g.key === genreTab)?.label}
                </span>
              )}
            </h1>
            <p className="font-sans text-[13px] text-ink-secondary mt-1">
              Browse our collection of {contentTab.toLowerCase()}
            </p>
          </div>

          {/* Search bar */}
          <div className="relative flex-shrink-0 w-[240px]">
            <Search
              size={14}
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or author…"
              className="w-full pl-8 pr-8 py-2 rounded-xl border border-warm-border bg-surface-raised font-sans text-[13px] text-ink placeholder:text-ink-secondary/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-ink transition-colors"
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-5 gap-y-8">
            {filtered.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                contentTab={contentTab}
                isActive={selectedBook?.id === book.id}
                owned={isOwned(book.id)}
                wishlisted={isWishlisted(book.id)}
                onSelect={() => toggle(book)}
                onAcquire={(e) => { e.stopPropagation(); acquire(book); }}
                onWishlist={(e) => { e.stopPropagation(); toggleWishlist(book); }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-ink-secondary">
            <BookOpen size={40} strokeWidth={1.3} />
            <p className="font-sans text-sm">No titles in this category yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}

/* ────────────────────────────────────────────────
   BookCard
──────────────────────────────────────────────── */
function BookCard({
  book,
  contentTab,
  isActive,
  owned,
  wishlisted,
  onSelect,
  onAcquire,
  onWishlist,
}: {
  book: Book;
  contentTab: "E-Books" | "Audiobooks";
  isActive: boolean;
  owned: boolean;
  wishlisted: boolean;
  onSelect: () => void;
  onAcquire: (e: React.MouseEvent) => void;
  onWishlist: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onSelect}
      className="group flex flex-col cursor-pointer"
    >
      {/* ── Cover ── */}
      <div
        className={`relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-surface-sunken transition-all duration-200
          ${isActive
            ? "ring-2 ring-brand shadow-lg shadow-brand/20"
            : "ring-1 ring-warm-border group-hover:ring-brand/50 group-hover:shadow-lg group-hover:shadow-ink/10"
          }`}
      >
        <Image
          src={book.cover}
          alt={book.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />

        {/* Audio badge — chỉ khi ở E-Books tab */}
        {book.audioUrl && contentTab === "E-Books" && (
          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-ink/70 backdrop-blur-sm text-white font-sans text-[9px] font-bold uppercase tracking-wide">
            <Headphones size={8} strokeWidth={2.5} /> Audio
          </span>
        )}

        {/* Price / Owned badge — bottom-left */}
        <span className={`absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full font-sans text-[10px] font-bold tracking-wide
          ${owned
            ? "bg-emerald-500 text-white"
            : book.isFree
              ? "bg-white/90 text-emerald-600 border border-emerald-200"
              : "bg-white/90 text-ink border border-warm-border"
          }`}
        >
          {owned ? "✓ Owned" : (book.isFree ? "Free" : `${book.price?.toFixed(2)}`)}
        </span>

        {/* Wishlist heart — top-left */}
        {!owned && (
          <button
            onClick={onWishlist}
            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute top-2.5 left-2.5 w-7 h-7 flex items-center justify-center rounded-full backdrop-blur-sm transition-all
              ${wishlisted
                ? "bg-red-500 text-white opacity-100 shadow-sm"
                : "bg-ink/50 text-white opacity-0 group-hover:opacity-100"
              }`}
          >
            <Heart size={13} strokeWidth={2} fill={wishlisted ? "white" : "none"} />
          </button>
        )}

        {isActive && <div className="absolute inset-0 bg-brand/10" />}
      </div>

      {/* ── Info block — flex-1 so button always aligns at bottom ── */}
      <div className="flex flex-col flex-1 pt-3 gap-0">
        {/* Title */}
        <p className={`font-display text-[13px] font-semibold leading-snug line-clamp-2 mb-0.5 transition-colors
          ${isActive ? "text-brand" : "text-ink group-hover:text-brand"}`}>
          {book.title}
        </p>
        {/* Author */}
        <p className="font-sans text-[11px] text-ink-secondary truncate">
          {book.author}
        </p>

        {/* Spacer — pushes button to bottom regardless of content */}
        <div className="flex-1 min-h-[8px]" />

        {/* CTA */}
        <button
          onClick={onAcquire}
          disabled={owned}
          className={`mt-1.5 w-full py-2 rounded-lg font-sans text-[12px] font-semibold transition-all
            ${owned
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
              : book.isFree
                ? "bg-brand text-white hover:bg-brand/90 shadow-sm active:scale-95"
                : "bg-ink text-white hover:bg-ink/85 shadow-sm active:scale-95"
            }`}
        >
          {owned
            ? <span className="flex items-center justify-center gap-1.5"><Check size={13} strokeWidth={2.5} /> In Library</span>
            : book.isFree
              ? "Get Free"
              : "Buy \u00b7 $" + book.price?.toFixed(2)
          }
        </button>
      </div>
    </div>
  );
}
