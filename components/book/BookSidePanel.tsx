"use client";

import Image from "next/image";
import Link from "next/link";
import { Download, Heart, ListPlus, Play, Pause, BookOpen, Star, X, Check, ShoppingCart, Headphones } from "lucide-react";
import AddToListModal from "@/components/book/AddToListModal";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAudioStore } from "@/lib/store/audioStore";
import { useBookPanelStore } from "@/lib/store/bookPanelStore";
import { useLibraryStore } from "@/lib/store/libraryStore";
import { useAuthStore } from "@/lib/store/authStore";
import type { Book } from "@/lib/mockData";

interface BookSidePanelProps {
  book: Book;
}

const SAMPLE_LIMIT = 30;

/* ── Display-only star row (partial fill) ── */
function StarDisplay({ rating, countStr }: { rating: number; countStr: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex items-center gap-[2px]">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.min(1, Math.max(0, rating - i));
          const clipId = `clip-${rating}-${i}`.replace(".", "_");
          return (
            <svg key={i} width="11" height="11" viewBox="0 0 11 11" fill="none">
              <defs>
                <clipPath id={clipId}>
                  <rect x="0" y="0" width={fill * 11} height="11" />
                </clipPath>
              </defs>
              <path d="M5.5 1l1.18 2.39 2.64.38-1.91 1.86.45 2.63L5.5 7.01 3.14 8.26l.45-2.63L1.68 3.77l2.64-.38L5.5 1z"
                fill="#E8D5BC" stroke="#E8D5BC" strokeWidth="0.5" />
              <path d="M5.5 1l1.18 2.39 2.64.38-1.91 1.86.45 2.63L5.5 7.01 3.14 8.26l.45-2.63L1.68 3.77l2.64-.38L5.5 1z"
                fill="var(--color-brand)" stroke="var(--color-brand)" strokeWidth="0.5"
                clipPath={`url(#${clipId})`} />
            </svg>
          );
        })}
      </span>
      <span className="font-sans text-[12px] font-semibold text-ink">{rating.toFixed(1)}</span>
      <span className="font-sans text-[11px] text-ink-secondary">({countStr})</span>
    </span>
  );
}

/* ── Interactive star row (hover + click) ── */
function StarInput({
  userVote,
  onVote,
  disabled,
  submitting,
}: {
  userVote: number | null;
  onVote: (stars: number) => void;
  disabled: boolean;
  submitting: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || userVote || 0;
  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const val = i + 1;
          return (
            <button
              key={val}
              disabled={disabled || submitting}
              onClick={() => onVote(val)}
              onMouseEnter={() => !disabled && setHovered(val)}
              onMouseLeave={() => setHovered(0)}
              className="p-0.5 transition-transform duration-75 hover:scale-110 disabled:cursor-not-allowed"
              aria-label={`Rate ${val} stars`}
            >
              <Star
                size={16}
                fill={val <= active ? "var(--color-brand)" : "none"}
                stroke={val <= active ? "var(--color-brand)" : "var(--color-warm-border)"}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
        {submitting && (
          <span className="ml-1 font-sans text-[10px] text-ink-secondary animate-pulse">Saving…</span>
        )}
        {!submitting && active > 0 && (
          <span className="ml-1 font-sans text-[10px] text-ink-secondary">{labels[active]}</span>
        )}
      </div>
      {userVote && !hovered && !submitting && (
        <p className="font-sans text-[10px] text-emerald-600">
          ✓ Your rating saved
        </p>
      )}
    </div>
  );
}

export default function BookSidePanel({ book }: BookSidePanelProps) {
  const setBook = useAudioStore((s) => s.setBook);
  const close   = useBookPanelStore((s) => s.close);
  const { isOwned, isWishlisted, acquire, toggleWishlist } = useLibraryStore();
  const { currentUser } = useAuthStore();
  const router = useRouter();

  const owned      = isOwned(book.id);
  const wishlisted = isWishlisted(book.id);
  const [showListModal, setShowListModal] = useState(false);
  const isEbook     = !!book.pages;
  const isAudiobook = !!book.audioUrl;
  const priceLabel  = book.isFree ? "Get Free" : `Buy · $${book.price?.toFixed(2)}`;

  /* ── Rating state (từ API) ── */
  const [ratingData, setRatingData] = useState<{
    rating: number;
    countStr: string;
    userVote: number | null;
  }>({
    rating:   book.rating,
    countStr: book.ratingCount,
    userVote: null,
  });
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  // Fetch rating từ API khi mở panel
  useEffect(() => {
    fetch("/api/ratings")
      .then((r) => r.json())
      .then((all) => {
        const entry = all[book.id];
        if (!entry) return;
        const userVote = currentUser ? (entry.votes?.[currentUser.email] ?? null) : null;
        setRatingData({ rating: entry.rating, countStr: entry.countStr, userVote });
      })
      .catch(() => {}); // Fallback: giữ nguyên mockData rating
  }, [book.id, currentUser]);

  async function handleVote(stars: number) {
    if (!currentUser || ratingSubmitting) return;
    setRatingSubmitting(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id, email: currentUser.email, stars }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRatingData({ rating: updated.rating, countStr: updated.countStr, userVote: updated.userVote });
      }
    } finally {
      setRatingSubmitting(false);
    }
  }

  /* ── Audio sample state ── */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [samplePlaying, setSamplePlaying] = useState(false);
  const [sampleProgress, setSampleProgress] = useState(0);
  const [sampleEnded, setSampleEnded] = useState(false);

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, [book.id]);

  function toggleSample() {
    if (!book.audioUrl) return;
    if (!audioRef.current) {
      const audio = new Audio(book.audioUrl);
      audioRef.current = audio;
      audio.addEventListener("timeupdate", () => {
        const t = audio.currentTime;
        if (t >= SAMPLE_LIMIT) {
          audio.pause(); setSamplePlaying(false); setSampleEnded(true); setSampleProgress(1);
        } else {
          setSampleProgress(t / SAMPLE_LIMIT);
        }
      });
      audio.addEventListener("ended", () => {
        setSamplePlaying(false); setSampleEnded(true); setSampleProgress(1);
      });
    }
    if (sampleEnded) {
      audioRef.current.currentTime = 0; setSampleEnded(false); setSampleProgress(0);
      audioRef.current.play(); setSamplePlaying(true);
    } else if (samplePlaying) {
      audioRef.current.pause(); setSamplePlaying(false);
    } else {
      audioRef.current.play(); setSamplePlaying(true);
    }
  }

  function handlePlay() {
    if (!book.audioUrl) return;
    audioRef.current?.pause(); setSamplePlaying(false);
    setBook(book, book.audioUrl);
  }

  function handleAcquire() {
    if (!currentUser) { close(); router.push("/signin"); return; }
    if (!owned) acquire(book);
  }

  function handleAddToList() {
    if (!currentUser) { close(); router.push("/signin"); return; }
    setShowListModal(true);
  }

  const previewText = book.pages?.[0]?.content ?? "";

  return (<>
    <aside className="flex flex-col w-[280px] min-w-[280px] flex-shrink-0 bg-surface-raised overflow-y-auto">

      {/* ── Book header ── */}
      <div className="flex gap-3 p-4 border-b border-warm-border">
        <div className="relative flex-shrink-0 w-[68px] h-[88px] rounded-md overflow-hidden border border-warm-border bg-surface-sunken">
          <Image src={book.cover} alt={book.title} fill className="object-cover" sizes="68px" />
          <span className={`absolute bottom-1 left-1 right-1 text-center rounded-sm font-sans text-[9px] font-bold py-0.5
            ${owned ? "bg-emerald-500 text-white" : book.isFree ? "bg-emerald-500 text-white" : "bg-ink/80 text-white"}`}>
            {owned ? "✓ Owned" : book.isFree ? "FREE" : `$${book.price?.toFixed(2)}`}
          </span>
        </div>

        <div className="flex flex-col justify-center gap-1 min-w-0 flex-1">
          <h2 className="font-display text-[14px] font-bold text-ink leading-tight">{book.title}</h2>
          <p className="font-sans text-[12px] text-ink-secondary">
            By: <span className="underline cursor-pointer text-brand">{book.author}</span>
          </p>
          {book.narrator && (
            <p className="font-sans text-[12px] text-ink-secondary">
              Narrator: <span className="underline cursor-pointer text-brand">{book.narrator}</span>
            </p>
          )}
        </div>

        <button onClick={close}
          className="self-start flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-ink-secondary hover:bg-surface-sunken hover:text-ink transition-colors">
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      {/* ── CTA + Actions ── */}
      <div className="flex flex-col gap-2 p-4 border-b border-warm-border">
        <button
          onClick={handleAcquire}
          disabled={owned}
          className={`w-full py-2.5 rounded-lg font-sans text-[13px] font-semibold transition-all flex items-center justify-center gap-2
            ${owned ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
              : book.isFree ? "bg-brand text-white hover:bg-brand/90 shadow-sm"
              : "bg-ink text-white hover:bg-ink/85 shadow-sm"}`}
        >
          {owned ? <><Check size={14} strokeWidth={2.5} /> In Library</>
            : book.isFree ? <><BookOpen size={14} strokeWidth={1.9} /> Get Free</>
            : <><ShoppingCart size={14} strokeWidth={1.9} /> {priceLabel}</>}
        </button>

        {owned && isEbook && (
          <Link href={`/book/${book.id}`}
            className="w-full py-2.5 rounded-lg border border-ink text-ink text-[13px] font-medium font-sans transition-colors hover:bg-ink hover:text-surface-card text-center flex items-center justify-center gap-2 no-underline">
            <BookOpen size={14} strokeWidth={1.9} /> Read
          </Link>
        )}

        {owned && isAudiobook && (
          <button onClick={handlePlay}
            className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 bg-brand text-surface-card text-[13px] font-medium font-sans transition-opacity hover:opacity-90">
            <Play size={14} fill="white" strokeWidth={0} />
            {isEbook ? "Play Audiobook" : "Play"}
          </button>
        )}

        <div className="flex border border-warm-border rounded-lg overflow-hidden mt-1">
          <button
            onClick={() => toggleWishlist(book)}
            disabled={owned}
            title={owned ? "Already owned" : wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 font-sans transition-colors border-r border-warm-border
              ${owned ? "text-ink-secondary/40 cursor-default"
                : wishlisted ? "text-red-500 bg-red-50"
                : "text-ink-secondary hover:bg-brand-muted"}`}
          >
            <Heart size={16} strokeWidth={1.8} fill={wishlisted && !owned ? "currentColor" : "none"} />
            <span className="text-[10px]">{wishlisted && !owned ? "Wishlisted" : "Wishlist"}</span>
          </button>

          <button className="flex-1 flex flex-col items-center gap-1 py-2.5 text-ink-secondary font-sans hover:bg-brand-muted transition-colors border-r border-warm-border">
            <Download size={16} strokeWidth={1.8} />
            <span className="text-[10px]">Download</span>
          </button>

          <button onClick={handleAddToList}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 font-sans transition-colors hover:bg-brand-muted"
            title={!currentUser ? "Sign in to use Lists" : "Add to list"}>
            <ListPlus size={16} strokeWidth={1.8} className={currentUser ? "text-ink-secondary" : "text-ink-secondary/50"} />
            <span className={`text-[10px] ${currentUser ? "text-ink-secondary" : "text-ink-secondary/50"}`}>Add to List</span>
          </button>
        </div>
      </div>

      {/* ── PREVIEW ── */}
      {!owned && (isAudiobook || (isEbook && previewText)) && (
        <div className="border-b border-warm-border">
          {isAudiobook && book.audioUrl && (
            <div className="p-4 pb-3">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-ink-secondary mb-2">Audio Sample</p>
              <div className="flex items-center gap-3 bg-surface-sunken rounded-lg px-3 py-2.5 border border-warm-border">
                <button onClick={toggleSample}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand/85 transition-colors">
                  {samplePlaying ? <Pause size={13} fill="white" strokeWidth={0} /> : <Play size={13} fill="white" strokeWidth={0} className="translate-x-[1px]" />}
                </button>
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="w-full h-1 bg-warm-border rounded-full overflow-hidden">
                    <div className="h-full bg-brand rounded-full transition-all duration-300" style={{ width: `${sampleProgress * 100}%` }} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-[10px] text-ink-secondary flex items-center gap-1">
                      <Headphones size={10} strokeWidth={1.8} />
                      {sampleEnded ? "Sample ended" : samplePlaying ? "Playing…" : `${SAMPLE_LIMIT}s sample`}
                    </span>
                    <span className="font-sans text-[10px] text-ink-secondary">{Math.round(sampleProgress * SAMPLE_LIMIT)}s / {SAMPLE_LIMIT}s</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isEbook && previewText && (
            <div className={`px-4 pb-4 ${isAudiobook ? "pt-0" : "pt-4"}`}>
              {!isAudiobook && <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-ink-secondary mb-2">Preview</p>}
              <div className="relative rounded-lg border border-warm-border overflow-hidden bg-surface-card">
                {book.pages?.[0]?.chapter && (
                  <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-ink-secondary px-3 pt-2.5 pb-1">{book.pages[0].chapter}</p>
                )}
                <div className="relative px-3 pb-3">
                  <p className="font-sans text-[11.5px] text-ink leading-relaxed line-clamp-4">{previewText}</p>
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-surface-card to-transparent pointer-events-none" />
                </div>
                <div className="flex items-center justify-center gap-1.5 py-2 border-t border-warm-border bg-surface-sunken">
                  <span className="font-sans text-[10px] text-ink-secondary">
                    {book.isFree ? "Get free to read full text" : "Buy to unlock full text"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Metadata ── */}
      <div className="p-4 border-b border-warm-border">
        <table className="w-full font-sans text-[12px]">
          <tbody>
            <tr>
              <td className="py-1 pr-3 text-ink-secondary whitespace-nowrap align-middle">Rating</td>
              <td className="align-middle">
                <StarDisplay rating={ratingData.rating} countStr={ratingData.countStr} />
              </td>
            </tr>
            {/* Your rating row — chỉ hiện khi owned + logged in */}
            {owned && currentUser && (
              <tr>
                <td className="py-1.5 pr-3 text-ink-secondary whitespace-nowrap align-top text-[11px]">Your rating</td>
                <td className="py-1.5 align-top">
                  <StarInput
                    userVote={ratingData.userVote}
                    onVote={handleVote}
                    disabled={!currentUser}
                    submitting={ratingSubmitting}
                  />
                </td>
              </tr>
            )}
            {[
              { label: "Length",    value: book.length    ?? "—" },
              { label: "Format",    value: book.format    ?? "—" },
              { label: "Publisher", value: book.publisher ?? "—" },
              { label: "Released",  value: book.released  ?? "—" },
            ].map(({ label, value }) => (
              <tr key={label}>
                <td className="py-1 pr-3 text-ink-secondary whitespace-nowrap align-middle">{label}</td>
                <td className="text-ink align-middle">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Chưa owned — gợi ý login/buy để rate */}
        {(!owned || !currentUser) && (
          <p className="mt-2 font-sans text-[10px] text-ink-secondary/60 italic">
            {!currentUser
              ? <><span className="underline cursor-pointer text-brand" onClick={() => { close(); router.push("/signin"); }}>Sign in</span> and own this book to rate it</>
              : "Own this book to leave a rating"
            }
          </p>
        )}
      </div>

      {/* ── Description ── */}
      {book.description && (
        <div className="p-4">
          <p className="font-sans text-[12px] text-ink leading-relaxed">{book.description}</p>
        </div>
      )}
    </aside>

    {showListModal && <AddToListModal book={book} onClose={() => setShowListModal(false)} />}
  </>);
}
