"use client";

import { useState } from "react";
import { X, Plus, Check, ListPlus, Trash2 } from "lucide-react";
import { useLibraryStore, type BookList } from "@/lib/store/libraryStore";
import type { Book } from "@/lib/mockData";

interface AddToListModalProps {
  book: Book;
  onClose: () => void;
}

export default function AddToListModal({ book, onClose }: AddToListModalProps) {
  const { lists, createList, addToList, removeFromList, isInList } = useLibraryStore();
  const [newListName, setNewListName] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null); // list id vừa thêm

  function handleToggle(list: BookList) {
    if (isInList(list.id, book.id)) {
      removeFromList(list.id, book.id);
    } else {
      addToList(list.id, book);
      setJustAdded(list.id);
      setTimeout(() => setJustAdded(null), 1200);
    }
  }

  function handleCreate() {
    const name = newListName.trim();
    if (!name) return;
    const id = createList(name);
    addToList(id, book);
    setJustAdded(id);
    setTimeout(() => setJustAdded(null), 1200);
    setNewListName("");
    setShowInput(false);
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl bg-surface-card border border-warm-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-warm-border">
          <div>
            <h2 className="font-display text-[16px] font-bold text-ink">Add to List</h2>
            <p className="font-sans text-[12px] text-ink-secondary mt-0.5 line-clamp-1">
              {book.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-secondary hover:bg-surface-sunken hover:text-ink transition-colors"
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        {/* List items */}
        <div className="px-3 py-3 max-h-64 overflow-y-auto space-y-1">
          {lists.length === 0 && !showInput && (
            <p className="font-sans text-[13px] text-ink-secondary text-center py-6">
              No lists yet. Create your first one!
            </p>
          )}
          {lists.map((list) => {
            const inList = isInList(list.id, book.id);
            const flash  = justAdded === list.id;
            return (
              <button
                key={list.id}
                onClick={() => handleToggle(list)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                  ${inList
                    ? "bg-brand/8 border border-brand/20"
                    : "hover:bg-surface-sunken border border-transparent"
                  }`}
              >
                {/* Checkbox */}
                <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${inList ? "bg-brand border-brand" : "border-warm-border"}`}
                >
                  {inList && <Check size={11} strokeWidth={3} className="text-white" />}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[13px] font-medium text-ink truncate">{list.name}</p>
                  <p className="font-sans text-[11px] text-ink-secondary">
                    {list.books.length} {list.books.length === 1 ? "book" : "books"}
                  </p>
                </div>

                {flash && (
                  <span className="font-sans text-[11px] text-brand font-medium">Added!</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Create new list */}
        <div className="px-3 pb-3 border-t border-warm-border pt-3">
          {showInput ? (
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                placeholder="List name…"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setShowInput(false); }}
                maxLength={40}
                className="flex-1 px-3 py-2 font-sans text-[13px] rounded-lg border border-warm-border bg-surface-raised text-ink placeholder:text-ink-secondary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              />
              <button
                onClick={handleCreate}
                disabled={!newListName.trim()}
                className="px-4 py-2 rounded-lg bg-brand text-white font-sans text-[13px] font-semibold disabled:opacity-40 hover:bg-brand/90 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => { setShowInput(false); setNewListName(""); }}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-warm-border text-ink-secondary hover:bg-surface-sunken transition-colors"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowInput(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-warm-border text-ink-secondary hover:border-brand/50 hover:text-brand hover:bg-brand/5 transition-all font-sans text-[13px]"
            >
              <Plus size={15} strokeWidth={2} />
              Create new list
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
