// src/components/onboarding/ErrorScreen.tsx
interface ErrorScreenProps {
  error: string;
  onRetry?: () => void;
  onContinue?: () => void; // Allow continuing even after error
}

/**
 * Error screen component for handling failures during onboarding.
 * Provides retry and continue options for graceful degradation.
 */
export function ErrorScreen({ error, onRetry, onContinue }: ErrorScreenProps) {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 text-lg mb-4">Something went wrong</p>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="flex gap-4 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          )}
          {onContinue && (
            <button
              onClick={onContinue}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Continue Anyway
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
