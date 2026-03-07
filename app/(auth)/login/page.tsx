"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, BookOpen, Flame } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

/* ── Inline SVG Illustrations ────────────────────────────── */
function IllustrationReading() {
  return (
    <svg viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Chair */}
      <rect x="80" y="160" width="120" height="12" rx="6" fill="#D4B896" />
      <rect x="90" y="172" width="12" height="40" rx="6" fill="#C4A882" />
      <rect x="178" y="172" width="12" height="40" rx="6" fill="#C4A882" />
      <rect x="75" y="120" width="130" height="45" rx="12" fill="#E8D5BC" />
      <rect x="75" y="100" width="16" height="65" rx="8" fill="#C4A882" />
      {/* Person */}
      <circle cx="155" cy="88" r="22" fill="#F5C9A0" />
      {/* Hair */}
      <ellipse cx="155" cy="72" rx="20" ry="12" fill="#3D2B1F" />
      <rect x="135" y="72" width="8" height="18" rx="4" fill="#3D2B1F" />
      {/* Body */}
      <rect x="128" y="108" width="54" height="52" rx="14" fill="#E8580A" />
      {/* Book open */}
      <rect x="118" y="128" width="36" height="26" rx="4" fill="#FFF8F0" transform="rotate(-8 118 128)" />
      <rect x="150" y="126" width="36" height="26" rx="4" fill="#FFF8F0" transform="rotate(5 150 126)" />
      <line x1="148" y1="128" x2="152" y2="154" stroke="#D4B896" strokeWidth="2" />
      {/* Lines on book */}
      <line x1="124" y1="136" x2="148" y2="133" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="125" y1="141" x2="147" y2="138" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="126" y1="146" x2="146" y2="143" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="153" y1="134" x2="177" y2="132" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="154" y1="139" x2="176" y2="137" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="155" y1="144" x2="175" y2="142" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round" />
      {/* Arms */}
      <rect x="108" y="120" width="28" height="14" rx="7" fill="#F5C9A0" transform="rotate(20 108 120)" />
      <rect x="164" y="115" width="28" height="14" rx="7" fill="#F5C9A0" transform="rotate(-15 164 115)" />
      {/* Floating stars */}
      <circle cx="210" cy="70" r="4" fill="#F5C842" opacity="0.8" />
      <circle cx="225" cy="90" r="2.5" fill="#E8580A" opacity="0.6" />
      <circle cx="65" cy="80" r="3" fill="#F5C842" opacity="0.7" />
      <circle cx="55" cy="105" r="2" fill="#E8580A" opacity="0.5" />
    </svg>
  );
}

function IllustrationCurated() {
  return (
    <svg viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Stack of books */}
      <rect x="60" y="170" width="160" height="20" rx="6" fill="#E8580A" />
      <rect x="70" y="152" width="140" height="20" rx="6" fill="#F5C842" />
      <rect x="80" y="134" width="120" height="20" rx="6" fill="#C4A882" />
      <rect x="90" y="116" width="100" height="20" rx="6" fill="#E8D5BC" />
      {/* Book spines detail */}
      <line x1="60" y1="176" x2="220" y2="176" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      <line x1="70" y1="158" x2="210" y2="158" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      {/* Magnifying glass */}
      <circle cx="165" cy="82" r="38" fill="white" stroke="#E8580A" strokeWidth="4" opacity="0.95" />
      <circle cx="165" cy="82" r="30" fill="#FFF8F0" />
      {/* Star inside glass */}
      <path d="M165 58 L169 72 L183 72 L172 81 L176 95 L165 87 L154 95 L158 81 L147 72 L161 72 Z" fill="#F5C842" />
      {/* Glass handle */}
      <line x1="190" y1="107" x2="210" y2="128" stroke="#E8580A" strokeWidth="6" strokeLinecap="round" />
      {/* Sparkles */}
      <circle cx="80" cy="75" r="4" fill="#F5C842" opacity="0.7" />
      <circle cx="95" cy="55" r="2.5" fill="#E8580A" opacity="0.5" />
      <circle cx="215" cy="65" r="3" fill="#F5C842" opacity="0.6" />
    </svg>
  );
}

function IllustrationListen() {
  return (
    <svg viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Person walking */}
      <circle cx="140" cy="72" r="24" fill="#F5C9A0" />
      {/* Hair */}
      <ellipse cx="140" cy="57" rx="22" ry="13" fill="#3D2B1F" />
      {/* Headphones */}
      <path d="M118 68 Q118 48 140 48 Q162 48 162 68" stroke="#E8580A" strokeWidth="5" fill="none" strokeLinecap="round" />
      <rect x="111" y="64" width="12" height="18" rx="6" fill="#E8580A" />
      <rect x="157" y="64" width="12" height="18" rx="6" fill="#E8580A" />
      {/* Body */}
      <rect x="115" y="94" width="50" height="56" rx="14" fill="#3D2B1F" />
      {/* Legs walking */}
      <rect x="120" y="146" width="16" height="44" rx="8" fill="#3D2B1F" transform="rotate(10 120 146)" />
      <rect x="144" y="146" width="16" height="44" rx="8" fill="#3D2B1F" transform="rotate(-8 144 146)" />
      {/* Shoes */}
      <ellipse cx="126" cy="192" rx="14" ry="7" fill="#1A1410" transform="rotate(10 126 192)" />
      <ellipse cx="156" cy="190" rx="14" ry="7" fill="#1A1410" transform="rotate(-8 156 190)" />
      {/* Arms */}
      <rect x="100" y="100" width="24" height="12" rx="6" fill="#F5C9A0" transform="rotate(30 100 100)" />
      <rect x="156" y="96" width="24" height="12" rx="6" fill="#F5C9A0" transform="rotate(-20 156 96)" />
      {/* Phone in hand */}
      <rect x="172" y="106" width="18" height="28" rx="5" fill="#E8D5BC" stroke="#C4A882" strokeWidth="1.5" />
      <rect x="175" y="110" width="12" height="18" rx="3" fill="#E8580A" opacity="0.3" />
      {/* Sound waves */}
      <path d="M205 95 Q215 105 205 115" stroke="#E8580A" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M212 88 Q228 105 212 122" stroke="#E8580A" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
      {/* Musical notes */}
      <text x="62" y="110" fontSize="22" fill="#F5C842" opacity="0.7">♪</text>
      <text x="42" y="80" fontSize="16" fill="#E8580A" opacity="0.5">♫</text>
    </svg>
  );
}

function IllustrationSubscription() {
  return (
    <svg viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Three floating cards */}
      {/* Card 1 — bottom */}
      <rect x="50" y="140" width="100" height="72" rx="12" fill="#E8D5BC" transform="rotate(-6 50 140)" />
      {/* Card 2 — middle */}
      <rect x="80" y="115" width="100" height="72" rx="12" fill="#F5C842" transform="rotate(3 80 115)" />
      {/* Card 3 — top */}
      <rect x="100" y="90" width="110" height="75" rx="12" fill="white" stroke="#E8D5BC" strokeWidth="2" />
      {/* Card 3 content */}
      <circle cx="124" cy="116" r="14" fill="#E8580A" />
      <path d="M118 116 L122 120 L130 112" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="145" y="108" width="52" height="6" rx="3" fill="#E8D5BC" />
      <rect x="145" y="120" width="38" height="6" rx="3" fill="#E8D5BC" />
      <rect x="108" y="138" width="90" height="6" rx="3" fill="#E8D5BC" opacity="0.6" />
      <rect x="108" y="150" width="70" height="6" rx="3" fill="#E8D5BC" opacity="0.4" />
      {/* Flame icon top right */}
      <circle cx="210" cy="72" r="28" fill="#E8580A" />
      <path d="M210 58 C210 58 222 68 220 78 C220 84 215 88 210 88 C205 88 200 84 200 78 C198 68 210 58 210 58Z" fill="white" opacity="0.9" />
      <path d="M210 72 C210 72 216 78 214 83 C213 86 210 88 210 88 C210 88 207 86 206 83 C204 78 210 72 210 72Z" fill="#F5C842" />
      {/* Sparkles */}
      <circle cx="58" cy="108" r="4" fill="#F5C842" opacity="0.8" />
      <circle cx="240" cy="140" r="3" fill="#E8580A" opacity="0.5" />
      <circle cx="72" cy="180" r="2.5" fill="#C4A882" opacity="0.6" />
    </svg>
  );
}

const SLIDE_ILLUSTRATIONS = [
  IllustrationReading,
  IllustrationCurated,
  IllustrationListen,
  IllustrationSubscription,
];

/* ── Carousel slides ─────────────────────────────────────── */
const SLIDES = [
  {
    title: "Immersive Reading Mode",
    desc: "Listen while the text highlights — ebook and audiobook in perfect sync.",
  },
  {
    title: "Curated For Your Taste",
    desc: "Our recommendation engine surfaces hidden gems you'd never find on your own.",
  },
  {
    title: "Listen Anywhere",
    desc: "Download and pick up right where you left off — on any device, anytime.",
  },
  {
    title: "One Subscription, Everything",
    desc: "Litverse, Recognotes, and Sparks — all with a single account.",
  },
];

/* ── Social buttons ──────────────────────────────────────── */
const SOCIAL = [
  {
    label: "Google",
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
    label: "Apple",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1877F2" aria-hidden>
        <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.031 4.388 11.031 10.125 11.927v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.793-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796v8.437C19.612 23.104 24 18.104 24 12.073z"/>
      </svg>
    ),
  },
];

/* ── Validation helpers ──────────────────────────────────── */
function validateEmail(v: string) {
  if (!v) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
  return "";
}

function validatePassword(v: string) {
  if (!v) return "Password is required.";
  if (v.length < 8) return "Must be at least 8 characters.";
  if (!/[A-Z]/.test(v)) return "Include at least one uppercase letter.";
  if (!/[0-9]/.test(v)) return "Include at least one number.";
  return "";
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-warm-border", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-emerald-500"];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? colors[score] : "bg-warm-border"
            }`}
          />
        ))}
      </div>
      <p className="font-sans text-[11px] text-ink-secondary">{labels[score]}</p>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export default function LoginPage() {
  const [slide, setSlide]         = useState(0);
  const [showPass, setShowPass]   = useState(false);
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [emailTouched, setEmailTouched]     = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [serverError, setServerError] = useState("");
  const [imgFaded, setImgFaded]       = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { register } = useAuthStore();
  const router = useRouter();

  const emailError    = validateEmail(email);
  const passwordError = validatePassword(password);
  const isFormValid   = !emailError && !passwordError;

  /* Auto-advance carousel every 4 s */
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setImgFaded(true);
      setTimeout(() => {
        setSlide((s) => (s + 1) % SLIDES.length);
        setImgFaded(false);
      }, 300);
    }, 4000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [slide]);

  function goToSlide(i: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setImgFaded(true);
    setTimeout(() => { setSlide(i); setImgFaded(false); }, 300);
  }

  function handleSubmit() {
    setEmailTouched(true);
    setPasswordTouched(true);
    setServerError("");
    if (!isFormValid) return;
    const result = register(email, password);
    if (!result.ok) {
      setServerError(result.error ?? "Something went wrong.");
      return;
    }
    setSubmitted(true);
    setTimeout(() => router.push("/"), 1800);
  }

  const current = SLIDES[slide];
  const CurrentIllustration = SLIDE_ILLUSTRATIONS[slide];

  /* ── Field state helpers ── */
  const emailState =
    emailTouched && emailError ? "error"
    : emailTouched && !emailError ? "ok"
    : "idle";

  const passwordState =
    passwordTouched && passwordError ? "error"
    : passwordTouched && !passwordError ? "ok"
    : "idle";

  const fieldCls = (state: "idle" | "error" | "ok") =>
    `w-full px-4 py-2.5 rounded-xl border bg-surface-card text-ink text-[13px] font-sans
     placeholder:text-ink-secondary/60 focus:outline-none transition-all duration-200
     ${ state === "error"
          ? "border-red-400 focus:ring-2 focus:ring-red-300/50"
          : state === "ok"
          ? "border-emerald-400 focus:ring-2 focus:ring-emerald-300/50"
          : "border-warm-border focus:border-brand focus:ring-2 focus:ring-brand/20"
     }`;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="flex w-full max-w-[860px] rounded-2xl overflow-hidden border border-warm-border shadow-xl shadow-ink/5"
           style={{ minHeight: 580 }}>

        {/* ══════════════════════════════════════════
            LEFT — Feature carousel
        ══════════════════════════════════════════ */}
        <div className="hidden md:flex flex-col flex-1 bg-surface-raised border-r border-warm-border p-10 select-none relative overflow-hidden">

          {/* Subtle decorative ring */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full border border-warm-border/60 pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full border border-warm-border/60 pointer-events-none" />

          {/* Logo — click to home */}
          <Link href="/" className="flex items-center gap-2 mb-auto w-fit group">
            <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center group-hover:bg-brand-hover transition-colors">
              <Flame size={14} color="white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-[15px] font-bold text-ink group-hover:text-brand transition-colors">Powbook</span>
          </Link>

          {/* Illustration */}
          <div className="flex-1 flex items-center justify-center">
            <div
              className="w-[260px] h-[240px] transition-opacity duration-300"
              style={{ opacity: imgFaded ? 0 : 1 }}
            >
              <CurrentIllustration />
            </div>
          </div>

          {/* Text */}
          <div
            className="transition-opacity duration-300"
            style={{ opacity: imgFaded ? 0 : 1 }}
          >
            <h2 className="font-display text-[20px] font-bold text-ink mb-2">
              {current.title}
            </h2>
            <p className="font-sans text-[13px] text-ink-secondary leading-relaxed max-w-[300px]">
              {current.desc}
            </p>
          </div>

          {/* Dots */}
          <div className="flex items-center gap-2 mt-6">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === slide
                    ? "w-6 h-2 bg-brand"
                    : "w-2 h-2 bg-warm-border hover:bg-ink-secondary"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            RIGHT — Form
        ══════════════════════════════════════════ */}
        <div className="flex flex-col justify-center w-full md:w-[380px] flex-shrink-0 bg-surface-card px-8 py-10">

          {/* Success state */}
          {submitted ? (
            <div className="flex flex-col items-center text-center gap-4 py-8">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 size={28} strokeWidth={1.8} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="font-display text-[20px] font-bold text-ink mb-1">Account created!</h2>
                <p className="font-sans text-[13px] text-ink-secondary">Welcome to Litverse. Your library awaits.</p>
              </div>
              <Link
                href="/"
                className="mt-2 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-white font-sans text-[13px] font-semibold hover:bg-brand-hover transition-colors"
              >
                Go to Dashboard <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <>
              {/* Mobile-only home link */}
              <Link href="/" className="flex md:hidden items-center gap-1.5 mb-6 w-fit group">
                <div className="w-6 h-6 rounded-md bg-brand flex items-center justify-center group-hover:bg-brand-hover transition-colors">
                  <BookOpen size={12} strokeWidth={2} className="text-white" />
                </div>
                <span className="font-display text-[14px] font-bold text-ink group-hover:text-brand transition-colors">Powbook</span>
              </Link>

              {/* Heading */}
              <div className="mb-6">
                <h1 className="font-display text-[22px] font-bold text-ink mb-1">Create an account</h1>
                <p className="font-sans text-[12px] text-ink-secondary">
                  One subscription for Litverse, Recognotes &amp; Sparks
                </p>
              </div>

              {/* Social buttons — 3 in a row */}
              <div className="flex gap-2 mb-5">
                {SOCIAL.map(({ label, icon }) => (
                  <button
                    key={label}
                    title={`Continue with ${label}`}
                    className="flex items-center justify-center gap-2 flex-1 px-3 py-2.5 rounded-xl border border-warm-border bg-surface-card text-ink text-[12px] font-sans font-medium hover:bg-surface-raised transition-colors"
                  >
                    {icon}
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-warm-border" />
                <span className="font-sans text-[11px] text-ink-secondary whitespace-nowrap">or sign up with email</span>
                <div className="flex-1 h-px bg-warm-border" />
              </div>

              {/* Email field */}
              <div className="mb-3">
                <label className="block font-sans text-[11px] font-semibold text-ink-secondary uppercase tracking-widest mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    className={fieldCls(emailState) + " pr-9"}
                  />
                  {emailState === "ok" && (
                    <CheckCircle2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                  )}
                  {emailState === "error" && (
                    <AlertCircle size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" />
                  )}
                </div>
                {emailState === "error" && (
                  <p className="mt-1.5 font-sans text-[11px] text-red-500 flex items-center gap-1">
                    <AlertCircle size={11} /> {emailError}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="mb-1">
                <label className="block font-sans text-[11px] font-semibold text-ink-secondary uppercase tracking-widest mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 8 chars, 1 uppercase, 1 number"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    className={fieldCls(passwordState) + " pr-9"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-ink transition-colors"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                </div>
                {passwordState === "error" && (
                  <p className="mt-1.5 font-sans text-[11px] text-red-500 flex items-center gap-1">
                    <AlertCircle size={11} /> {passwordError}
                  </p>
                )}
                <PasswordStrength password={password} />
              </div>

              {/* Forgot */}
              <div className="flex justify-end mt-2 mb-5">
                <button className="font-sans text-[12px] text-ink-secondary underline underline-offset-2 hover:text-brand transition-colors">
                  Forgot password?
                </button>
              </div>

              {/* Server error */}
              {serverError && (
                <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                  <p className="font-sans text-[12px] text-red-600">{serverError}</p>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleSubmit}
                className={`w-full py-3 rounded-xl font-sans text-[14px] font-semibold flex items-center justify-center gap-2 transition-all duration-200
                  ${ isFormValid
                      ? "bg-brand text-white hover:bg-brand-hover shadow-sm active:scale-[0.98]"
                      : "bg-surface-sunken text-ink-secondary cursor-not-allowed"
                  }`}
              >
                Create account <ArrowRight size={15} />
              </button>

              {/* Terms */}
              <p className="font-sans text-[11px] text-ink-secondary text-center mt-3 leading-relaxed">
                By continuing you agree to our{" "}
                <span className="underline underline-offset-2 cursor-pointer hover:text-brand transition-colors">Terms</span>{" "}and{" "}
                <span className="underline underline-offset-2 cursor-pointer hover:text-brand transition-colors">Privacy Policy</span>.
              </p>

              {/* Sign in link */}
              <div className="h-px bg-warm-border my-5" />
              <p className="font-sans text-[12px] text-ink-secondary text-center">
                Already have an account?{" "}
                <Link href="/signin" className="text-brand font-semibold underline underline-offset-2 hover:text-brand-hover">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
