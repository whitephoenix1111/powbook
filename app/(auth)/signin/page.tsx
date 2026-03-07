"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, AlertCircle, ArrowRight, BookOpen, CheckCircle2, Flame } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

/* ── Slides (shared với login) ───────────────────────────── */
const SLIDES = [
  { title: "Welcome Back",            desc: "Your library is right where you left it.",                             img: "https://illustrations.popsy.co/amber/reading.svg" },
  { title: "Pick Up Where You Left",  desc: "Bookmarks, progress, and notes — all synced and waiting.",            img: "https://illustrations.popsy.co/amber/traveling.svg" },
  { title: "Your Lists, Your Rules",  desc: "Custom collections you built are still here, fully intact.",          img: "https://illustrations.popsy.co/amber/woman-meditating.svg" },
  { title: "One Account, Everything", desc: "Litverse, Recognotes, and Sparks — sign in once, access all.",        img: "https://illustrations.popsy.co/amber/online-learning.svg" },
];

const SOCIAL = [
  {
    label: "Google",
    icon: (<svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>),
  },
  {
    label: "Apple",
    icon: (<svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>),
  },
  {
    label: "Facebook",
    icon: (<svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1877F2" aria-hidden><path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.031 4.388 11.031 10.125 11.927v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.793-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796v8.437C19.612 23.104 24 18.104 24 12.073z"/></svg>),
  },
];

function validateEmail(v: string) {
  if (!v) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
  return "";
}

export default function SignInPage() {
  const [slide, setSlide]           = useState(0);
  const [showPass, setShowPass]     = useState(false);
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [emailTouched, setEmailTouched]     = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess]       = useState(false);
  const [imgFaded, setImgFaded]     = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { login } = useAuthStore();
  const router = useRouter();

  const emailError = validateEmail(email);
  const passwordError = !password ? "Password is required." : "";
  const isFormValid = !emailError && !passwordError;

  /* Auto-advance carousel */
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setImgFaded(true);
      setTimeout(() => { setSlide((s) => (s + 1) % SLIDES.length); setImgFaded(false); }, 300);
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
    const result = login(email, password);
    if (!result.ok) {
      setServerError(result.error ?? "Something went wrong.");
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/"), 1800);
  }

  const current = SLIDES[slide];

  const emailState = emailTouched && emailError ? "error" : emailTouched && !emailError ? "ok" : "idle";
  const passwordState = passwordTouched && passwordError ? "error" : passwordTouched && !passwordError ? "ok" : "idle";

  const fieldCls = (state: "idle" | "error" | "ok") =>
    `w-full px-4 py-2.5 rounded-xl border bg-surface-card text-ink text-[13px] font-sans
     placeholder:text-ink-secondary/60 focus:outline-none transition-all duration-200
     ${ state === "error" ? "border-red-400 focus:ring-2 focus:ring-red-300/50"
        : state === "ok"  ? "border-emerald-400 focus:ring-2 focus:ring-emerald-300/50"
        : "border-warm-border focus:border-brand focus:ring-2 focus:ring-brand/20" }`;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="flex w-full max-w-[860px] rounded-2xl overflow-hidden border border-warm-border shadow-xl shadow-ink/5" style={{ minHeight: 580 }}>

        {/* LEFT — carousel */}
        <div className="hidden md:flex flex-col flex-1 bg-surface-raised border-r border-warm-border p-10 select-none relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full border border-warm-border/60 pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full border border-warm-border/60 pointer-events-none" />

          <Link href="/" className="flex items-center gap-2 mb-auto w-fit group">
            <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center group-hover:bg-brand-hover transition-colors">
              <Flame size={14} color="white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-[15px] font-bold text-ink group-hover:text-brand transition-colors">Powbook</span>
          </Link>

          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-[260px] h-[240px] transition-opacity duration-300" style={{ opacity: imgFaded ? 0 : 1 }}>
              <Image key={current.img} src={current.img} alt={current.title} fill className="object-contain" unoptimized />
            </div>
          </div>

          <div className="transition-opacity duration-300" style={{ opacity: imgFaded ? 0 : 1 }}>
            <h2 className="font-display text-[20px] font-bold text-ink mb-2">{current.title}</h2>
            <p className="font-sans text-[13px] text-ink-secondary leading-relaxed max-w-[300px]">{current.desc}</p>
          </div>

          <div className="flex items-center gap-2 mt-6">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => goToSlide(i)}
                className={`rounded-full transition-all duration-300 ${ i === slide ? "w-6 h-2 bg-brand" : "w-2 h-2 bg-warm-border hover:bg-ink-secondary" }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="flex flex-col justify-center w-full md:w-[380px] flex-shrink-0 bg-surface-card px-8 py-10">

          {success ? (
            <div className="flex flex-col items-center text-center gap-4 py-8">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 size={28} strokeWidth={1.8} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="font-display text-[20px] font-bold text-ink mb-1">Welcome back!</h2>
                <p className="font-sans text-[13px] text-ink-secondary">Taking you to your library…</p>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile logo */}
              <Link href="/" className="flex md:hidden items-center gap-1.5 mb-6 w-fit group">
                <div className="w-6 h-6 rounded-md bg-brand flex items-center justify-center group-hover:bg-brand-hover transition-colors">
                  <Flame size={14} color="white" strokeWidth={2.5} />
                </div>
                <span className="font-display text-[14px] font-bold text-ink group-hover:text-brand transition-colors">Powbook</span>
              </Link>

              <div className="mb-6">
                <h1 className="font-display text-[22px] font-bold text-ink mb-1">Sign in</h1>
                <p className="font-sans text-[12px] text-ink-secondary">Welcome back to Litverse, Recognotes &amp; Sparks</p>
              </div>

              {/* Social */}
              <div className="flex gap-2 mb-5">
                {SOCIAL.map(({ label, icon }) => (
                  <button key={label} title={`Continue with ${label}`}
                    className="flex items-center justify-center gap-2 flex-1 px-3 py-2.5 rounded-xl border border-warm-border bg-surface-card text-ink text-[12px] font-sans font-medium hover:bg-surface-raised transition-colors"
                  >
                    {icon}
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-warm-border" />
                <span className="font-sans text-[11px] text-ink-secondary whitespace-nowrap">or sign in with email</span>
                <div className="flex-1 h-px bg-warm-border" />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="block font-sans text-[11px] font-semibold text-ink-secondary uppercase tracking-widest mb-1.5">Email address</label>
                <div className="relative">
                  <input type="email" placeholder="you@example.com" value={email}
                    onChange={(e) => { setEmail(e.target.value); setServerError(""); }}
                    onBlur={() => setEmailTouched(true)}
                    className={fieldCls(emailState) + " pr-9"}
                  />
                  {emailState === "ok"    && <CheckCircle2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />}
                  {emailState === "error" && <AlertCircle  size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" />}
                </div>
                {emailState === "error" && (
                  <p className="mt-1.5 font-sans text-[11px] text-red-500 flex items-center gap-1"><AlertCircle size={11} /> {emailError}</p>
                )}
              </div>

              {/* Password */}
              <div className="mb-1">
                <label className="block font-sans text-[11px] font-semibold text-ink-secondary uppercase tracking-widest mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} placeholder="Your password" value={password}
                    onChange={(e) => { setPassword(e.target.value); setServerError(""); }}
                    onBlur={() => setPasswordTouched(true)}
                    className={fieldCls(passwordState) + " pr-9"}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-ink transition-colors"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end mt-2 mb-5">
                <button className="font-sans text-[12px] text-ink-secondary underline underline-offset-2 hover:text-brand transition-colors">Forgot password?</button>
              </div>

              {/* Server error */}
              {serverError && (
                <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                  <p className="font-sans text-[12px] text-red-600">{serverError}</p>
                </div>
              )}

              <button onClick={handleSubmit}
                className={`w-full py-3 rounded-xl font-sans text-[14px] font-semibold flex items-center justify-center gap-2 transition-all duration-200
                  ${ email && password
                      ? "bg-brand text-white hover:bg-brand-hover shadow-sm active:scale-[0.98]"
                      : "bg-surface-sunken text-ink-secondary cursor-not-allowed"
                  }`}
              >
                Sign in <ArrowRight size={15} />
              </button>

              <div className="h-px bg-warm-border my-5" />
              <p className="font-sans text-[12px] text-ink-secondary text-center">
                Don&apos;t have an account?{" "}
                <Link href="/login" className="text-brand font-semibold underline underline-offset-2 hover:text-brand-hover">Create one</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
