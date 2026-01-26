// src/components/onboarding/LoadingScreen.tsx
interface LoadingScreenProps {
  message?: string;
}

/**
 * Simple loading screen component used during async operations.
 * Shows a spinner and optional message.
 */
export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse mb-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}
