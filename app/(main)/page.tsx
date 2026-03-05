"use client";

import { useState } from "react";
import { BookOpen, Headphones, Mic, Newspaper, ChevronRight, TrendingUp, Clock } from "lucide-react";

import BookSidePanel from "@/components/book/BookSidePanel";
import BentoGrid from "@/components/bento/BentoGrid";
import {
  HeroBentoCard,
  BookBentoCard,
  AudioBentoCard,
  StatBentoCard,
  QuoteBentoCard,
  CategoryBentoCard,
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
const CATEGORIES = [
  {
    label: "E-Books",
    count: "2,400",
    icon: <BookOpen size={22} strokeWidth={1.8} />,
    color: "#E8580A",
  },
  {
    label: "Audiobooks",
    count: "1,200",
    icon: <Headphones size={22} strokeWidth={1.8} />,
    color: "#7C3AED",
  },
  {
    label: "Podcasts",
    count: "840",
    icon: <Mic size={22} strokeWidth={1.8} />,
    color: "#0891B2",
  },
  {
    label: "Comics",
    count: "350",
    icon: <Newspaper size={22} strokeWidth={1.8} />,
    color: "#D97706",
  },
];

const FILTER_TABS = ["All", "E-Books", "Audiobooks", "Podcasts", "Comics"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

/* ────────────────────────────────────────────────
   Page component
   Shell (Sidebar + Navbar) được app/(main)/layout.tsx xử lý.
   Page này chỉ trả về nội dung bên trong vùng content.
──────────────────────────────────────────────── */
export default function DashboardPage() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleSelect = (book: Book) => {
    setSelectedBook((prev) => (prev?.id === book.id ? null : book));
  };

  const isActive = (book: Book) => selectedBook?.id === book.id;

  return (
    /* flex-1 + overflow-hidden: khớp với slot <div className="flex flex-1 overflow-hidden"> trong layout */
    <div className="flex flex-1 overflow-hidden">

      {/* ── Scrollable content area ── */}
      <main className="flex-1 overflow-y-auto px-6 py-5 pb-32 space-y-7">

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
          <StatBentoCard
            value="24"
            label="Books Read"
            icon={<BookOpen size={18} strokeWidth={2} />}
            accent
          />
          <StatBentoCard
            value="86h"
            label="Hours Listened"
            icon={<Headphones size={18} strokeWidth={1.8} />}
          />
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
          </div>
          <BentoGrid className="auto-rows-[140px]">
            {CATEGORIES.map((cat) => (
              <CategoryBentoCard
                key={cat.label}
                label={cat.label}
                count={cat.count}
                icon={cat.icon}
                color={cat.color}
                isActive={activeCategory === cat.label}
                onClick={() =>
                  setActiveCategory((prev) => (prev === cat.label ? null : cat.label))
                }
              />
            ))}
          </BentoGrid>
        </div>

        {/* ══════════════════════════════════════
            SECTION: Recommended for You
        ══════════════════════════════════════ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-[19px] font-bold text-ink">Recommended for You</h2>
            <button className="flex items-center gap-1 font-sans text-[13px] text-brand hover:underline underline-offset-2">
              See all <ChevronRight size={14} strokeWidth={2} />
            </button>
          </div>
          <BentoGrid>
            <StatBentoCard
              value="12"
              label="Saved Books"
              icon={<Clock size={18} strokeWidth={1.8} />}
            />
            <AudioBentoCard
              book={RECOMMENDED_AUDIOBOOKS[2]}
              onClick={() => handleSelect(RECOMMENDED_AUDIOBOOKS[2])}
              isActive={isActive(RECOMMENDED_AUDIOBOOKS[2])}
            />
            <BookBentoCard
              book={POPULAR_BOOKS[4]}
              onClick={() => handleSelect(POPULAR_BOOKS[4])}
              isActive={isActive(POPULAR_BOOKS[4])}
            />
            <AudioBentoCard
              book={RECOMMENDED_AUDIOBOOKS[3]}
              onClick={() => handleSelect(RECOMMENDED_AUDIOBOOKS[3])}
              isActive={isActive(RECOMMENDED_AUDIOBOOKS[3])}
            />
            <BookBentoCard
              book={POPULAR_BOOKS[1]}
              onClick={() => handleSelect(POPULAR_BOOKS[1])}
              isActive={isActive(POPULAR_BOOKS[1])}
            />
          </BentoGrid>
        </div>

      </main>

      {/* ── BookSidePanel — slide in từ phải ── */}
      <div
        className={`flex-shrink-0 transition-all duration-300 overflow-hidden
          ${selectedBook ? "w-[280px]" : "w-0"}`}
      >
        {selectedBook && (
          <div className="w-[280px] h-full overflow-y-auto border-l border-warm-border bg-surface-raised">
            <BookSidePanel book={selectedBook} />
          </div>
        )}
      </div>

    </div>
  );
}
