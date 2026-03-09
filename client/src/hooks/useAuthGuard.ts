import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useErrorHandler } from "./useErrorHandler";

interface AuthGuardOptions {
  requiredRole?: "admin" | "client" | "subcontractor" | "user";
  redirectOnFail?: boolean;
  onAuthFail?: () => void;
}

export function useAuthGuard(options: AuthGuardOptions = {}) {
  const {
    requiredRole = "admin",
    redirectOnFail = true,
    onAuthFail,
  } = options;

  const { user, isAuthenticated, loading } = useAuth();
  const { handleAuthError } = useErrorHandler();

  useEffect(() => {
    // Don't check auth while still loading
    if (loading) return;

    // Check authentication
    if (!isAuthenticated) {
      if (onAuthFail) {
        onAuthFail();
      } else if (redirectOnFail) {
        handleAuthError(new Error("Not authenticated"));
      }
      return;
    }

    // Check authorization
    if (user?.role !== requiredRole) {
      const error = new Error(`Access denied. Required role: ${requiredRole}, current role: ${user?.role || 'none'}`);
      if (onAuthFail) {
        onAuthFail();
      } else if (redirectOnFail) {
        handleAuthError(error);
      }
      return;
    }
  }, [user, isAuthenticated, loading, requiredRole, redirectOnFail, onAuthFail, handleAuthError]);

  const hasAccess = isAuthenticated && user?.role === requiredRole;

  return {
    user,
    isAuthenticated,
    loading,
    hasAccess,
    hasRole: (role: string) => user?.role === role,
    isAdmin: user?.role === "admin",
    isClient: user?.role === "client",
    isSubcontractor: user?.role === "subcontractor",
  };
}

export function useAdminGuard() {
  return useAuthGuard({ requiredRole: "admin" });
}

export function useClientGuard() {
  return useAuthGuard({ requiredRole: "client" });
}

export function useSubcontractorGuard() {
  return useAuthGuard({ requiredRole: "subcontractor" });
}

export default useAuthGuard;