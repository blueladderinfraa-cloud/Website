import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";

interface ErrorHandlerOptions {
  showToast?: boolean;
  customMessage?: string;
  onError?: (error: Error) => void;
  retryFn?: () => void;
}

export function useErrorHandler() {
  const handleError = (error: unknown, options: ErrorHandlerOptions = {}) => {
    const {
      showToast = true,
      customMessage,
      onError,
      retryFn,
    } = options;

    let errorMessage = "An unexpected error occurred";

    // Handle tRPC errors
    if (error instanceof TRPCClientError) {
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    // Use custom message if provided
    if (customMessage) {
      errorMessage = customMessage;
    }

    // Show toast notification
    if (showToast) {
      toast.error(errorMessage, {
        action: retryFn ? {
          label: "Retry",
          onClick: retryFn,
        } : undefined,
      });
    }

    // Call custom error handler
    if (onError) {
      onError(error instanceof Error ? error : new Error(errorMessage));
    }

    // Log error for debugging
    console.error("Error handled:", error);

    return errorMessage;
  };

  const handleApiError = (error: unknown, operation: string, retryFn?: () => void) => {
    return handleError(error, {
      customMessage: `Failed to ${operation}. Please try again.`,
      retryFn,
    });
  };

  const handleNetworkError = (error: unknown, retryFn?: () => void) => {
    return handleError(error, {
      customMessage: "Network error. Please check your connection and try again.",
      retryFn,
    });
  };

  const handleValidationError = (error: unknown) => {
    return handleError(error, {
      customMessage: "Please check your input and try again.",
    });
  };

  const handleAuthError = (error: unknown) => {
    return handleError(error, {
      customMessage: "Authentication failed. Please log in again.",
      onError: () => {
        // Redirect to login page
        window.location.href = "/admin-login.html";
      },
    });
  };

  return {
    handleError,
    handleApiError,
    handleNetworkError,
    handleValidationError,
    handleAuthError,
  };
}

export default useErrorHandler;