import type { User } from "./types";

export function getUserStorageKey(userId: string, key: string): string {
  return `${userId}:${key}`;
}

export function getUserData<T>(userId: string, key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;

  const storageKey = getUserStorageKey(userId, key);
  const stored = localStorage.getItem(storageKey);
  return stored ? JSON.parse(stored) : defaultValue;
}

export function setUserData<T>(userId: string, key: string, data: T): void {
  if (typeof window === "undefined") return;

  const storageKey = getUserStorageKey(userId, key);
  localStorage.setItem(storageKey, JSON.stringify(data));
}

export function clearUserData(userId: string): void {
  if (typeof window === "undefined") return;

  const keys = Object.keys(localStorage);
  const prefix = `${userId}:`;
  keys.forEach((key) => {
    if (key.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  });
}
