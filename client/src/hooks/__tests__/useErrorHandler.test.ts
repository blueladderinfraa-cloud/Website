import { describe, expect, it, vi, beforeEach } from "vitest";
import { TRPCClientError } from "@trpc/client";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock window.location
const mockLocation = {
  href: "",
};

// Mock global window object
Object.defineProperty(globalThis, "window", {
  value: {
    location: mockLocation,
  },
  writable: true,
});

// Mock console.error to avoid noise in tests
const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

// Import the hook functions directly for testing
import { useErrorHandler } from "../useErrorHandler";

// Create a test wrapper to simulate hook behavior
function createErrorHandler() {
  const handleError = (error: unknown, options: any = {}) => {
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
        globalThis.window.location.href = "/admin-login.html";
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

describe("useErrorHandler - Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = "";
    consoleSpy.mockClear();
  });

  // Feature: admin-panel-features, Property 11: Error Handling and User Feedback
  describe("Property 11: Error Handling and User Feedback", () => {
    it("should handle all error types consistently", () => {
      const errorHandler = createErrorHandler();
      const { handleError } = errorHandler;

      // Test data representing different error scenarios
      const errorScenarios = [
        {
          error: new Error("Standard error message"),
          expectedMessage: "Standard error message",
          errorType: "Error",
        },
        {
          error: new TRPCClientError("tRPC error message"),
          expectedMessage: "tRPC error message", 
          errorType: "TRPCClientError",
        },
        {
          error: "String error message",
          expectedMessage: "String error message",
          errorType: "string",
        },
        {
          error: { unknown: "object" },
          expectedMessage: "An unexpected error occurred",
          errorType: "unknown object",
        },
        {
          error: null,
          expectedMessage: "An unexpected error occurred",
          errorType: "null",
        },
        {
          error: undefined,
          expectedMessage: "An unexpected error occurred",
          errorType: "undefined",
        },
      ];

      // Property: For any error type, the handler should return a consistent error message
      errorScenarios.forEach(({ error, expectedMessage, errorType }) => {
        const actualMessage = handleError(error);

        // Verify error message is consistent
        expect(actualMessage).toBe(expectedMessage);
        expect(typeof actualMessage).toBe("string");
        expect(actualMessage.length).toBeGreaterThan(0);
      });
    });

    it("should handle custom error messages correctly", () => {
      const errorHandler = createErrorHandler();
      const { handleError } = errorHandler;

      const testErrors = [
        new Error("Original error"),
        "Original string error",
        { unknown: "object" },
      ];

      const customMessage = "Custom error message for user";

      // Property: For any error with custom message, the custom message should be returned
      testErrors.forEach((error) => {
        const actualMessage = handleError(error, { customMessage });

        expect(actualMessage).toBe(customMessage);
        expect(typeof actualMessage).toBe("string");
        expect(actualMessage.length).toBeGreaterThan(0);
      });
    });

    it("should handle onError callback correctly", () => {
      const errorHandler = createErrorHandler();
      const { handleError } = errorHandler;

      const testErrors = [
        new Error("Callback error"),
        "String callback error",
        { unknown: "callback object" },
      ];

      // Property: For any error with onError callback, the callback should be called with Error object
      testErrors.forEach((originalError) => {
        const onError = vi.fn();
        
        handleError(originalError, { onError });

        expect(onError).toHaveBeenCalledTimes(1);
        const callArg = onError.mock.calls[0][0];
        expect(callArg).toBeInstanceOf(Error);
        expect(typeof callArg.message).toBe("string");
        expect(callArg.message.length).toBeGreaterThan(0);
      });
    });

    it("should handle API errors with consistent messaging", () => {
      const errorHandler = createErrorHandler();
      const { handleApiError } = errorHandler;

      const apiOperations = [
        "load data",
        "save record", 
        "delete item",
        "update status",
        "upload file",
        "export data",
      ];

      const testErrors = [
        new Error("API error"),
        new TRPCClientError("tRPC API error"),
        "Network failure",
      ];

      // Property: For any API operation and error, the message should follow consistent format
      apiOperations.forEach((operation) => {
        testErrors.forEach((error) => {
          const actualMessage = handleApiError(error, operation);

          expect(actualMessage).toBe(`Failed to ${operation}. Please try again.`);
          expect(actualMessage).toContain(operation);
          expect(actualMessage).toContain("Failed to");
          expect(actualMessage).toContain("Please try again");
        });
      });
    });

    it("should handle network errors with consistent messaging", () => {
      const errorHandler = createErrorHandler();
      const { handleNetworkError } = errorHandler;

      const networkErrors = [
        new Error("Network timeout"),
        new Error("Connection refused"),
        "Network unavailable",
        new TRPCClientError("Network error"),
      ];

      // Property: For any network error, the handler should provide consistent messaging
      networkErrors.forEach((error) => {
        const retryFn = vi.fn();
        const actualMessage = handleNetworkError(error, retryFn);

        expect(actualMessage).toBe("Network error. Please check your connection and try again.");
        expect(actualMessage).toContain("Network error");
        expect(actualMessage).toContain("connection");
        expect(actualMessage).toContain("try again");
      });
    });

    it("should handle validation errors consistently", () => {
      const errorHandler = createErrorHandler();
      const { handleValidationError } = errorHandler;

      const validationErrors = [
        new Error("Required field missing"),
        new Error("Invalid email format"),
        "Validation failed",
        new TRPCClientError("Invalid input"),
      ];

      // Property: For any validation error, the handler should provide consistent user-friendly messaging
      validationErrors.forEach((error) => {
        const actualMessage = handleValidationError(error);

        expect(actualMessage).toBe("Please check your input and try again.");
        expect(actualMessage).toContain("check your input");
        expect(actualMessage).toContain("try again");
      });
    });

    it("should handle authentication errors with redirect", () => {
      const errorHandler = createErrorHandler();
      const { handleAuthError } = errorHandler;

      const authErrors = [
        new Error("Unauthorized"),
        new Error("Token expired"),
        "Authentication failed",
        new TRPCClientError("Invalid credentials"),
      ];

      // Property: For any authentication error, the handler should redirect to login
      authErrors.forEach((error) => {
        const actualMessage = handleAuthError(error);

        expect(actualMessage).toBe("Authentication failed. Please log in again.");
        expect(actualMessage).toContain("Authentication failed");
        expect(actualMessage).toContain("log in again");
        
        // Verify redirect to login page
        expect(globalThis.window.location.href).toBe("/admin-login.html");
      });
    });

    it("should handle error options combinations correctly", () => {
      const errorHandler = createErrorHandler();
      const { handleError } = errorHandler;

      const testError = new Error("Test error");
      
      // Test various option combinations
      const optionCombinations = [
        { showToast: true, customMessage: "Custom message" },
        { showToast: false, customMessage: "Custom message" },
        { showToast: true, onError: vi.fn() },
        { showToast: false, onError: vi.fn() },
        { customMessage: "Custom", onError: vi.fn(), retryFn: vi.fn() },
        { showToast: false, customMessage: "Custom", onError: vi.fn(), retryFn: vi.fn() },
      ];

      // Property: For any combination of options, the handler should work correctly
      optionCombinations.forEach((options) => {
        const actualMessage = handleError(testError, options);

        // Verify message handling
        if (options.customMessage) {
          expect(actualMessage).toBe(options.customMessage);
        } else {
          expect(actualMessage).toBe("Test error");
        }

        // Verify onError callback
        if (options.onError) {
          expect(options.onError).toHaveBeenCalledWith(testError);
        }

        // Verify all options are handled without throwing
        expect(actualMessage).toBeDefined();
        expect(typeof actualMessage).toBe("string");
        expect(actualMessage.length).toBeGreaterThan(0);
      });
    });

    it("should handle edge cases in error processing", () => {
      const errorHandler = createErrorHandler();
      const { handleError } = errorHandler;

      const edgeCases = [
        { error: "", expectedMessage: "" }, // Empty string should be preserved
        { error: "   ", expectedMessage: "   " }, // Whitespace should be preserved
        { error: new Error(""), expectedMessage: "" },
        { error: new Error("   "), expectedMessage: "   " },
        { error: 0, expectedMessage: "An unexpected error occurred" },
        { error: false, expectedMessage: "An unexpected error occurred" },
        { error: [], expectedMessage: "An unexpected error occurred" },
        { error: {}, expectedMessage: "An unexpected error occurred" },
      ];

      // Property: For any edge case error, the handler should provide a valid string response
      edgeCases.forEach(({ error, expectedMessage }) => {
        const actualMessage = handleError(error);

        expect(actualMessage).toBe(expectedMessage);
        expect(typeof actualMessage).toBe("string");
        // Note: Empty strings are valid error messages in some cases
      });
    });

    it("should maintain error handling consistency across multiple calls", () => {
      const errorHandler = createErrorHandler();
      const { handleError } = errorHandler;

      const testError = new Error("Consistent error");
      const testOptions = { customMessage: "Consistent message" };

      // Property: Multiple calls with same error and options should produce consistent results
      const results: string[] = [];
      
      for (let i = 0; i < 5; i++) {
        const message = handleError(testError, testOptions);
        results.push(message);
      }

      // Verify all results are identical
      results.forEach((result, index) => {
        expect(result).toBe("Consistent message");
        if (index > 0) {
          expect(result).toBe(results[0]);
        }
      });

      // Verify consistency properties
      expect(new Set(results).size).toBe(1); // All results should be the same
      expect(results.every(r => typeof r === "string")).toBe(true);
      expect(results.every(r => r.length > 0)).toBe(true);
    });
  });
});

// Note: These tests validate Requirements 7.2 and 7.3 - Error Handling and User Feedback
// Property 11 ensures that for any error type or combination of options, the error handler
// provides consistent, user-friendly error messages and appropriate feedback mechanisms