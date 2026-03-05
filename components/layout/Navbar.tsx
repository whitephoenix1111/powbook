"use client";

import { Search, Bell, ChevronDown } from "lucide-react";
import Image from "next/image";

interface NavbarProps {
  searchPlaceholder?: string;
}

export default function Navbar({ searchPlaceholder = "Title, author, host, or topic" }: NavbarProps) {
  return (
    <header className="flex items-center gap-4 px-5 h-[64px] bg-yellow border-b border-warm-border flex-shrink-0">
      {/* Search */}
      <div className="flex-1 flex items-center gap-2.5 bg-surface-card border border-warm-border rounded-lg px-3.5 h-[38px] max-w-[480px]">
        <Search size={15} className="text-ink-secondary flex-shrink-0" strokeWidth={2} />
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="flex-1 bg-transparent text-[13px] font-sans text-ink placeholder:text-ink-secondary focus:outline-none"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User */}
      <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-warm-border bg-surface-sunken flex-shrink-0">
          <Image
            src="https://api.dicebear.com/7.x/adventurer/svg?seed=BruceWayne&backgroundColor=b6e3f4"
            alt="Bruce Wayne"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="text-left">
          <p className="font-sans text-[13px] font-semibold text-ink leading-tight">Bruce Wayne</p>
          <p className="font-sans text-[11px] text-ink-secondary leading-tight">Story Seeker</p>
        </div>
        <ChevronDown size={14} className="text-ink-secondary" strokeWidth={2} />
      </button>

      {/* Bell */}
      <button className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-sunken transition-colors ml-1">
        <Bell size={17} className="text-ink" strokeWidth={1.8} />
      </button>
    </header>
  );
}
