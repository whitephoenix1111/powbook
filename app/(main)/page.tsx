"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { BookOpen, Headphones, ChevronRight, TrendingUp, ArrowRight, Bookmark, ChevronLeft } from "lucide-react";

import { useBookPanelStore } from "@/lib/store/bookPanelStore";
import BentoGrid from "@/components/bento/BentoGrid";
import {
  HeroBentoCard,
  BookBentoCard,
  AudioBentoCard,
  QuoteBentoCard,
} from "@/components/bento/BentoCard";

import {
  POPULAR_BOOKS,
  RECOMMENDED_AUDIOBOOKS,
  ACTIVE_BOOK,
  type Book,
} from "@/lib/mockData";

/* ────────────────────────────────────────────────
   Static data
──────────────────────────────────────────────── */
const FILTER_TABS = ["All", "E-Books", "Audiobooks"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

/* ────────────────────────────────────────────────
   Page component
   Shell (Sidebar + Navbar) được app/(main)/layout.tsx xử lý.
   Page này chỉ trả về nội dung bên trong vùng content.
──────────────────────────────────────────────── */
export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const { selectedBook, toggle } = useBookPanelStore();

  const handleSelect = (book: Book) => toggle(book);
  const isActive = (book: Book) => selectedBook?.id === book.id;
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "right" ? 480 : -480, behavior: "smooth" });
  };

  return (
    <main className="px-6 py-5 space-y-7">

        {/* Page header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-[26px] font-bold text-ink leading-none">
              Good morning, Bruce 👋
            </h1>
            <p className="font-sans text-[14px] text-ink-secondary mt-1">
              Continue your reading journey · 3 books in progress
            </p>
          </div>
          <div className="flex items-center gap-1.5 font-sans text-[12px] text-ink-secondary bg-surface-card border border-warm-border rounded-xl px-3 py-1.5">
            <TrendingUp size={13} strokeWidth={1.8} className="text-brand" />
            <span>On a 5-day streak!</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded-full font-sans text-[13px] font-medium transition-all duration-150
                ${
                  activeFilter === tab
                    ? "bg-brand text-white shadow-sm"
                    : "bg-surface-card border border-warm-border text-ink-secondary hover:border-brand/40 hover:text-ink"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════
            BENTO GRID 1 — Featured + Stats
        ══════════════════════════════════════ */}
        <BentoGrid>
          <HeroBentoCard
            book={ACTIVE_BOOK}
            onClick={() => handleSelect(ACTIVE_BOOK)}
            isActive={isActive(ACTIVE_BOOK)}
          />
          {/* Stat: Books Read */}
          <div className="relative rounded-2xl overflow-hidden flex flex-col justify-between p-4 border border-warm-border"
            style={{ background: "#E8580A" }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/20">
              <BookOpen size={16} strokeWidth={2} className="text-white" />
            </div>
            <div>
              <p className="font-display text-[32px] font-bold text-white leading-none">24</p>
              <p className="font-sans text-[12px] text-white/70 mt-0.5">Books Read</p>
            </div>
          </div>

          {/* Stat: Hours Listened */}
          <div className="relative rounded-2xl overflow-hidden flex flex-col justify-between p-4 border border-warm-border bg-surface-card">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(232,88,10,0.12)" }}>
              <Headphones size={16} strokeWidth={1.8} style={{ color: "#E8580A" }} />
            </div>
            <div>
              <p className="font-display text-[32px] font-bold text-ink leading-none">86h</p>
              <p className="font-sans text-[12px] text-ink-secondary mt-0.5">Hours Listened</p>
            </div>
          </div>
          <BookBentoCard
            book={POPULAR_BOOKS[0]}
            onClick={() => handleSelect(POPULAR_BOOKS[0])}
            isActive={isActive(POPULAR_BOOKS[0])}
          />
          <BookBentoCard
            book={POPULAR_BOOKS[1]}
            onClick={() => handleSelect(POPULAR_BOOKS[1])}
            isActive={isActive(POPULAR_BOOKS[1])}
          />
        </BentoGrid>

        {/* ══════════════════════════════════════
            SECTION: Popular This Week
        ══════════════════════════════════════ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-[19px] font-bold text-ink">Popular This Week</h2>
            <button className="flex items-center gap-1 font-sans text-[13px] text-brand hover:underline underline-offset-2">
              See all <ChevronRight size={14} strokeWidth={2} />
            </button>
          </div>
          <BentoGrid>
            <AudioBentoCard
              book={RECOMMENDED_AUDIOBOOKS[0]}
              onClick={() => handleSelect(RECOMMENDED_AUDIOBOOKS[0])}
              isActive={isActive(RECOMMENDED_AUDIOBOOKS[0])}
            />
            <BookBentoCard
              book={POPULAR_BOOKS[2]}
              onClick={() => handleSelect(POPULAR_BOOKS[2])}
              isActive={isActive(POPULAR_BOOKS[2])}
            />
            <BookBentoCard
              book={POPULAR_BOOKS[3]}
              onClick={() => handleSelect(POPULAR_BOOKS[3])}
              isActive={isActive(POPULAR_BOOKS[3])}
            />
            <QuoteBentoCard
              quote="A reader lives a thousand lives before he dies. The man who never reads lives only one."
              attribution="George R.R. Martin"
            />
            <AudioBentoCard
              book={RECOMMENDED_AUDIOBOOKS[1]}
              onClick={() => handleSelect(RECOMMENDED_AUDIOBOOKS[1])}
              isActive={isActive(RECOMMENDED_AUDIOBOOKS[1])}
            />
          </BentoGrid>
        </div>

        {/* ══════════════════════════════════════
            SECTION: Browse by Category
        ══════════════════════════════════════ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-[19px] font-bold text-ink">Browse by Category</h2>
            <a href="/category" className="flex items-center gap-1 font-sans text-[13px] text-brand hover:underline underline-offset-2">
              Browse all <ChevronRight size={14} strokeWidth={2} />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* E-Books card */}
            <a href="/category"
              className="group relative flex items-center gap-5 rounded-2xl overflow-hidden px-6 py-5 no-underline"
              style={{ background: "#1A1410", minHeight: "110px" }}
            >
              {/* Decorative rings */}
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full border border-white/10" />
              <div className="absolute -right-2 -top-2 w-20 h-20 rounded-full border border-white/8" />

              {/* Icon */}
              <div className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#E8580A20" }}>
                <BookOpen size={26} strokeWidth={1.7} style={{ color: "#E8580A" }} />
              </div>

              {/* Text */}
              <div className="relative z-10 flex-1">
                <p className="font-display text-[22px] font-bold text-white leading-none mb-1">E-Books</p>
                <p className="font-sans text-[12px]" style={{ color: "rgba(255,255,255,0.5)" }}>2,400 titles available</p>
                <div className="flex gap-1.5 mt-2.5 flex-wrap">
                  {["Fiction", "History", "Sci & Tech"].map((g) => (
                    <span key={g} className="px-2 py-0.5 rounded-full font-sans text-[10px] font-medium"
                      style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>{g}</span>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight size={18} strokeWidth={1.8}
                className="relative z-10 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                style={{ color: "rgba(255,255,255,0.35)" }} />
            </a>

            {/* Audiobooks card */}
            <a href="/category"
              className="group relative flex items-center gap-5 rounded-2xl overflow-hidden px-6 py-5 no-underline"
              style={{ background: "#F5C842", minHeight: "110px" }}
            >
              {/* Decorative rings */}
              <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full border border-black/10" />
              <div className="absolute -right-2 -top-2 w-20 h-20 rounded-full border border-black/8" />

              {/* Icon */}
              <div className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(0,0,0,0.1)" }}>
                <Headphones size={26} strokeWidth={1.7} className="text-ink" />
              </div>

              {/* Text */}
              <div className="relative z-10 flex-1">
                <p className="font-display text-[22px] font-bold text-ink leading-none mb-1">Audiobooks</p>
                <p className="font-sans text-[12px] text-ink/60">1,200 titles available</p>
                <div className="flex gap-1.5 mt-2.5 flex-wrap">
                  {["Fiction", "Thriller", "History"].map((g) => (
                    <span key={g} className="px-2 py-0.5 rounded-full font-sans text-[10px] font-medium"
                      style={{ background: "rgba(0,0,0,0.12)", color: "rgba(0,0,0,0.55)" }}>{g}</span>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight size={18} strokeWidth={1.8}
                className="relative z-10 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1 text-ink/40" />
            </a>
          </div>
        </div>

        {/* ══════════════════════════════════════
            SECTION: Recommended for You
            Layout: horizontal scroll row — differentiate khỏi BentoGrid
        ══════════════════════════════════════ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-[19px] font-bold text-ink">Recommended for You</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                className="w-7 h-7 rounded-full border border-warm-border bg-surface-card flex items-center justify-center
                  text-ink-secondary hover:text-brand hover:border-brand/40 transition-all"
              >
                <ChevronLeft size={14} strokeWidth={2} />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-7 h-7 rounded-full border border-warm-border bg-surface-card flex items-center justify-center
                  text-ink-secondary hover:text-brand hover:border-brand/40 transition-all"
              >
                <ChevronRight size={14} strokeWidth={2} />
              </button>
              <div className="w-px h-4 bg-warm-border mx-1" />
              <button className="flex items-center gap-1 font-sans text-[13px] text-brand hover:underline underline-offset-2">
                See all <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Horizontal scroll row */}
          <div className="overflow-hidden">
          <div ref={scrollRef} className="flex gap-3 overflow-x-scroll pb-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Promo card — flex-shrink-0 */}
            <div className="relative flex-shrink-0 w-[160px] rounded-2xl overflow-hidden flex flex-col justify-between p-4 border border-warm-border"
              style={{ background: "linear-gradient(160deg, #1A1410 0%, #2D1F0E 100%)" }}
            >
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full"
                style={{ background: "rgba(232,88,10,0.15)" }} />
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(232,88,10,0.2)" }}>
                <Bookmark size={14} strokeWidth={1.8} style={{ color: "#E8580A" }} />
              </div>
              <div>
                <p className="font-display text-[26px] font-bold text-white leading-none">12</p>
                <p className="font-sans text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>Saved books waiting</p>
                <a href="/saved"
                  className="mt-2.5 inline-flex items-center gap-1 font-sans text-[10px] font-medium no-underline"
                  style={{ color: "#E8580A" }}
                >
                  View list <ArrowRight size={10} strokeWidth={2} />
                </a>
              </div>
            </div>

            {/* Book cards — cover tall + info bên dưới */}
            {[
              POPULAR_BOOKS[4],
              POPULAR_BOOKS[0],
              POPULAR_BOOKS[1],
              POPULAR_BOOKS[2],
              POPULAR_BOOKS[3],
              ...RECOMMENDED_AUDIOBOOKS,
            ].map((book) => (
              <div
                key={book.id}
                onClick={() => handleSelect(book)}
                className={`flex-shrink-0 w-[140px] flex flex-col gap-2 cursor-pointer group
                  rounded-2xl overflow-hidden border transition-all duration-200
                  ${
                    isActive(book)
                      ? "border-brand border-2 shadow-md shadow-brand/15"
                      : "border-warm-border hover:border-brand/40 hover:shadow-md"
                  }`}
              >
                {/* Cover */}
                <div className="relative w-full bg-surface-sunken overflow-hidden" style={{ height: "180px" }}>
                  <Image
                    src={book.cover}
                    alt={book.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="140px"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  {/* Format badge */}
                  {book.audioUrl && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-brand text-white text-[9px] font-sans font-bold uppercase tracking-wider">
                        <Headphones size={7} strokeWidth={2.5} /> Audio
                      </span>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="px-2.5 pb-2.5 flex flex-col gap-0.5">
                  <p className="font-display text-[11.5px] font-bold text-ink leading-tight line-clamp-2">
                    {book.title}
                  </p>
                  <p className="font-sans text-[10px] text-ink-secondary truncate">{book.author}</p>
                  {book.length && (
                    <p className="font-sans text-[9px] text-ink-secondary/60 mt-0.5">{book.length}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>

    </main>
  );
}
