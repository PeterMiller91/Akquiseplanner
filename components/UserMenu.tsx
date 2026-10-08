"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-store";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-ink text-bg flex items-center justify-center text-[13px] font-bold tracking-wide hover:opacity-80"
      >
        {user.email.charAt(0).toUpperCase()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-surface border border-line rounded-card shadow-lg z-50 min-w-[200px]">
          <div className="px-4 py-3 border-b border-line">
            <div className="text-[12px] text-muted">Angemeldet als</div>
            <div className="text-[13px] font-semibold truncate">{user.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 text-left text-[13px] hover:bg-bg transition-colors text-red-600 font-semibold"
          >
            Abmelden
          </button>
        </div>
      )}
    </div>
  );
}
