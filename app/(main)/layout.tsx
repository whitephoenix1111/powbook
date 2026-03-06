"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AudioPlayer from "@/components/player/AudioPlayer";
import BookSidePanel from "@/components/book/BookSidePanel";
import { useBookPanelStore } from "@/lib/store/bookPanelStore";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const selectedBook = useBookPanelStore((s) => s.selectedBook);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">

      {/* ── Cột 1: Sidebar ── */}
      <Sidebar />

      {/* ── Cột 2 + 3: toàn bộ phần còn lại, flex ngang ── */}
      <div className="flex flex-1 min-w-0 overflow-hidden">

        {/* ── Cột 2: Navbar trên + Content dưới ── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Navbar chỉ chiếm chiều ngang của cột 2 */}
          <Navbar />

          {/* Scroll area */}
          <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden flex flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </div>

        {/* ── Cột 3: BookSidePanel — bắt đầu từ đỉnh, ngang hàng Navbar ── */}
        <div
          className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden
            border-l border-warm-border bg-surface-raised
            ${selectedBook ? "w-[280px]" : "w-0 border-l-0"}`}
        >
          {selectedBook && (
            <div className="w-[280px] h-full overflow-y-auto">
              <BookSidePanel book={selectedBook} />
            </div>
          )}
        </div>

      </div>

      {/* ── AudioPlayer — global fixed bottom ── */}
      <AudioPlayer />
    </div>
  );
}
