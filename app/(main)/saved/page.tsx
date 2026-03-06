"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, BookOpen, Download, Heart, ShoppingCart, Check } from "lucide-react";
import { type Book } from "@/lib/mockData";
import { useBookPanelStore } from "@/lib/store/bookPanelStore";
import { useLibraryStore } from "@/lib/store/libraryStore";

const TABS = ["Titles", "Wishlist", "Following", "Lists", "Notebook", "History"] as const;
type Tab = (typeof TABS)[number];

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Titles");
  const [query, setQuery] = useState("");
  const { toggle, selectedBook } = useBookPanelStore();
  const { ownedBooks, wishlist, acquire, removeWishlist, toggleWishlist, isOwned, isWishlisted } = useLibraryStore();

  const activeList: Book[] = activeTab === "Titles" ? ownedBooks : activeTab === "Wishlist" ? wishlist : [];

  const filtered = useMemo(
    () =>
      activeList.filter(
        (b) =>
          b.title.toLowerCase().includes(query.toLowerCase()) ||
          b.author.toLowerCase().includes(query.toLowerCase())
      ),
    [query, activeList]
  );

  return (
    <main className="flex-1 px-6 py-6 space-y-5">
      <h1 className="font-display text-2xl font-bold text-ink">My Library</h1>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-warm-border">
        {TABS.map((tab) => {
          const count = tab === "Titles" ? ownedBooks.length : tab === "Wishlist" ? wishlist.length : null;
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setQuery(""); }}
              className={`px-4 py-2 font-sans text-sm font-medium transition-colors border-b-2 -mb-px
                ${activeTab === tab
                  ? "border-brand text-brand"
                  : "border-transparent text-ink-secondary hover:text-ink"
                }`}
            >
              {tab}
              {count !== null && count > 0 && (
                <span className="ml-1.5 font-sans text-[10px] bg-brand text-white rounded-full px-1.5 py-0.5">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Titles & Wishlist — active content */}
      {(activeTab === "Titles" || activeTab === "Wishlist") ? (
        <>
          {/* Search */}
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary" />
            <input
              type="text"
              placeholder={`Search in ${activeTab}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2 font-sans text-sm rounded-lg border border-warm-border bg-surface-card text-ink placeholder:text-ink-secondary focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((book) => (
                activeTab === "Titles" ? (
                  <OwnedBookCard
                    key={book.id}
                    book={book}
                    isActive={selectedBook?.id === book.id}
                    onSelect={() => toggle(book)}
                  />
                ) : (
                  <WishlistBookCard
                    key={book.id}
                    book={book}
                    isActive={selectedBook?.id === book.id}
                    onSelect={() => toggle(book)}
                    onRemove={() => removeWishlist(book.id)}
                    onBuy={() => acquire(book)}
                    owned={isOwned(book.id)}
                  />
                )
              ))}
            </div>
          ) : (
            <EmptyState tab={activeTab} hasQuery={!!query} />
          )}
        </>
      ) : (
        /* Other tabs — coming soon */
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-ink-secondary">
          <BookOpen size={40} strokeWidth={1.4} />
          <p className="font-sans text-sm font-medium">{activeTab}</p>
          <p className="font-sans text-xs">Coming soon</p>
        </div>
      )}
    </main>
  );
}

/* ── Empty state ── */
function EmptyState({ tab, hasQuery }: { tab: Tab; hasQuery: boolean }) {
  const message = hasQuery
    ? "No books match your search."
    : tab === "Titles"
      ? "Your library is empty. Buy or get free books from the Category page."
      : "No books in your wishlist yet.";
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-ink-secondary">
      <BookOpen size={36} strokeWidth={1.4} />
      <p className="font-sans text-sm text-center max-w-xs">{message}</p>
    </div>
  );
}

/* ── Owned Book Card (Titles tab) ── */
function OwnedBookCard({
  book,
  isActive,
  onSelect,
}: {
  book: Book;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`flex gap-3 rounded-2xl border bg-surface-card p-4 cursor-pointer transition-all
        ${isActive
          ? "border-brand border-2 shadow-md shadow-brand/15"
          : "border-warm-border hover:shadow-md hover:border-brand/40"
        }`}
    >
      <div className="relative flex-shrink-0 w-[72px] h-[96px] rounded-lg overflow-hidden border border-warm-border bg-surface-sunken">
        <Image src={book.cover} alt={book.title} fill className="object-cover" sizes="72px"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      </div>
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        <h3 className={`font-display text-[14px] font-bold leading-tight line-clamp-2 transition-colors
          ${isActive ? "text-brand" : "text-ink"}`}>
          {book.title}
        </h3>
        <p className="font-sans text-[12px] text-ink-secondary">{book.author}</p>
        {book.description && (
          <p className="font-sans text-[11px] text-ink-secondary leading-relaxed line-clamp-2 mt-0.5">
            {book.description}
          </p>
        )}
        <div
          className="flex items-center gap-2 mt-auto pt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="flex-1 py-1.5 rounded-lg bg-brand/10 text-brand font-sans text-[12px] font-medium text-center cursor-pointer hover:bg-brand/15 transition-colors">
            View Details
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 font-sans text-[11px] font-semibold">
            <Check size={12} strokeWidth={2.5} /> Owned
          </span>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-warm-border bg-surface-raised text-ink-secondary hover:bg-surface-sunken transition-colors"
            title="Download"
          >
            <Download size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Wishlist Book Card ── */
function WishlistBookCard({
  book,
  isActive,
  onSelect,
  onRemove,
  onBuy,
  owned,
}: {
  book: Book;
  isActive: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onBuy: () => void;
  owned: boolean;
}) {
  const priceLabel = book.isFree ? "Get Free" : `Buy · $${book.price?.toFixed(2)}`;

  return (
    <div
      onClick={onSelect}
      className={`flex gap-3 rounded-2xl border bg-surface-card p-4 cursor-pointer transition-all
        ${isActive
          ? "border-brand border-2 shadow-md shadow-brand/15"
          : "border-warm-border hover:shadow-md hover:border-brand/40"
        }`}
    >
      <div className="relative flex-shrink-0 w-[72px] h-[96px] rounded-lg overflow-hidden border border-warm-border bg-surface-sunken">
        <Image src={book.cover} alt={book.title} fill className="object-cover" sizes="72px"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        {/* Price badge */}
        <span className={`absolute bottom-1 left-1 right-1 text-center rounded-md font-sans text-[9px] font-bold py-0.5
          ${book.isFree ? "bg-emerald-500 text-white" : "bg-ink/80 text-white"}`}>
          {book.isFree ? "FREE" : `$${book.price?.toFixed(2)}`}
        </span>
      </div>
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        <h3 className={`font-display text-[14px] font-bold leading-tight line-clamp-2 transition-colors
          ${isActive ? "text-brand" : "text-ink"}`}>
          {book.title}
        </h3>
        <p className="font-sans text-[12px] text-ink-secondary">{book.author}</p>
        {book.description && (
          <p className="font-sans text-[11px] text-ink-secondary leading-relaxed line-clamp-2 mt-0.5">
            {book.description}
          </p>
        )}
        <div
          className="flex items-center gap-2 mt-auto pt-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Buy / Get Free */}
          <button
            onClick={onBuy}
            disabled={owned}
            className={`flex-1 py-1.5 rounded-lg font-sans text-[12px] font-semibold transition-all flex items-center justify-center gap-1.5
              ${owned
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                : book.isFree
                  ? "bg-brand text-white hover:bg-brand/90"
                  : "bg-ink text-white hover:bg-ink/85"
              }`}
          >
            {owned ? <><Check size={13} strokeWidth={2.5} /> In Library</> : <><ShoppingCart size={12} strokeWidth={2} /> {priceLabel}</>}
          </button>
          {/* Remove from wishlist */}
          <button
            onClick={onRemove}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
            title="Remove from wishlist"
          >
            <Heart size={14} strokeWidth={2} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
