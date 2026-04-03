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
        <div className="flex items-center justify-between admin-header-content gap-2">
          <Link href="/">
            <span className="admin-logo text-lg md:text-2xl whitespace-nowrap">Blueladder</span>
          </Link>
          <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="admin-button-secondary border-white/20 text-white hover:bg-white/10 hover:text-white text-xs px-2 py-1 md:px-4 md:py-2 h-auto"
            >
              {logoutMutation.isPending ? "..." : "Logout"}
            </Button>
            <Link href="/">
              <Button variant="outline" size="sm" className="admin-button-secondary border-white/20 text-white hover:bg-white/10 hover:text-white text-xs px-2 py-1 md:px-4 md:py-2 h-auto">
                View Site
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
