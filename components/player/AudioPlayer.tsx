"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Play, Pause, SkipForward, RotateCcw, RotateCw,
  List, Captions, Volume2, Maximize2,
} from "lucide-react";
import type { Book } from "@/lib/mockData";

interface AudioPlayerProps {
  book: Book;
}

export default function AudioPlayer({ book }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(38); // percentage
  const [speed, setSpeed] = useState(2);
  const trackRef = useRef<HTMLDivElement>(null);

  const speeds = [1, 1.25, 1.5, 2, 3];

  function cycleSpeed() {
    const idx = speeds.indexOf(speed);
    setSpeed(speeds[(idx + 1) % speeds.length]);
  }

  function handleTrackClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setProgress(Math.max(0, Math.min(100, pct)));
  }

  return (
    <div className="flex items-center gap-4 px-4 h-[72px] bg-brand flex-shrink-0 border-t border-brand-hover">

      {/* Book info */}
      <div className="flex items-center gap-3 w-[260px] flex-shrink-0">
        <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 border border-brand-hover">
          <Image src={book.cover} alt={book.title} fill className="object-cover" sizes="48px" />
        </div>
        <div className="min-w-0">
          <p className="font-sans text-[12px] font-semibold text-white leading-tight truncate">
            {book.title.length > 30 ? book.title.slice(0, 30) + "..." : book.title}
          </p>
          <p className="font-sans text-[11px] text-white/70 leading-tight mt-0.5">
            By:{" "}
            <span className="underline cursor-pointer">{book.author}</span>
            {book.narrator && (
              <> | Narrator: <span className="underline cursor-pointer">{book.narrator}</span></>
            )}
          </p>
        </div>
      </div>

      {/* Center controls + progress */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1.5">
        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Speed */}
          <button
            onClick={cycleSpeed}
            className="font-sans text-[12px] font-bold text-white w-8 h-6 rounded flex items-center justify-center border border-white/30 hover:bg-white/10 transition-colors"
          >
            {speed}x
          </button>

          {/* -15s */}
          <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors text-white relative">
            <RotateCcw size={18} strokeWidth={2} />
            <span className="absolute text-[8px] font-bold font-sans" style={{ bottom: "6px" }}>15</span>
          </button>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white border border-white/30"
          >
            {isPlaying
              ? <Pause size={18} fill="white" strokeWidth={0} />
              : <Play size={18} fill="white" strokeWidth={0} className="ml-0.5" />
            }
          </button>

          {/* +15s */}
          <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors text-white relative">
            <RotateCw size={18} strokeWidth={2} />
            <span className="absolute text-[8px] font-bold font-sans" style={{ bottom: "6px" }}>15</span>
          </button>

          {/* Skip next */}
          <button className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors text-white">
            <SkipForward size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Progress bar */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="w-full max-w-[420px] h-1 bg-white/30 rounded-full cursor-pointer relative group"
        >
          <div
            className="h-full bg-white rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1 w-[160px] justify-end flex-shrink-0">
        <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-white/10 transition-colors text-white/80 hover:text-white">
          <List size={16} strokeWidth={1.8} />
        </button>
        <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-white/10 transition-colors text-white/80 hover:text-white">
          <Captions size={16} strokeWidth={1.8} />
        </button>
        <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-white/10 transition-colors text-white/80 hover:text-white">
          <Volume2 size={16} strokeWidth={1.8} />
        </button>
        {/* Volume track */}
        <div className="w-16 h-1 bg-white/30 rounded-full cursor-pointer">
          <div className="w-3/4 h-full bg-white rounded-full" />
        </div>
        <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-white/10 transition-colors text-white/80 hover:text-white ml-1">
          <Maximize2 size={14} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
