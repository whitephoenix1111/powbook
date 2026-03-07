"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AudioPlayer from "@/components/player/AudioPlayer";
import BookSidePanel from "@/components/book/BookSidePanel";
import Toaster from "@/components/ui/Toaster";
import { useBookPanelStore } from "@/lib/store/bookPanelStore";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const selectedBook = useBookPanelStore((s) => s.selectedBook);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">

      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        <div className="flex flex-1 min-w-0 overflow-hidden">

          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Navbar />
            <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden flex flex-col">
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </div>

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

        <AudioPlayer />

      </div>

      {/* Toast notifications — fixed, toàn app */}
      <Toaster />

    </div>
  );
}
