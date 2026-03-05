"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Play, Headphones, Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
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
      {/* Background cover image */}
      <Image
        src={book.cover}
        alt={book.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 1200px) 50vw, 600px"
      />

      {/* Gradient: top fade + bottom heavy */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20" />

      {/* Type badge — top left */}
      <div className="absolute top-4 left-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand text-white text-[11px] font-sans font-bold uppercase tracking-widest">
          {book.type === "audiobook" ? (
            <><Headphones size={10} strokeWidth={2.5} /> Audiobook</>
          ) : (
            <><BookOpen size={10} strokeWidth={2.5} /> E-Book</>
          )}
        </span>
      </div>

      {/* "Featured" label — top right */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-sm text-white text-[11px] font-sans">
          Featured
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        {/* Stars */}
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

        {/* Title */}
        <h2 className="font-display text-white text-[26px] font-bold leading-tight mb-1 drop-shadow">
          {book.title}
        </h2>
        <p className="text-white/70 text-[13px] font-sans mb-4">
          by {book.author}
          {book.narrator && <span className="text-white/50"> · {book.narrator}</span>}
        </p>

        {/* CTA row */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-[13px] font-sans font-semibold hover:bg-brand-hover transition-colors"
          >
            <Play size={13} fill="white" strokeWidth={0} />
            {book.type === "audiobook" ? "Play Sample" : "Read Now"}
          </button>
          <Link
            href={`/reader/${book.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm text-white text-[13px] font-sans font-medium hover:bg-white/25 transition-colors no-underline"
          >
            <BookOpen size={13} strokeWidth={1.8} />
            Open Reader
          </Link>
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
   Vertical cover với info strip ở dưới
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
        "relative rounded-2xl overflow-hidden cursor-pointer group flex flex-col",
        "border bg-surface-card transition-all duration-200 hover:shadow-md",
        isActive ? "border-brand border-2 shadow-md shadow-brand/15" : "border-warm-border",
        className
      )}
    >
      {/* Cover — chiếm hầu hết chiều cao */}
      <div className="relative flex-1 bg-surface-sunken overflow-hidden">
        <Image
          src={book.cover}
          alt={book.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-108"
          sizes="200px"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        {/* Overlay khi hover */}
        <div className="absolute inset-0 bg-brand/0 group-hover:bg-brand/5 transition-colors duration-200" />

        {/* Active indicator */}
        {isActive && (
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand" />
        )}
      </div>

      {/* Info strip */}
      <div className="px-2.5 py-2 bg-surface-card flex-shrink-0 border-t border-warm-border">
        <h4 className="font-display text-[11.5px] font-bold text-ink leading-tight line-clamp-1 mb-0.5">
          {book.title}
        </h4>
        <p className="font-sans text-[10px] text-ink-secondary truncate">{book.author}</p>
        <div className="flex items-center gap-0.5 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={9}
              fill={i < book.rating ? "var(--color-brand)" : "none"}
              stroke={i < book.rating ? "var(--color-brand)" : "var(--color-warm-border)"}
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
   Horizontal: cover bên trái + info bên phải + play hover
   ========================================================= */
interface AudioBentoCardProps {
  book: Book;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
}

export function AudioBentoCard({ book, onClick, isActive, className }: AudioBentoCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "col-span-2 relative rounded-2xl overflow-hidden cursor-pointer group flex",
        "border bg-surface-card transition-all duration-200 hover:shadow-md",
        isActive ? "border-brand border-2 shadow-md shadow-brand/15" : "border-warm-border",
        className
      )}
    >
      {/* Left: Cover */}
      <div className="relative w-[140px] flex-shrink-0 bg-surface-sunken overflow-hidden">
        <Image
          src={book.cover}
          alt={book.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="140px"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/35 transition-all duration-200">
          <div className="w-11 h-11 rounded-full bg-brand flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
            <Play size={18} fill="white" strokeWidth={0} className="ml-0.5" />
          </div>
        </div>
      </div>

      {/* Right: Info */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-muted text-brand text-[10px] font-sans font-bold uppercase tracking-wider mb-2">
            <Headphones size={9} strokeWidth={2.5} />
            Audiobook
          </span>
          <h3 className="font-display text-[15px] font-bold text-ink leading-tight mb-1 line-clamp-2">
            {book.title}
          </h3>
          <p className="font-sans text-[12px] text-ink-secondary truncate">
            by {book.author}
          </p>
        </div>
        <div className="flex items-center justify-between">
          {book.length && (
            <span className="flex items-center gap-1 font-sans text-[11px] text-ink-secondary">
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
   Icon + số to + label
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
      {/* Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          accent ? "bg-white/20" : "bg-brand-muted"
        )}
      >
        <span className={accent ? "text-white" : "text-brand"}>{icon}</span>
      </div>

      {/* Value + label */}
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
   Editorial retro: dấu nháy to + quote + attribution
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
      {/* Decorative huge quote mark */}
      <span
        className="absolute -top-4 right-3 font-display text-[140px] leading-none select-none pointer-events-none"
        style={{ color: "var(--color-warm-border)" }}
      >
        
      </span>

      {/* Quote text */}
      <p className="font-display text-[15px] text-ink leading-relaxed relative z-10 italic max-w-[82%]">
        &ldquo;{quote}&rdquo;
      </p>

      {/* Attribution */}
      <p className="font-sans text-[12px] text-ink-secondary">
        — {attribution}
      </p>
    </div>
  );
}

/* =========================================================
   CATEGORY CARD — 1 cột × 1 hàng
   Icon lớn + label + số lượng
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
      {/* Icon container */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
        style={{ backgroundColor: color + "20" }}
      >
        <span style={{ color }}>{icon}</span>
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="font-sans text-[13px] font-semibold text-ink">{label}</p>
        <p className="font-sans text-[11px] text-ink-secondary">{count} titles</p>
      </div>
    </div>
  );
}
