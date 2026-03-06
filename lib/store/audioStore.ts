import { create } from "zustand";
import { Book } from "@/lib/mockData";

interface AudioState {
  // Current book playing
  currentBook: Book | null;
  audioUrl: string | null;

  // Playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;

  // Audio element ref (không lưu vào persist)
  audioRef: HTMLAudioElement | null;

  // Actions
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
  // Initial state
  currentBook: null,
  audioUrl: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  audioRef: null,

  // Ẩn player (reset toàn bộ state)
  dismiss: () => {
    const { audioRef } = get();
    audioRef?.pause();
    set({ currentBook: null, audioUrl: null, isPlaying: false, currentTime: 0, duration: 0 });
  },

  // Set book & url (gọi khi mở trang reader)
  setBook: (book, audioUrl) => {
    set({ currentBook: book, audioUrl, currentTime: 0, isPlaying: false });
  },

  // Lưu ref của <audio> element
  setAudioRef: (ref) => set({ audioRef: ref }),

  play: () => {
    const { audioRef } = get();
    audioRef?.play();
    set({ isPlaying: true });
  },

  pause: () => {
    const { audioRef } = get();
    audioRef?.pause();
    set({ isPlaying: false });
  },

  togglePlay: () => {
    const { isPlaying } = get();
    if (isPlaying) {
      get().pause();
    } else {
      get().play();
    }
  },

  seek: (time) => {
    const { audioRef } = get();
    if (audioRef) {
      audioRef.currentTime = time;
      set({ currentTime: time });
    }
  },

  skipForward: (seconds = 15) => {
    const { audioRef, currentTime, duration } = get();
    const newTime = Math.min(currentTime + seconds, duration);
    if (audioRef) {
      audioRef.currentTime = newTime;
      set({ currentTime: newTime });
    }
  },

  skipBackward: (seconds = 15) => {
    const { audioRef, currentTime } = get();
    const newTime = Math.max(currentTime - seconds, 0);
    if (audioRef) {
      audioRef.currentTime = newTime;
      set({ currentTime: newTime });
    }
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),

  setPlaybackRate: (rate) => {
    const { audioRef } = get();
    if (audioRef) {
      audioRef.playbackRate = rate;
    }
    set({ playbackRate: rate });
  },
}));

// Helper: format seconds → "mm:ss" hoặc "h:mm:ss"
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
