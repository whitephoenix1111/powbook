import { create } from "zustand";

interface AudioState {
  currentUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  setTrack: (url: string) => void;
  togglePlay: () => void;
  setCurrentTime: (time: number) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  currentUrl: null,
  isPlaying: false,
  currentTime: 0,
  setTrack: (url) => set({ currentUrl: url, isPlaying: true }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setCurrentTime: (time) => set({ currentTime: time }),
}));
