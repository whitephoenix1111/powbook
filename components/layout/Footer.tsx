"use client";

import Link from "next/link";
import { Flame, BookOpen, Headphones } from "lucide-react";

const FOOTER_LINKS = [
  {
    heading: "Explore",
    items: [
      { label: "Home",       href: "/" },
      { label: "Categories", href: "/category" },
      { label: "Saved",      href: "/saved" },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Settings", href: "/settings" },
      { label: "Support",  href: "/support" },
      { label: "Sign out", href: "/logout" },
    ],
  },
  {
    heading: "Legal",
    items: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Use",   href: "#" },
      { label: "Licenses",       href: "#" },
    ],
  },
];

/* Icon SVG cho social — dùng inline SVG thay vì lucide vì lucide không có TikTok/Instagram */
function IconInstagram() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function IconTiktok() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.75a8.27 8.27 0 0 0 4.84 1.55V6.85a4.85 4.85 0 0 1-1.07-.16z"/>
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function IconYoutube() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
    </svg>
  );
}

const SOCIALS = [
  { label: "Instagram", icon: IconInstagram, href: "#" },
  { label: "TikTok",    icon: IconTiktok,    href: "#" },
  { label: "Facebook",  icon: IconFacebook,  href: "#" },
  { label: "YouTube",   icon: IconYoutube,   href: "#" },
];

const STATS = [
  { icon: BookOpen,   value: "2,400+", label: "E-Books" },
  { icon: Headphones, value: "1,200+", label: "Audiobooks" },
];

export default function Footer() {
  return (
    <footer className="flex-shrink-0 border-t border-warm-border bg-surface-raised">

      {/* ── Main content ── */}
      <div className="px-8 pt-8 pb-6 grid grid-cols-[1fr_auto] gap-10 items-start">

        {/* Left: Brand + tagline + stats + socials */}
        <div className="flex flex-col gap-5">
          {/* Logo + name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center">
              <Flame size={16} color="white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-[17px] font-bold text-ink">Powbook</span>
          </div>

          {/* Tagline */}
          <p className="font-sans text-[12px] text-ink-secondary leading-relaxed max-w-[240px]">
            A retro editorial digital library — read and listen to thousands of titles, anytime, anywhere.
          </p>

          {/* Mini stats + Socials — cùng một hàng */}
          <div className="flex items-center gap-3">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-warm-border bg-surface-card">
                <Icon size={13} strokeWidth={1.8} className="text-brand" />
                <span className="font-display text-[13px] font-bold text-ink">{value}</span>
                <span className="font-sans text-[11px] text-ink-secondary">{label}</span>
              </div>
            ))}

            {/* Divider */}
            <div className="w-px h-6 bg-warm-border mx-1" />

            {SOCIALS.map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                title={label}
                className="w-8 h-8 rounded-lg border border-warm-border bg-surface-card flex items-center justify-center
                  text-ink-secondary hover:text-brand hover:border-brand/40 hover:bg-brand-muted transition-all"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Right: Link columns */}
        <div className="flex gap-12">
          {FOOTER_LINKS.map(({ heading, items }) => (
            <div key={heading} className="flex flex-col gap-2.5">
              <p className="font-sans text-[10px] font-bold text-ink uppercase tracking-widest mb-0.5">
                {heading}
              </p>
              {items.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="font-sans text-[12px] text-ink-secondary hover:text-brand transition-colors no-underline"
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="px-8 py-3.5 border-t border-warm-border/60 flex items-center justify-between">
        <p className="font-sans text-[11px] text-ink-secondary/60">
          © {new Date().getFullYear()} Powbook · Built as a fresher portfolio project.
        </p>
        <p className="font-sans text-[11px] text-ink-secondary/60">
          Audio via{" "}
          <a href="https://librivox.org" target="_blank" rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-brand transition-colors">
            LibriVox
          </a>
          {" · "}
          Covers via{" "}
          <a href="https://openlibrary.org" target="_blank" rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-brand transition-colors">
            OpenLibrary
          </a>
        </p>
      </div>

    </footer>
  );
}
