"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import AudioPlayer from "@/components/player/AudioPlayer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* ── Sidebar — cố định bên trái, xuyên suốt app ── */}
      <Sidebar />

      {/* ── Cột phải: Navbar trên + content dưới ── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* ── Navbar — cố định trên cùng, xuyên suốt app ── */}
        <Navbar />

        {/* ── Vùng content — mỗi page tự quản lý scroll ── */}
        <div className="flex flex-1 overflow-hidden">
          {children}
        </div>
      </div>

      {/* ── Audio Player — global fixed bottom ── */}
      <AudioPlayer />
    </div>
  );
}
