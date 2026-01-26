// src/lib/hooks/use-auth-manager.ts
"use client";

import { nhost } from "@/lib/nhost";
import { useAuthenticationStatus } from "@nhost/nextjs";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export type AuthState =
  | { status: "loading" }
  | { status: "authenticated" }
  | { status: "unauthenticated" }
  | { status: "error"; error: string };

/**
 * Manages automatic authentication via email/password signup.
 * Creates a new user account with random credentials when unauthenticated.
 *
 * Uses explicit state enums (not just booleans) for better debugging.
 * See: https://builder.aws.com/content/35mjuFWn4hSGCK6JjaZHFIGrzPG/reactjs-best-practices-in-2026
 */
export function useAuthManager(): AuthState {
  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      return;
    }

    // Auto-signup for unauthenticated users
    if (!isAuthenticated && !isSigningUp && !error) {
      setIsSigningUp(true);
      (async () => {
        try {
          const randomId = uuidv4().substring(0, 8);
          const randomEmail = `user_${randomId}@example.com`;
          const { error: signUpError } = await nhost.auth.signUp({
            email: randomEmail,
            password: "Aa12345678",
          });

          if (signUpError) throw signUpError;

          // Account created - Nhost hooks will update isAuthenticated
        } catch (err) {
          console.error("[useAuthManager] Auto signup failed:", err);
          setError(
            err instanceof Error ? err.message : "Authentication failed",
          );
        } finally {
          setIsSigningUp(false);
        }
      })();
    }
  }, [isAuthenticated, authLoading, isSigningUp, error]);

  if (authLoading || isSigningUp) {
    return { status: "loading" };
  }

  if (error) {
    return { status: "error", error };
  }

  if (isAuthenticated) {
    return { status: "authenticated" };
  }

  return { status: "unauthenticated" };
}
