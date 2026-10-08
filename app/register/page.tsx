"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, loginUser } from "@/lib/auth";
import { useAuth } from "@/lib/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein");
      return;
    }

    setIsLoading(true);

    const registerResult = await registerUser(email, password);

    if (!registerResult.success) {
      setError(registerResult.message || "Registration failed");
      setIsLoading(false);
      return;
    }

    const loginResult = await loginUser(email, password);

    if (loginResult.success && loginResult.user) {
      login(loginResult.user);
      router.push("/");
    } else {
      setError("Registration successful, but login failed. Please try logging in.");
      setTimeout(() => router.push("/login"), 2000);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-line rounded-card p-6 flex flex-col gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-ink text-bg flex items-center justify-center text-[18px] font-bold tracking-wide mx-auto mb-4">
              DS
            </div>
            <h1 className="font-serif font-normal text-[24px]">Registrieren</h1>
            <p className="text-[13px] text-muted mt-1">
              Neuen Account erstellen
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-[13px] font-semibold text-ink"
              >
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                className="px-3.5 py-2.5 bg-bg border border-line rounded-sm2 text-[14px] placeholder-muted focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-[13px] font-semibold text-ink"
              >
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mindestens 6 Zeichen"
                className="px-3.5 py-2.5 bg-bg border border-line rounded-sm2 text-[14px] placeholder-muted focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="confirm"
                className="text-[13px] font-semibold text-ink"
              >
                Passwort bestätigen
              </label>
              <input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="px-3.5 py-2.5 bg-bg border border-line rounded-sm2 text-[14px] placeholder-muted focus:outline-none focus:border-primary"
                required
              />
            </div>

            {error && (
              <div className="px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-sm2 text-[13px] text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 bg-primary text-bg rounded-sm2 font-semibold text-[14px] hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? "Wird registriert..." : "Account erstellen"}
            </button>
          </form>

          <div className="border-t border-line pt-4">
            <p className="text-center text-[13px] text-muted">
              Schon registriert?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                Hier anmelden
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
