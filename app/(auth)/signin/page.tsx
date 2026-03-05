"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

const SLIDES = [
  {
    title: "Immersive Reading Mode",
    desc: "A synchronized ebook and audiobook feature where users can listen to the narration while the text is highlighted, offering a seamless reading and listening experience.",
    img: "https://illustrations.popsy.co/amber/reading.svg",
  },
  {
    title: "Curated For Your Taste",
    desc: "Our recommendation engine learns your reading habits and surfaces hidden gems you'd never find on your own.",
    img: "https://illustrations.popsy.co/amber/woman-meditating.svg",
  },
  {
    title: "Listen Anywhere",
    desc: "Take your library on the go. Download audiobooks and pick up right where you left off — on any device.",
    img: "https://illustrations.popsy.co/amber/traveling.svg",
  },
  {
    title: "One Subscription, Everything",
    desc: "Access Litverse, Recognotes, and Sparks — all with a single account and one monthly plan.",
    img: "https://illustrations.popsy.co/amber/online-learning.svg",
  },
];

const SOCIAL = [
  {
    label: "Continue with Google",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  {
    label: "Continue with Facebook",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1877F2" aria-hidden>
        <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.031 4.388 11.031 10.125 11.927v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.793-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796v8.437C19.612 23.104 24 18.104 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: "Continue with Apple",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
  },
];

export default function SignInPage() {
  const [slide, setSlide] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const current = SLIDES[slide];

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />

      <div className="flex flex-1 items-center justify-center p-6">
        <div
          className="flex w-full max-w-[900px] border border-warm-border rounded-2xl overflow-hidden"
          style={{ minHeight: "560px" }}
        >
          {/* ── LEFT — Illustration carousel ──────────────── */}
          <div className="flex flex-col flex-1 items-center justify-between bg-surface-raised p-10 select-none">
            <div className="flex-1 flex items-center justify-center w-full">
              <div className="relative w-[300px] h-[260px] border border-warm-border rounded-xl overflow-hidden bg-surface flex items-center justify-center">
                <Image
                  key={current.img}
                  src={current.img}
                  alt={current.title}
                  fill
                  className="object-contain p-4"
                  unoptimized
                />
              </div>
            </div>

            <div className="text-center max-w-[340px] mt-6">
              <h2 className="font-display text-[18px] font-semibold text-ink mb-2">
                {current.title}
              </h2>
              <p className="font-sans text-[13px] text-ink-secondary leading-relaxed">
                {current.desc}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-6">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`rounded-full transition-all duration-200 ${
                    i === slide
                      ? "w-6 h-2 bg-ink"
                      : "w-2 h-2 bg-warm-border hover:bg-ink-secondary"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* ── RIGHT — Sign in form ───────────────────────── */}
          <div className="flex flex-col justify-center w-[380px] flex-shrink-0 bg-surface-card border-l border-warm-border px-10 py-10">
            <div className="text-center mb-7">
              <h1 className="font-display text-[22px] font-bold text-ink mb-1">
                Sign in
              </h1>
              <p className="font-sans text-[12px] text-ink-secondary leading-relaxed">
                Welcome back to Litverse,<br />Recognotes, and Sparks
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mb-5">
              {SOCIAL.map(({ label, icon }) => (
                <button
                  key={label}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg border border-warm-border bg-surface-card text-ink text-[13px] font-sans font-medium hover:bg-surface transition-colors"
                >
                  {icon}
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-warm-border" />
              <span className="font-sans text-[11px] text-ink-secondary whitespace-nowrap">
                or sign in with
              </span>
              <div className="flex-1 h-px bg-warm-border" />
            </div>

            <div className="mb-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-warm-border bg-surface-card text-ink text-[13px] font-sans placeholder:text-ink-secondary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
              />
            </div>

            <div className="relative mb-2">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-lg border border-warm-border bg-surface-card text-ink text-[13px] font-sans placeholder:text-ink-secondary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-ink transition-colors"
              >
                {showPass ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>

            <div className="flex justify-end mb-5">
              <button className="font-sans text-[12px] text-ink underline underline-offset-2 hover:text-brand transition-colors">
                Recovery Password
              </button>
            </div>

            <button className="w-full py-3 rounded-lg bg-brand hover:bg-brand-hover text-white text-[14px] font-sans font-semibold transition-colors">
              Continue
            </button>

            <p className="font-sans text-[12px] text-ink-secondary text-center mt-5">
              Don&apos;t have an account?{" "}
              <Link href="/login" className="text-brand underline underline-offset-2 hover:text-brand-hover">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
