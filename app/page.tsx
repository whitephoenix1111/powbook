"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Bell, ChevronDown } from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import BookCard from "@/components/book/BookCard";
import BookSidePanel from "@/components/book/BookSidePanel";
import {
  POPULAR_BOOKS,
  RECOMMENDED_AUDIOBOOKS,
  ACTIVE_BOOK,
  type Book,
} from "@/lib/mockData";

const CATEGORIES = ["Everything", "Ebooks", "Audiobooks", "Magazines", "Podcast", "E-Learning", "Comics"];

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState("Everything");
  const [selectedBook, setSelectedBook] = useState<Book>(ACTIVE_BOOK);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Top Search Bar */}
        <div className="flex items-center gap-4 px-6 py-3 border-b border-warm-border bg-yellow min-h-[64px]">

          {/* Search input */}
          <div className="flex items-center gap-2 flex-1 max-w-[480px] px-4 py-2 rounded-lg border border-warm-border bg-surface-card/70">
            <Search size={16} className="text-ink-secondary" strokeWidth={2} />
            <input
              type="text"
              placeholder="Title, author, host, or topic"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none font-sans text-[13px] text-ink placeholder:text-ink-secondary"
            />
          </div>

          <div className="flex-1" />

          {/* User profile */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-warm-border bg-surface-card/60 cursor-pointer">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-warm-border">
              <Image src="https://i.pravatar.cc/64?img=12" alt="Bruce Wayne" fill className="object-cover" sizes="32px" />
            </div>
            <div>
              <p className="font-sans text-[13px] font-semibold text-ink leading-tight">Bruce Wayne</p>
              <p className="font-sans text-[11px] text-ink-secondary">Story Seeker</p>
            </div>
            <ChevronDown size={14} className="text-ink-secondary" />
          </div>

          {/* Bell */}
          <button className="flex items-center justify-center w-9 h-9 rounded-lg border border-warm-border bg-surface-card/60 hover:bg-surface-card transition-colors">
            <Bell size={16} className="text-ink" strokeWidth={1.8} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Categories */}
          <section className="mb-6">
            <h2 className="font-display text-[18px] font-semibold text-ink mb-3">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isActive = cat === activeCategory;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full font-sans text-[13px] font-medium border transition-all
                      ${isActive
                        ? "bg-brand text-surface-card border-brand"
                        : "bg-transparent text-ink border-warm-border hover:border-brand hover:text-brand"
                      }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Popular Books */}
          <section className="mb-7">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-display text-[18px] font-semibold text-ink">Popular Books</h2>
              <button className="font-sans text-[12px] text-ink-secondary underline hover:text-brand transition-colors">
                more
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {POPULAR_BOOKS.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onSelect={setSelectedBook}
                  isActive={selectedBook.id === book.id}
                />
              ))}
            </div>
          </section>

          {/* Recommended Audiobooks */}
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-display text-[18px] font-semibold text-ink">Recommended Audiobook</h2>
              <button className="font-sans text-[12px] text-ink-secondary underline hover:text-brand transition-colors">
                more
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {RECOMMENDED_AUDIOBOOKS.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onSelect={setSelectedBook}
                  isActive={selectedBook.id === book.id}
                />
              ))}
            </div>
          </section>

        </div>
      </div>

      {/* Right Side Panel */}
      <BookSidePanel book={selectedBook} />
    </div>
  );
}
