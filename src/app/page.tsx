"use client";

import { ErrorScreen } from "@/components/onboarding/ErrorScreen";
import { LoadingScreen } from "@/components/onboarding/LoadingScreen";
import { OnboardingWrapper } from "@/components/onboarding/OnboardingWrapper";
import { useAuthManager } from "@/lib/hooks/use-auth-manager";
import { useUserId } from "@nhost/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Home page - Simple orchestrator for the onboarding flow.
 *
 * Architecture:
 * 1. Wait for component to mount on client (prevents hydration mismatch)
 * 2. Auto-signup via useAuthManager if not authenticated
 * 3. Render OnboardingWrapper with userId as key for seeding
 *
 * KEY STRATEGY: Use userId as key to force complete remount on user change.
 * This ensures all seeding state is fresh for each user and solves the
 * state persistence across users problem.
 *
 * See: https://dev.to/thesohailjafri/building-an-authentication-wrapper-in-reactnextjs-graphql-112f
 */
export default function Home() {
  const router = useRouter();
  const userId = useUserId();
  const authState = useAuthManager();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by waiting for client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted on client (prevents hydration error)
  if (!mounted) {
    return <LoadingScreen message="Loading the app..." />;
  }

  // Handle auth states
  switch (authState.status) {
    case "loading":
      return <LoadingScreen message="Creating your account..." />;
    case "error":
      return (
        <ErrorScreen
          error={authState.error}
          onContinue={() => router.push("/boards")}
        />
      );
    case "unauthenticated":
      // This shouldn't happen as useAuthManager auto-signups, but handle gracefully
      return <LoadingScreen message="Creating your account..." />;
    case "authenticated":
      // Authenticated - run onboarding flow
      // The key prop ensures component remounts when userId changes
      return (
        <OnboardingWrapper
          key={userId}
          userId={userId!}
          onComplete={() => router.push("/boards")}
        />
      );
  }
}
