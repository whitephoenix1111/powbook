import { create } from "zustand";
import { Book } from "@/lib/mockData";

interface AudioState {
  currentBook: Book | null;
  audioUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  // Ref đến <audio> element thật trong DOM — được set bởi AudioPlayer
  // thông qua callback ref, không phải useRef trực tiếp.
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

  // Reset time về 0 khi đổi sách — AudioPlayer sẽ tự load + play
  setBook: (book, audioUrl) => {
    set({ currentBook: book, audioUrl, currentTime: 0, duration: 0, isPlaying: true });
  },

  setAudioRef: (ref) => set({ audioRef: ref }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  seek: (time) => {
    const { audioRef } = get();
    if (!audioRef) return;
    audioRef.currentTime = time;
    set({ currentTime: time });
  },

  // Clamp về [0, duration] để tránh seek vượt biên
  skipForward: (seconds = 10) => {
    const { audioRef } = get();
    if (!audioRef) return;
    const newTime = Math.min(audioRef.currentTime + seconds, audioRef.duration || 0);
    audioRef.currentTime = newTime;
    set({ currentTime: newTime });
  },

  skipBackward: (seconds = 10) => {
    const { audioRef } = get();
    if (!audioRef) return;
    const newTime = Math.max(audioRef.currentTime - seconds, 0);
    audioRef.currentTime = newTime;
    set({ currentTime: newTime });
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),

  // Set cả element lẫn store để đồng bộ khi element remount
  setPlaybackRate: (rate) => {
    const { audioRef } = get();
    if (audioRef) audioRef.playbackRate = rate;
    set({ playbackRate: rate });
  },
}));

// Chuyển seconds → "m:ss" hoặc "h:mm:ss" tùy độ dài audio
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
