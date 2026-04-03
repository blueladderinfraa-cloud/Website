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
      <div className="container py-3 px-4">
        <div className="flex items-center justify-between admin-header-content">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Link href="/">
              <span className="admin-logo text-lg md:text-2xl">Blueladder</span>
            </Link>
            <span className="admin-breadcrumb hidden sm:inline">/</span>
            <span className="font-semibold hidden sm:inline text-sm md:text-base">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <span className="admin-user-info hidden md:inline">
              Welcome, {user?.name || "Admin"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="admin-button-secondary border-white/20 text-white hover:bg-white/10 hover:text-white text-xs md:text-sm px-2 md:px-4"
            >
              {logoutMutation.isPending ? "..." : "Logout"}
            </Button>
            <Link href="/">
              <Button variant="outline" size="sm" className="admin-button-secondary border-white/20 text-white hover:bg-white/10 hover:text-white text-xs md:text-sm px-2 md:px-4">
                View Site
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
