"use client";

import Image from "next/image";
import Link from "next/link";
import { Download, Heart, ListPlus, Play, BookOpen, Star, X, Check, ShoppingCart } from "lucide-react";
import AddToListModal from "@/components/book/AddToListModal";
import { useState } from "react";
import { useAudioStore } from "@/lib/store/audioStore";
import { useBookPanelStore } from "@/lib/store/bookPanelStore";
import { useLibraryStore } from "@/lib/store/libraryStore";
import type { Book } from "@/lib/mockData";

interface BookSidePanelProps {
  book: Book;
}

export default function BookSidePanel({ book }: BookSidePanelProps) {
  const setBook = useAudioStore((s) => s.setBook);
  const close   = useBookPanelStore((s) => s.close);
  const { isOwned, isWishlisted, acquire, toggleWishlist } = useLibraryStore();

  const owned      = isOwned(book.id);
  const wishlisted = isWishlisted(book.id);
  const [showListModal, setShowListModal] = useState(false);
  const isEbook     = !!book.pages;
  const isAudiobook = !!book.audioUrl;
  const priceLabel  = book.isFree ? "Get Free" : `Buy · $${book.price?.toFixed(2)}`;

  function handlePlay() {
    if (!book.audioUrl) return;
    setBook(book, book.audioUrl);
  }

  return (<>
    <aside className="flex flex-col w-[280px] min-w-[280px] flex-shrink-0 bg-surface-raised">

      {/* ── Book header ── */}
      <div className="flex gap-3 p-4 border-b border-warm-border">
        <div className="relative flex-shrink-0 w-[68px] h-[88px] rounded-md overflow-hidden border border-warm-border bg-surface-sunken">
          <Image src={book.cover} alt={book.title} fill className="object-cover" sizes="68px" />
          {/* Price badge trên bìa */}
          <span className={`absolute bottom-1 left-1 right-1 text-center rounded-sm font-sans text-[9px] font-bold py-0.5
            ${owned
              ? "bg-emerald-500 text-white"
              : book.isFree
                ? "bg-emerald-500 text-white"
                : "bg-ink/80 text-white"
            }`}
          >
            {owned ? "✓ Owned" : book.isFree ? "FREE" : `$${book.price?.toFixed(2)}`}
          </span>
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

        <button
          onClick={close}
          className="self-start flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-ink-secondary hover:bg-surface-sunken hover:text-ink transition-colors"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      {/* ── CTA + Actions ── */}
      <div className="flex flex-col gap-2 p-4 border-b border-warm-border">

        {/* Buy / Get Free / In Library */}
        <button
          onClick={() => !owned && acquire(book)}
          disabled={owned}
          className={`w-full py-2.5 rounded-lg font-sans text-[13px] font-semibold transition-all flex items-center justify-center gap-2
            ${owned
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
              : book.isFree
                ? "bg-brand text-white hover:bg-brand/90 shadow-sm"
                : "bg-ink text-white hover:bg-ink/85 shadow-sm"
            }`}
        >
          {owned
            ? <><Check size={14} strokeWidth={2.5} /> In Library</>
            : book.isFree
              ? <><BookOpen size={14} strokeWidth={1.9} /> Get Free</>
              : <><ShoppingCart size={14} strokeWidth={1.9} /> {priceLabel}</>
          }
        </button>

        {/* Read — chỉ hiện nếu owned và có pages */}
        {owned && isEbook && (
          <Link
            href={`/book/${book.id}`}
            className="w-full py-2.5 rounded-lg border border-ink text-ink text-[13px] font-medium font-sans transition-colors hover:bg-ink hover:text-surface-card text-center flex items-center justify-center gap-2 no-underline"
          >
            <BookOpen size={14} strokeWidth={1.9} />
            Read
          </Link>
        )}

        {/* Play — chỉ hiện nếu owned và có audioUrl */}
        {owned && isAudiobook && (
          <button
            onClick={handlePlay}
            className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 bg-brand text-surface-card text-[13px] font-medium font-sans transition-opacity hover:opacity-90"
          >
            <Play size={14} fill="white" strokeWidth={0} />
            {isEbook ? "Play Audiobook" : "Play"}
          </button>
        )}

        {/* Icon actions */}
        <div className="flex border border-warm-border rounded-lg overflow-hidden mt-1">
          {/* Wishlist */}
          <button
            onClick={() => toggleWishlist(book)}
            disabled={owned}
            title={owned ? "Already owned" : wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 font-sans transition-colors border-r border-warm-border
              ${owned
                ? "text-ink-secondary/40 cursor-default"
                : wishlisted
                  ? "text-red-500 bg-red-50"
                  : "text-ink-secondary hover:bg-brand-muted"
              }`}
          >
            <Heart size={16} strokeWidth={1.8} fill={wishlisted && !owned ? "currentColor" : "none"} />
            <span className="text-[10px]">{wishlisted && !owned ? "Wishlisted" : "Wishlist"}</span>
          </button>

          {/* Download */}
          <button
            className="flex-1 flex flex-col items-center gap-1 py-2.5 text-ink-secondary font-sans hover:bg-brand-muted transition-colors border-r border-warm-border"
          >
            <Download size={16} strokeWidth={1.8} />
            <span className="text-[10px]">Download</span>
          </button>

          {/* Add to List */}
          <button
            onClick={() => setShowListModal(true)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 text-ink-secondary font-sans hover:bg-brand-muted transition-colors"
          >
            <ListPlus size={16} strokeWidth={1.8} />
            <span className="text-[10px]">Add to List</span>
          </button>
        </div>
      </div>

      {/* ── Metadata ── */}
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

      {/* ── Description ── */}
      {book.description && (
        <div className="p-4">
          <p className="font-sans text-[12px] text-ink leading-relaxed">
            {book.description}
          </p>
        </div>
      )}
    </aside>

    {/* Add to List Modal */}
    {showListModal && (
      <AddToListModal book={book} onClose={() => setShowListModal(false)} />
    )}
  </>);
}
