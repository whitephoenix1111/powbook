"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { Search, BookOpen, Headphones, Download, Heart, ShoppingCart, Check, ListPlus, ChevronRight, Trash2, ArrowLeft, LogIn, Pencil } from "lucide-react";
import { type Book } from "@/lib/mockData";
import { useBookPanelStore } from "@/lib/store/bookPanelStore";
import { useLibraryStore, type BookList } from "@/lib/store/libraryStore";
import { useAuthStore } from "@/lib/store/authStore";
import Link from "next/link";

const TABS = ["Titles", "Wishlist", "Following", "Lists", "Notebook", "History"] as const;
type Tab = (typeof TABS)[number];

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Titles");
  const [query, setQuery] = useState("");
  const [openList, setOpenList] = useState<BookList | null>(null);
  const { toggle, selectedBook } = useBookPanelStore();
  const { ownedBooks, wishlist, lists, acquire, removeWishlist, isOwned, deleteList, removeFromList, renameList } = useLibraryStore();
  const { currentUser } = useAuthStore();
  const isLoggedIn = !!currentUser;

  useEffect(() => {
    if (openList) {
      const updated = lists.find((l) => l.id === openList.id);
      if (updated) setOpenList(updated);
    }
  }, [lists]);

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
          const count =
            tab === "Titles"   ? ownedBooks.length :
            tab === "Wishlist" ? wishlist.length :
            tab === "Lists"    ? (isLoggedIn ? lists.length : null) :
            null;
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setQuery(""); setOpenList(null); }}
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

      {/* ── Titles & Wishlist ── */}
      {(activeTab === "Titles" || activeTab === "Wishlist") ? (
        <>
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

      ) : activeTab === "Lists" ? (
        !isLoggedIn ? (
          <AuthGate />
        ) : openList ? (
          <div className="space-y-4">
            <button
              onClick={() => setOpenList(null)}
              className="flex items-center gap-1.5 font-sans text-[13px] text-ink-secondary hover:text-brand transition-colors"
            >
              <ArrowLeft size={14} strokeWidth={2} /> Back to Lists
            </button>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <InlineRename
                  name={openList.name}
                  onSave={(name) => renameList(openList.id, name)}
                  className="font-display text-[18px] font-bold text-ink"
                />
                <p className="font-sans text-[12px] text-ink-secondary mt-0.5">
                  {openList.books.length} {openList.books.length === 1 ? "book" : "books"}
                </p>
              </div>
              <button
                onClick={() => { deleteList(openList.id); setOpenList(null); }}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 font-sans text-[12px] transition-colors"
              >
                <Trash2 size={13} strokeWidth={2} /> Delete list
              </button>
            </div>
            {openList.books.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3 text-ink-secondary">
                <ListPlus size={36} strokeWidth={1.4} />
                <p className="font-sans text-sm">No books in this list yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {openList.books.map((book) => (
                  <ListBookCard
                    key={book.id}
                    book={book}
                    isActive={selectedBook?.id === book.id}
                    onSelect={() => toggle(book)}
                    onRemove={() => {
                      removeFromList(openList.id, book.id);
                      setOpenList((prev) =>
                        prev ? { ...prev, books: prev.books.filter((b) => b.id !== book.id) } : null
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {lists.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-3 text-ink-secondary">
                <ListPlus size={40} strokeWidth={1.4} />
                <p className="font-sans text-sm text-center max-w-xs">
                  No lists yet. Open any book and tap "Add to List" to create one.
                </p>
              </div>
            ) : (
              lists.map((list) => (
                <ListRow
                  key={list.id}
                  list={list}
                  onOpen={() => setOpenList(list)}
                  onRename={(name) => renameList(list.id, name)}
                />
              ))
            )}
          </div>
        )
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

/* ── ListRow ── */
function ListRow({ list, onOpen, onRename }: { list: BookList; onOpen: () => void; onRename: (name: string) => void }) {
  const [renaming, setRenaming] = useState(false);
  return (
    <div className="w-full flex items-center gap-4 p-4 rounded-2xl border border-warm-border bg-surface-card hover:border-brand/40 hover:shadow-md transition-all group">
      <button onClick={onOpen} className="relative w-14 h-14 flex-shrink-0">
        {list.books.slice(0, 3).map((b, i) => (
          <div key={b.id} className="absolute rounded-md overflow-hidden border border-warm-border bg-surface-sunken"
            style={{ width: 36, height: 48, left: i * 8, top: i * -4 + 8, zIndex: i, boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}>
            <Image src={b.cover} alt={b.title} fill className="object-cover" sizes="36px"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
        ))}
        {list.books.length === 0 && (
          <div className="w-14 h-14 rounded-xl bg-surface-sunken border border-warm-border flex items-center justify-center">
            <ListPlus size={18} strokeWidth={1.5} className="text-ink-secondary/40" />
          </div>
        )}
      </button>
      <div className="flex-1 min-w-0">
        {renaming ? (
          <InlineRename name={list.name} autoFocus
            onSave={(name) => { onRename(name); setRenaming(false); }}
            onCancel={() => setRenaming(false)}
            className="font-display text-[15px] font-bold text-ink" />
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={onOpen} className="font-display text-[15px] font-bold text-ink text-left hover:text-brand transition-colors">{list.name}</button>
            <button onClick={(e) => { e.stopPropagation(); setRenaming(true); }} title="Rename list"
              className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md text-ink-secondary hover:bg-surface-sunken hover:text-brand transition-all">
              <Pencil size={12} strokeWidth={2} />
            </button>
          </div>
        )}
        <p className="font-sans text-[12px] text-ink-secondary mt-0.5">{list.books.length} {list.books.length === 1 ? "book" : "books"}</p>
      </div>
      <button onClick={onOpen}><ChevronRight size={16} strokeWidth={2} className="text-ink-secondary/50 flex-shrink-0" /></button>
    </div>
  );
}

/* ── InlineRename ── */
function InlineRename({ name, onSave, onCancel, autoFocus = false, className = "" }: {
  name: string; onSave: (name: string) => void; onCancel?: () => void; autoFocus?: boolean; className?: string;
}) {
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);
  function commit() {
    const trimmed = value.trim();
    if (trimmed && trimmed !== name) onSave(trimmed);
    else onCancel?.();
  }
  return (
    <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } if (e.key === "Escape") { e.preventDefault(); onCancel?.(); } }}
      onClick={(e) => e.stopPropagation()}
      className={`bg-transparent border-b-2 border-brand outline-none w-full leading-tight ${className}`}
      style={{ minWidth: 0 }} />
  );
}

/* ── Auth Gate ── */
function AuthGate() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center">
        <LogIn size={24} strokeWidth={1.6} className="text-brand" />
      </div>
      <div className="text-center">
        <p className="font-display text-[16px] font-bold text-ink">Sign in to use Lists</p>
        <p className="font-sans text-[13px] text-ink-secondary mt-1 max-w-xs">Create and manage your personal reading lists with a free account.</p>
      </div>
      <div className="flex gap-3 mt-1">
        <Link href="/signin" className="px-5 py-2.5 rounded-xl bg-brand text-white font-sans text-[13px] font-semibold hover:bg-brand/90 transition-colors no-underline">Sign In</Link>
        <Link href="/login" className="px-5 py-2.5 rounded-xl border border-warm-border text-ink font-sans text-[13px] font-medium hover:bg-surface-sunken transition-colors no-underline">Create Account</Link>
      </div>
    </div>
  );
}

/* ── Empty state ── */
function EmptyState({ tab, hasQuery }: { tab: Tab; hasQuery: boolean }) {
  const message = hasQuery ? "No books match your search."
    : tab === "Titles" ? "Your library is empty. Buy or get free books from the Category page."
    : "No books in your wishlist yet.";
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-ink-secondary">
      <BookOpen size={36} strokeWidth={1.4} />
      <p className="font-sans text-sm text-center max-w-xs">{message}</p>
    </div>
  );
}

/* ── Owned Book Card ── */
function OwnedBookCard({ book, isActive, onSelect }: { book: Book; isActive: boolean; onSelect: () => void }) {
  const isEbook     = !!book.pages;
  const isAudiobook = !!book.audioUrl;

  // Label + icon theo content type
  const typeBadge = isEbook && isAudiobook
    ? { label: "E-Book + Audio", icon: <><BookOpen size={10} strokeWidth={2.5} /><Headphones size={10} strokeWidth={2.5} /></> }
    : isAudiobook
      ? { label: "Audiobook",    icon: <Headphones size={10} strokeWidth={2.5} /> }
      : { label: "E-Book",       icon: <BookOpen size={10} strokeWidth={2.5} /> };

  return (
    <div onClick={onSelect} className={`flex gap-3 rounded-2xl border bg-surface-card p-4 cursor-pointer transition-all ${isActive ? "border-brand border-2 shadow-md shadow-brand/15" : "border-warm-border hover:shadow-md hover:border-brand/40"}`}>
      <div className="relative flex-shrink-0 w-[72px] h-[96px] rounded-lg overflow-hidden border border-warm-border bg-surface-sunken">
        <Image src={book.cover} alt={book.title} fill className="object-cover" sizes="72px"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      </div>
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        {/* Type badge */}
        <span className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full bg-brand/10 text-brand font-sans text-[10px] font-semibold">
          {typeBadge.icon}
          {typeBadge.label}
        </span>

        <h3 className={`font-display text-[14px] font-bold leading-tight line-clamp-2 transition-colors ${isActive ? "text-brand" : "text-ink"}`}>{book.title}</h3>
        <p className="font-sans text-[12px] text-ink-secondary">{book.author}</p>
        {book.description && <p className="font-sans text-[11px] text-ink-secondary leading-relaxed line-clamp-2 mt-0.5">{book.description}</p>}

        <div className="flex items-center gap-2 mt-auto pt-2" onClick={(e) => e.stopPropagation()}>
          <span className="flex-1 py-1.5 rounded-lg bg-brand/10 text-brand font-sans text-[12px] font-medium text-center cursor-pointer hover:bg-brand/15 transition-colors">View Details</span>
          <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 font-sans text-[11px] font-semibold"><Check size={12} strokeWidth={2.5} /> Owned</span>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-warm-border bg-surface-raised text-ink-secondary hover:bg-surface-sunken transition-colors" title="Download"><Download size={14} /></button>
        </div>
      </div>
    </div>
  );
}

/* ── List Book Card ── */
function ListBookCard({ book, isActive, onSelect, onRemove }: { book: Book; isActive: boolean; onSelect: () => void; onRemove: () => void }) {
  return (
    <div onClick={onSelect} className={`flex gap-3 rounded-2xl border bg-surface-card p-4 cursor-pointer transition-all ${isActive ? "border-brand border-2 shadow-md shadow-brand/15" : "border-warm-border hover:shadow-md hover:border-brand/40"}`}>
      <div className="relative flex-shrink-0 w-[72px] h-[96px] rounded-lg overflow-hidden border border-warm-border bg-surface-sunken">
        <Image src={book.cover} alt={book.title} fill className="object-cover" sizes="72px"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      </div>
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        <h3 className={`font-display text-[14px] font-bold leading-tight line-clamp-2 ${isActive ? "text-brand" : "text-ink"}`}>{book.title}</h3>
        <p className="font-sans text-[12px] text-ink-secondary">{book.author}</p>
        {book.description && <p className="font-sans text-[11px] text-ink-secondary leading-relaxed line-clamp-2 mt-0.5">{book.description}</p>}
        <div className="flex items-center gap-2 mt-auto pt-2" onClick={(e) => e.stopPropagation()}>
          <span className="flex-1 py-1.5 rounded-lg bg-brand/10 text-brand font-sans text-[12px] font-medium text-center cursor-pointer hover:bg-brand/15 transition-colors">View Details</span>
          <button onClick={onRemove} className="w-8 h-8 flex items-center justify-center rounded-lg border border-warm-border text-ink-secondary hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-colors" title="Remove from list"><Trash2 size={14} strokeWidth={1.8} /></button>
        </div>
      </div>
    </div>
  );
}

/* ── Wishlist Book Card ── */
function WishlistBookCard({ book, isActive, onSelect, onRemove, onBuy, owned }: { book: Book; isActive: boolean; onSelect: () => void; onRemove: () => void; onBuy: () => void; owned: boolean }) {
  return (
    <div onClick={onSelect} className={`flex gap-3 rounded-2xl border bg-surface-card p-4 cursor-pointer transition-all ${isActive ? "border-brand border-2 shadow-md shadow-brand/15" : "border-warm-border hover:shadow-md hover:border-brand/40"}`}>
      <div className="relative flex-shrink-0 w-[72px] h-[96px] rounded-lg overflow-hidden border border-warm-border bg-surface-sunken">
        <Image src={book.cover} alt={book.title} fill className="object-cover" sizes="72px"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        <span className={`absolute bottom-1 left-1 right-1 text-center rounded-md font-sans text-[9px] font-bold py-0.5 ${book.isFree ? "bg-emerald-500 text-white" : "bg-ink/80 text-white"}`}>
          {book.isFree ? "FREE" : `$${book.price?.toFixed(2)}`}
        </span>
      </div>
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        <h3 className={`font-display text-[14px] font-bold leading-tight line-clamp-2 transition-colors ${isActive ? "text-brand" : "text-ink"}`}>{book.title}</h3>
        <p className="font-sans text-[12px] text-ink-secondary">{book.author}</p>
        {book.description && <p className="font-sans text-[11px] text-ink-secondary leading-relaxed line-clamp-2 mt-0.5">{book.description}</p>}
        <div className="flex items-center gap-2 mt-auto pt-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={onBuy} disabled={owned} className={`flex-1 py-1.5 rounded-lg font-sans text-[12px] font-semibold transition-all flex items-center justify-center gap-1.5 ${owned ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default" : book.isFree ? "bg-brand text-white hover:bg-brand/90" : "bg-ink text-white hover:bg-ink/85"}`}>
            {owned ? <><Check size={13} strokeWidth={2.5} /> In Library</> : <><ShoppingCart size={12} strokeWidth={2} /> {book.isFree ? "Get Free" : `Buy · $${book.price?.toFixed(2)}`}</>}
          </button>
          <button onClick={onRemove} className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors" title="Remove from wishlist">
            <Heart size={14} strokeWidth={2} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
