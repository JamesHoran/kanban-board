// src/components/onboarding/OnboardingWrapper.tsx
"use client";

import { useSeedingService } from "@/lib/hooks/use-seeding-service";
import { useEffect } from "react";
import { ErrorScreen } from "./ErrorScreen";
import { LoadingScreen } from "./LoadingScreen";

interface OnboardingWrapperProps {
  userId: string;
  onComplete: () => void;
}

/**
 * Wraps the seeding process with proper state-based rendering.
 * When userId changes (via key prop), this component completely unmounts and remounts
 * ensuring all state is fresh.
 *
 * Best Practice: Using key prop for clean lifecycle management
 * See: https://dev.to/thesohailjafri/building-an-authentication-wrapper-in-reactnextjs-graphql-112f
 */
export function OnboardingWrapper({
  userId,
  onComplete,
}: OnboardingWrapperProps) {
  const seedingState = useSeedingService(userId);

  useEffect(() => {
    if (seedingState.status === "complete") {
      onComplete();
    }
  }, [seedingState.status, onComplete]);

  // Render appropriate UI based on state
  switch (seedingState.status) {
    case "loading":
      return <LoadingScreen message="Setting up your boards..." />;
    case "error":
      return (
        <ErrorScreen
          error={seedingState.error}
          onRetry={onComplete}
          onContinue={onComplete}
        />
      );
    case "complete":
    case "idle":
      return null;
    default:
      return <LoadingScreen />;
  }
}
