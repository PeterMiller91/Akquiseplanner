"use client";

import { create } from "zustand";
import type { User } from "./types";
import { getCurrentUser as getStoredUser, logoutUser as removeUser } from "./auth";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  hydrate: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  login: (user) => {
    localStorage.setItem("__auth_user_id__", user.id);
    set({ user });
  },
  logout: () => {
    localStorage.removeItem("__auth_user_id__");
    removeUser();
    set({ user: null });
  },
  hydrate: () => {
    const user = getStoredUser();
    if (user) {
      localStorage.setItem("__auth_user_id__", user.id);
    }
    set({ user, isLoading: false });
  },
}));
