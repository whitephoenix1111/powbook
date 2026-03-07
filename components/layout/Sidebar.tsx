"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, LayoutGrid,
  Bookmark, Settings, HelpCircle, LogOut, Flame,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const NAV_ITEMS = [
  { icon: Home,        label: "Home",     href: "/" },
  { icon: LayoutGrid,  label: "Category", href: "/category" },
  { icon: Bookmark,    label: "Saved",    href: "/saved" },
];

const BOTTOM_ITEMS = [
  { icon: Settings,    label: "Settings", href: "/settings" },
  { icon: HelpCircle,  label: "Support",  href: "/support" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  async function handleLogout() {
    await logout();
    router.push("/signin");
  }

  return (
    <aside className="flex flex-col items-center py-5 gap-1 w-[72px] min-h-screen flex-shrink-0 border-r bg-surface-raised border-warm-border">

      {/* Logo */}
      <div className="mb-4 flex items-center justify-center w-10 h-10 rounded-xl bg-brand">
        <Flame size={20} color="white" strokeWidth={2.5} />
      </div>

      {/* Main nav */}
      <nav className="flex flex-col items-center gap-1 w-full flex-1">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-2 px-1 w-full rounded-lg transition-colors no-underline
                ${isActive
                  ? "text-brand bg-brand-muted"
                  : "text-ink-secondary hover:bg-surface-sunken"
                }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="font-sans text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <nav className="flex flex-col items-center gap-1 w-full">
        {BOTTOM_ITEMS.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 py-2 px-1 w-full rounded-lg transition-colors text-ink-secondary hover:bg-surface-sunken no-underline"
          >
            <Icon size={20} strokeWidth={1.8} />
            <span className="font-sans text-[10px] font-medium">{label}</span>
          </Link>
        ))}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 py-2 px-1 w-full rounded-lg transition-colors text-red-400 hover:bg-red-50 hover:text-red-500"
        >
          <LogOut size={20} strokeWidth={1.8} />
          <span className="font-sans text-[10px] font-medium">Logout</span>
        </button>
      </nav>
    </aside>
  );
}
