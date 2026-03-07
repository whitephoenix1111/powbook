"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Play, Headphones, Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLibraryStore } from "@/lib/store/libraryStore";
import type { Book } from "@/lib/mockData";

/* =========================================================
   HERO CARD — 2 cột × 2 hàng
   Full-bleed cover + gradient overlay + CTA buttons
   ========================================================= */
interface HeroBentoCardProps {
  book: Book;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

export function HeroBentoCard({ book, onClick, isActive, className }: HeroBentoCardProps) {
  const isAudiobook = !!book.audioUrl;
  const isEbook     = !!book.pages;
  const { isOwned } = useLibraryStore();
  const owned = isOwned(book.id);

  return (
    <div
      onClick={onClick}
      className={cn(
        "col-span-2 row-span-2 relative rounded-2xl overflow-hidden cursor-pointer group",
        "border-2 transition-all duration-200",
        isActive ? "border-brand shadow-lg shadow-brand/20" : "border-warm-border hover:border-brand/50",
        className
      )}
    >
      <Image
        src={book.cover}
        alt={book.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 1200px) 50vw, 600px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20" />

      {/* Type badge */}
      <div className="absolute top-4 left-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand text-white text-[11px] font-sans font-bold uppercase tracking-widest">
          {isAudiobook && isEbook ? (
            <><Headphones size={10} strokeWidth={2.5} /> E-Book + Audiobook</>
          ) : isAudiobook ? (
            <><Headphones size={10} strokeWidth={2.5} /> Audiobook</>
          ) : (
            <><BookOpen size={10} strokeWidth={2.5} /> E-Book</>
          )}
        </span>
      </div>

      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-sm text-white text-[11px] font-sans">
          Featured
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              fill={i < book.rating ? "#F5C842" : "none"}
              stroke={i < book.rating ? "#F5C842" : "rgba(255,255,255,0.4)"}
              strokeWidth={1.5}
            />
          ))}
          <span className="text-white/60 text-[11px] font-sans ml-1.5">({book.ratingCount})</span>
        </div>

        <h2 className="font-display text-white text-[26px] font-bold leading-tight mb-1 drop-shadow">
          {book.title}
        </h2>
        <p className="text-white/70 text-[13px] font-sans mb-4">
          by {book.author}
          {book.narrator && <span className="text-white/50"> · {book.narrator}</span>}
        </p>

        <div className="flex items-center gap-2">
          {/* Play Sample — owned: play thật | chưa owned: mở panel */}
          {isAudiobook && (
            <button
              onClick={(e) => { e.stopPropagation(); if (!owned) onClick?.(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-[13px] font-sans font-semibold hover:bg-brand-hover transition-colors"
            >
              <Play size={13} fill="white" strokeWidth={0} />
              Play Sample
            </button>
          )}

          {/* Read Now — owned: navigate | chưa owned: mở panel (button giả link) */}
          {isEbook && (
            owned ? (
              <Link
                href={`/book/${book.id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm text-white text-[13px] font-sans font-medium hover:bg-white/25 transition-colors no-underline"
              >
                <BookOpen size={13} strokeWidth={1.8} />
                Read Now
              </Link>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm text-white text-[13px] font-sans font-medium hover:bg-white/25 transition-colors"
              >
                <BookOpen size={13} strokeWidth={1.8} />
                Read Now
              </button>
            )
          )}

          {book.length && (
            <span className="ml-auto flex items-center gap-1 text-white/60 text-[12px] font-sans">
              <Clock size={12} strokeWidth={1.8} />
              {book.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BOOK CARD — 1 cột × 1 hàng
   Full-bleed cover với gradient overlay info strip
   ========================================================= */
interface BookBentoCardProps {
  book: Book;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

export function BookBentoCard({ book, onClick, isActive, className }: BookBentoCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-2xl overflow-hidden cursor-pointer group",
        "border transition-all duration-200",
        isActive ? "border-brand border-2 shadow-md shadow-brand/15" : "border-warm-border hover:shadow-lg hover:border-brand/40",
        className
      )}
    >
      {/* Full-bleed cover */}
      <Image
        src={book.cover}
        alt={book.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="200px"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />

      {/* Active dot */}
      {isActive && (
        <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brand z-10 shadow-sm" />
      )}

      {/* Bottom gradient overlay — luôn hiện nhưng đậm hơn khi hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent
        opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Info — bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <h4 className="font-display text-[12px] font-bold text-white leading-tight line-clamp-2 drop-shadow mb-0.5">
          {book.title}
        </h4>
        <p className="font-sans text-[10px] text-white/65 truncate mb-1.5">{book.author}</p>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={9}
              fill={i < book.rating ? "#F5C842" : "none"}
              stroke={i < book.rating ? "#F5C842" : "rgba(255,255,255,0.35)"}
              strokeWidth={1.5}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   AUDIOBOOK CARD — 2 cột × 1 hàng
   Horizontal: cover bên trái full-bleed + info bên phải sạch hơn
   ========================================================= */
interface AudioBentoCardProps {
  book: Book;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

export function AudioBentoCard({ book, onClick, isActive, className }: AudioBentoCardProps) {
  const { isOwned, acquire } = useLibraryStore();
  const owned = isOwned(book.id);

  return (
    <div
      onClick={onClick}
      className={cn(
        "col-span-2 relative rounded-2xl overflow-hidden cursor-pointer group flex",
        "border transition-all duration-200",
        isActive ? "border-brand border-2 shadow-md shadow-brand/15" : "border-warm-border hover:shadow-lg hover:border-brand/30",
        className
      )}
    >
      {/* Left: Cover */}
      <div className="relative w-[180px] flex-shrink-0 bg-surface-sunken overflow-hidden">
        <Image
          src={book.cover}
          alt={book.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="180px"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        {/* Hard fade sang right panel */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-surface-card" />
      </div>

      {/* Right: Info — full flex column, space-between */}
      <div className="flex-1 px-5 py-4 flex flex-col justify-between min-w-0 bg-surface-card">

        {/* Top: badge + title + author */}
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-sans font-bold uppercase tracking-wider">
            <Headphones size={8} strokeWidth={2.5} />
            Audiobook
          </span>
          <h3 className="font-display text-[16px] font-bold text-ink leading-snug line-clamp-2 pt-0.5">
            {book.title}
          </h3>
          <p className="font-sans text-[12px] text-ink-secondary">
            by {book.author}
            {book.narrator && <span className="text-ink-secondary/60"> · {book.narrator}</span>}
          </p>
        </div>

        {/* Play Sample — owned: play thật | chưa owned: mở panel */}
        <button
          onClick={(e) => { e.stopPropagation(); if (!owned) onClick?.(); }}
          className="self-start flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-[12px] font-sans font-semibold
            hover:opacity-90 transition-opacity"
        >
          <Play size={12} fill="white" strokeWidth={0} className="ml-0.5" />
          Play Sample
        </button>

        {/* Bottom: length + stars */}
        <div className="flex items-center justify-between border-t border-warm-border/50 pt-2.5">
          {book.length && (
            <span className="flex items-center gap-1.5 font-sans text-[11px] text-ink-secondary">
              <Clock size={11} strokeWidth={1.8} />
              {book.length}
            </span>
          )}
          <div className="flex items-center gap-0.5 ml-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={10}
                fill={i < book.rating ? "var(--color-brand)" : "none"}
                stroke={i < book.rating ? "var(--color-brand)" : "var(--color-warm-border)"}
                strokeWidth={1.5}
              />
            ))}
            <span className="font-sans text-[10px] text-ink-secondary ml-1">({book.ratingCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD — 1 cột × 1 hàng
   ========================================================= */
interface StatBentoCardProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  accent?: boolean;
  className?: string;
}

export function StatBentoCard({ value, label, icon, accent = false, className }: StatBentoCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 flex flex-col justify-between transition-all duration-200",
        accent
          ? "bg-brand border-brand hover:bg-brand-hover"
          : "bg-surface-card border-warm-border hover:border-brand/40 hover:shadow-sm",
        className
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          accent ? "bg-white/20" : "bg-brand-muted"
        )}
      >
        <span className={accent ? "text-white" : "text-brand"}>{icon}</span>
      </div>
      <div>
        <p className={cn("font-display text-[32px] font-bold leading-none mb-1", accent ? "text-white" : "text-ink")}>
          {value}
        </p>
        <p className={cn("font-sans text-[12px] font-medium", accent ? "text-white/75" : "text-ink-secondary")}>
          {label}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   QUOTE CARD — 2 cột × 1 hàng
   ========================================================= */
interface QuoteBentoCardProps {
  quote: string;
  attribution: string;
  className?: string;
}

export function QuoteBentoCard({ quote, attribution, className }: QuoteBentoCardProps) {
  return (
    <div
      className={cn(
        "col-span-2 rounded-2xl border border-warm-border bg-surface-raised",
        "p-5 flex flex-col justify-between overflow-hidden relative",
        className
      )}
    >
      <span
        className="absolute -top-4 right-3 font-display text-[140px] leading-none select-none pointer-events-none"
        style={{ color: "var(--color-warm-border)" }}
      >
        "
      </span>
      <p className="font-display text-[15px] text-ink leading-relaxed relative z-10 italic max-w-[82%]">
        &ldquo;{quote}&rdquo;
      </p>
      <p className="font-sans text-[12px] text-ink-secondary">
        — {attribution}
      </p>
    </div>
  );
}

/* =========================================================
   CATEGORY CARD — 1 cột × 1 hàng
   ========================================================= */
interface CategoryBentoCardProps {
  label: string;
  count: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

export function CategoryBentoCard({ label, count, icon, color, onClick, isActive, className }: CategoryBentoCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border cursor-pointer group",
        "flex flex-col items-center justify-center gap-2.5",
        "transition-all duration-200 hover:shadow-md",
        isActive
          ? "border-brand bg-brand-muted"
          : "border-warm-border bg-surface-card hover:border-brand/40",
        className
      )}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
        style={{ backgroundColor: color + "20" }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="text-center">
        <p className="font-sans text-[13px] font-semibold text-ink">{label}</p>
        <p className="font-sans text-[11px] text-ink-secondary">{count} titles</p>
      </div>
    </div>
  );
}
