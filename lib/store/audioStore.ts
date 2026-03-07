import { create } from "zustand";
import { Book } from "@/lib/mockData";

interface AudioState {
  currentBook: Book | null;
  audioUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  audioRef: HTMLAudioElement | null;

  dismiss: () => void;
  setBook: (book: Book, audioUrl: string) => void;
  setAudioRef: (ref: HTMLAudioElement | null) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentBook: null,
  audioUrl: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  audioRef: null,

  dismiss: () => {
    const { audioRef } = get();
    audioRef?.pause();
    set({ currentBook: null, audioUrl: null, isPlaying: false, currentTime: 0, duration: 0 });
  },

  setBook: (book, audioUrl) => {
    set({ currentBook: book, audioUrl, currentTime: 0, duration: 0, isPlaying: true });
  },

  setAudioRef: (ref) => {
    console.log("[AudioStore] setAudioRef →", ref ? "HTMLAudioElement registered" : "null (unmounted)");
    set({ audioRef: ref });
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  seek: (time) => {
    const { audioRef } = get();
    if (!audioRef) return;
    audioRef.currentTime = time;
    set({ currentTime: time });
  },

  skipForward: (seconds = 10) => {
    const { audioRef } = get();
    console.log("[AudioStore] skipForward called", {
      seconds,
      audioRef: audioRef ? "exists" : "NULL ← bug here",
      currentTime: audioRef?.currentTime,
      duration: audioRef?.duration,
    });
    if (!audioRef) return;
    const newTime = Math.min(audioRef.currentTime + seconds, audioRef.duration || 0);
    console.log("[AudioStore] skipForward → seeking to", newTime);
    audioRef.currentTime = newTime;
    set({ currentTime: newTime });
  },

  skipBackward: (seconds = 10) => {
    const { audioRef } = get();
    console.log("[AudioStore] skipBackward called", {
      seconds,
      audioRef: audioRef ? "exists" : "NULL ← bug here",
      currentTime: audioRef?.currentTime,
      duration: audioRef?.duration,
    });
    if (!audioRef) return;
    const newTime = Math.max(audioRef.currentTime - seconds, 0);
    console.log("[AudioStore] skipBackward → seeking to", newTime);
    audioRef.currentTime = newTime;
    set({ currentTime: newTime });
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),

  setPlaybackRate: (rate) => {
    const { audioRef } = get();
    if (audioRef) audioRef.playbackRate = rate;
    set({ playbackRate: rate });
  },
}));

export function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}
