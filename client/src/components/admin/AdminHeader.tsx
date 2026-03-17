import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

interface User {
  name?: string | null;
  role?: string;
}

interface AdminHeaderProps {
  user: User;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = getLoginUrl();
    },
    onError: () => {
      // Force redirect anyway
      window.location.href = getLoginUrl();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="admin-header sticky top-0 z-50">
      <div className="container py-4">
        <div className="flex items-center justify-between admin-header-content">
          <div className="flex items-center gap-4">
            <Link href="/">
              <span className="admin-logo">Blueladder</span>
            </Link>
            <span className="admin-breadcrumb">/</span>
            <span className="font-semibold">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="admin-user-info">
              Welcome, {user?.name || "Admin"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="admin-button-secondary border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
            <Link href="/">
              <Button variant="outline" size="sm" className="admin-button-secondary border-white/20 text-white hover:bg-white/10 hover:text-white">
                View Site
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
