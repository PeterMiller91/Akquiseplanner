import type { User } from "./types";

const USERS_KEY = "ds-akquise-users";
const CURRENT_USER_KEY = "ds-akquise-current-user";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function registerUser(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string }> {
  const users = getAllUsers();

  if (users.some((u) => u.email === email)) {
    return { success: false, message: "Email already registered" };
  }

  if (password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters" };
  }

  const passwordHash = await hashPassword(password);
  const newUser: User = {
    id: "u_" + Math.random().toString(36).slice(2, 9),
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

  return { success: true };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: User }> {
  const users = getAllUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return { success: false, message: "User not found" };
  }

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    return { success: false, message: "Invalid password" };
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { success: true, user };
}

export function logoutUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function getAllUsers(): User[] {
  if (typeof window === "undefined") return [];

  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
