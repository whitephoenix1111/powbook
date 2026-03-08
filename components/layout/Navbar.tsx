"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";

interface NavbarProps {
  searchPlaceholder?: string;
}

export default function Navbar({ searchPlaceholder = "Title, author, host, or topic" }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);
  const { currentUser, logout } = useAuthStore();
  const router = useRouter();
  const isLoggedIn = !!currentUser;

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/category?q=${encodeURIComponent(query.trim())}&type=All`);
      setQuery("");
    }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayName = currentUser?.email.split("@")[0] ?? "";
  const avatarSrc = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser?.email ?? "")}&backgroundColor=b6e3f4`;

  async function handleLogout() {
    setOpen(false);
    await logout();
    router.push("/signin");
  }

  return (
    <header className="flex items-center gap-4 px-5 h-[64px] bg-yellow border-b border-warm-border flex-shrink-0">
      {/* Search */}
      <div className="flex-1 flex items-center gap-2.5 bg-surface-card border border-warm-border rounded-lg px-3.5 h-[38px] max-w-[480px]">
        <Search size={15} className="text-ink-secondary flex-shrink-0" strokeWidth={2} />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          className="flex-1 bg-transparent text-[13px] font-sans text-ink placeholder:text-ink-secondary focus:outline-none"
        />
      </div>

      <div className="flex-1" />

      {/* ── Logged OUT — Sign in / Create account ── */}
      {!isLoggedIn && (
        <div className="flex items-center gap-2">
          <Link
            href="/signin"
            className="px-4 py-2 rounded-xl font-sans text-[13px] font-medium text-ink hover:bg-surface-sunken transition-colors no-underline"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-ink text-white font-sans text-[13px] font-semibold hover:bg-ink/85 transition-colors no-underline"
          >
            Create Account
          </Link>
        </div>
      )}

      {/* ── Logged IN — User dropdown ── */}
      {isLoggedIn && (
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-surface-sunken transition-colors"
          >
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-warm-border bg-surface-sunken flex-shrink-0">
              <Image src={avatarSrc} alt={displayName} fill className="object-cover" unoptimized />
            </div>
            <div className="text-left hidden sm:block">
              <p className="font-sans text-[13px] font-semibold text-ink leading-tight capitalize">{displayName}</p>
              <p className="font-sans text-[11px] text-ink-secondary leading-tight">Story Seeker</p>
            </div>
            <ChevronDown
              size={13}
              strokeWidth={2.5}
              className={`text-ink-secondary transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown panel */}
          {open && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[220px] bg-surface-card border border-warm-border rounded-2xl shadow-lg shadow-ink/10 overflow-hidden z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-warm-border">
                <p className="font-sans text-[12px] font-semibold text-ink capitalize">{displayName}</p>
                <p className="font-sans text-[11px] text-ink-secondary truncate">{currentUser?.email}</p>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <button
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 font-sans text-[13px] text-ink hover:bg-surface-sunken transition-colors text-left"
                >
                  <User size={14} strokeWidth={1.8} className="text-ink-secondary" />
                  Profile
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 font-sans text-[13px] text-ink hover:bg-surface-sunken transition-colors text-left"
                >
                  <Settings size={14} strokeWidth={1.8} className="text-ink-secondary" />
                  Settings
                </button>
              </div>

              <div className="h-px bg-warm-border" />

              <div className="py-1.5">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 font-sans text-[13px] text-red-500 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut size={14} strokeWidth={1.8} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bell */}
      <button className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-sunken transition-colors">
        <Bell size={17} className="text-ink" strokeWidth={1.8} />
      </button>
    </header>
  );
}
