"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useAudioStore, formatTime } from "@/lib/store/audioStore";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  RotateCw,
  ListMusic,
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
  } = useAudioStore();

  const audioRef = useRef<HTMLAudioElement>(null);

  // Đăng ký audioRef vào store
  useEffect(() => {
    setAudioRef(audioRef.current);
    return () => setAudioRef(null);
  }, [setAudioRef]);

  // Sync playbackRate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  if (!currentBook || !audioUrl) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const RATES = [1, 1.25, 1.5, 2];
  const nextRate = () => {
    const idx = RATES.indexOf(playbackRate);
    setPlaybackRate(RATES[(idx + 1) % RATES.length]);
  };

  return (
    <div className="w-full bg-[#F97316] text-white px-4 py-3 border-t-2 border-black">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => useAudioStore.getState().pause()}
      />

      <div className="flex items-center gap-4">
        {/* Cover + Info */}
        <div className="flex items-center gap-3 min-w-[220px]">
          <div className="relative w-12 h-12 rounded border-2 border-black overflow-hidden flex-shrink-0">
            <Image
              src={currentBook.cover}
              alt={currentBook.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="leading-tight">
            <p className="font-bold text-sm line-clamp-1">{currentBook.title}</p>
            <p className="text-xs opacity-80">
              By:{" "}
              <span className="underline cursor-pointer">{currentBook.author}</span>
              {currentBook.narrator && (
                <>
                  {" "}| Narrator:{" "}
                  <span className="underline cursor-pointer">
                    {currentBook.narrator}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-1 justify-center">
          {/* Speed */}
          <button
            onClick={nextRate}
            className="text-sm font-bold w-9 h-9 border-2 border-black rounded bg-white text-black hover:bg-yellow-100 transition"
          >
            {playbackRate}x
          </button>

          {/* Rewind 15s */}
          <button
            onClick={() => skipBackward(15)}
            className="relative w-9 h-9 flex items-center justify-center border-2 border-black rounded bg-white text-black hover:bg-yellow-100 transition"
          >
            <RotateCcw size={16} />
            <span className="absolute text-[8px] font-bold bottom-0.5">15</span>
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            className="w-11 h-11 flex items-center justify-center border-2 border-black rounded-full bg-white text-black hover:bg-yellow-100 transition"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          {/* Forward 15s */}
          <button
            onClick={() => skipForward(15)}
            className="relative w-9 h-9 flex items-center justify-center border-2 border-black rounded bg-white text-black hover:bg-yellow-100 transition"
          >
            <RotateCw size={16} />
            <span className="absolute text-[8px] font-bold bottom-0.5">15</span>
          </button>

          {/* Skip next */}
          <button className="w-9 h-9 flex items-center justify-center border-2 border-black rounded bg-white text-black hover:bg-yellow-100 transition">
            <SkipForward size={16} />
          </button>
        </div>

        {/* Progress + Time */}
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs font-mono w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div
            className="flex-1 h-2 bg-white/30 rounded-full cursor-pointer relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              seek(ratio * duration);
            }}
          >
            <div
              className="h-full bg-white rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-mono w-10">{formatTime(duration)}</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center border-2 border-black rounded bg-white text-black hover:bg-yellow-100 transition">
            <ListMusic size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
