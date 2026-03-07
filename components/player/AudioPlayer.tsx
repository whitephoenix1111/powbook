"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useAudioStore, formatTime } from "@/lib/store/audioStore";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  RotateCw,
  ListMusic,
  X,
} from "lucide-react";

export default function AudioPlayer() {
  const {
    currentBook,
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    setAudioRef,
    togglePlay,
    skipForward,
    skipBackward,
    setCurrentTime,
    setDuration,
    setPlaybackRate,
    seek,
    dismiss,
  } = useAudioStore();

  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Callback ref — gọi đúng lúc <audio> element mount/unmount vào DOM
  // Không phụ thuộc vào useEffect timing, luôn có ref thật khi element tồn tại
  const audioCallbackRef = useCallback((el: HTMLAudioElement | null) => {
    console.log("[AudioPlayer] audioCallbackRef →", el ? "mounted" : "unmounted");
    setAudioRef(el);
  }, [setAudioRef]);

  // Khi audioUrl thay đổi → load + play
  useEffect(() => {
    const el = useAudioStore.getState().audioRef;
    if (!el || !audioUrl) return;
    let cancelled = false;
    el.load();
    playPromiseRef.current = el.play().then(() => {
      if (cancelled) el.pause();
    }).catch(() => {
      if (!cancelled) useAudioStore.getState().pause();
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  // Sync isPlaying → element, đợi play promise để tránh race condition
  useEffect(() => {
    const el = useAudioStore.getState().audioRef;
    if (!el) return;
    if (isPlaying) {
      playPromiseRef.current = el.play().catch(() => {
        useAudioStore.getState().pause();
      });
    } else {
      if (playPromiseRef.current) {
        playPromiseRef.current.then(() => el.pause()).catch(() => {});
      } else {
        el.pause();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  // Sync playbackRate
  useEffect(() => {
    const el = useAudioStore.getState().audioRef;
    if (el) el.playbackRate = playbackRate;
  }, [playbackRate]);

  if (!currentBook || !audioUrl) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const RATES = [1, 1.25, 1.5, 2];
  const nextRate = () => {
    const idx = RATES.indexOf(playbackRate);
    setPlaybackRate(RATES[(idx + 1) % RATES.length]);
  };
  const rateLabel = playbackRate === 1 ? "1x" : playbackRate === 1.25 ? "1.25x" : playbackRate === 1.5 ? "1.5x" : "2x";

  return (
    <div className="w-full bg-ink text-white px-5 py-3 border-t border-ink/20 flex-shrink-0">

      <audio
        ref={audioCallbackRef}
        src={audioUrl}
        onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
        onLoadedMetadata={(e) => {
          const el = e.target as HTMLAudioElement;
          setDuration(el.duration);
          el.playbackRate = playbackRate;
        }}
        onEnded={() => useAudioStore.getState().pause()}
      />

      <div className="flex items-center gap-5">

        {/* ── Cover + Info ── */}
        <div className="flex items-center gap-3 w-[220px] flex-shrink-0">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-white/10">
            <Image src={currentBook.cover} alt={currentBook.title} fill className="object-cover" />
          </div>
          <div className="leading-tight min-w-0">
            <p className="font-display text-[13px] font-semibold text-white line-clamp-1">
              {currentBook.title}
            </p>
            <p className="font-sans text-[11px] text-white/50 mt-0.5 truncate">
              {currentBook.author}
              {currentBook.narrator && (
                <> · <span className="text-white/40">{currentBook.narrator}</span></>
              )}
            </p>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="flex items-center gap-2 flex-1 justify-center">

          {/* Speed */}
          <button
            onClick={nextRate}
            title="Playback speed"
            className="font-sans text-[11px] font-semibold text-white/60 hover:text-white
              w-11 h-8 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
          >
            {rateLabel}
          </button>

          {/* Rewind 10s */}
          <button
            onClick={() => skipBackward(10)}
            title="Rewind 10s"
            className="relative w-8 h-8 flex items-center justify-center rounded-md
              text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCcw size={15} />
            <span className="absolute text-[7px] font-bold bottom-1 font-sans">10</span>
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            className="w-9 h-9 flex items-center justify-center rounded-full
              bg-brand hover:bg-brand-hover transition-colors flex-shrink-0"
          >
            {isPlaying
              ? <Pause size={16} fill="white" strokeWidth={0} />
              : <Play size={16} fill="white" strokeWidth={0} />
            }
          </button>

          {/* Forward 10s */}
          <button
            onClick={() => skipForward(10)}
            title="Forward 10s"
            className="relative w-8 h-8 flex items-center justify-center rounded-md
              text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCw size={15} />
            <span className="absolute text-[7px] font-bold bottom-1 font-sans">10</span>
          </button>

          {/* Skip next */}
          <button
            className="w-8 h-8 flex items-center justify-center rounded-md
              text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
          >
            <SkipForward size={15} />
          </button>
        </div>

        {/* ── Progress + Time ── */}
        <div className="flex items-center gap-3 flex-1">
          <span className="font-mono text-[11px] text-white/40 w-9 text-right flex-shrink-0">
            {formatTime(currentTime)}
          </span>

          <div
            className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer group relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              seek((e.clientX - rect.left) / rect.width * duration);
            }}
          >
            <div className="h-full bg-brand rounded-full relative" style={{ width: `${progress}%` }}>
              <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2
                w-2.5 h-2.5 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <span className="font-mono text-[11px] text-white/40 w-9 flex-shrink-0">
            {formatTime(duration)}
          </span>
        </div>

        {/* ── Queue ── */}
        <button className="w-8 h-8 flex items-center justify-center rounded-md
          text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors flex-shrink-0">
          <ListMusic size={15} />
        </button>

        {/* ── Dismiss ── */}
        <div className="w-px h-4 bg-white/10 mx-1 flex-shrink-0" />
        <button
          onClick={dismiss}
          title="Close player"
          className="w-8 h-8 flex items-center justify-center rounded-md
            text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <X size={14} strokeWidth={2} />
        </button>

      </div>
    </div>
  );
}
