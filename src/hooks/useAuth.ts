"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth(allowedRoles?: string[]) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ username: string; role: string } | null>(
    null
  );

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (!stored) {
      router.replace("/login"); // ❌ Not logged in → redirect
      return;
    }

    const parsed = JSON.parse(stored);
    setUser(parsed);

    // ✅ If allowedRoles passed, check if role is allowed
    if (allowedRoles && !allowedRoles.includes(parsed.role)) {
      router.replace("/login"); // ❌ Wrong role → redirect
      return;
    }

    setLoading(false);
  }, [allowedRoles, router]);

  return { user, loading };
}
