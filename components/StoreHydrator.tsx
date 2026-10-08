"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-store";

const PUBLIC_ROUTES = ["/login", "/register"];

export default function StoreHydrator({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const hydrate = useAuth((s) => s.hydrate);
  const user = useAuth((s) => s.user);

  useEffect(() => {
    Promise.resolve(useStore.persist.rehydrate()).finally(() => {
      hydrate();
      setReady(true);
    });
  }, [hydrate]);

  useEffect(() => {
    if (!ready) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isAuthenticated = user !== null;

    if (!isAuthenticated && !isPublicRoute) {
      router.push("/login");
    } else if (isAuthenticated && isPublicRoute) {
      router.push("/");
    }
  }, [ready, user, pathname, router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-ink text-bg flex items-center justify-center text-[18px] font-bold tracking-wide mx-auto mb-4">
            DS
          </div>
          <p className="text-[13px] text-muted">Lädt...</p>
        </div>
      </div>
    );
  }

  return <div>{children}</div>;
}
