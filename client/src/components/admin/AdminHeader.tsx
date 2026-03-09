import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface User {
  name?: string | null;
  role?: string;
}

interface AdminHeaderProps {
  user: User;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('/api/trpc/auth.logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      // Redirect to login
      window.location.href = '/admin-login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect anyway
      window.location.href = '/admin-login';
    }
  };

  return (
    <header className="admin-header sticky top-0 z-50">
      <div className="container py-4">
        <div className="flex items-center justify-between admin-header-content">
          <div className="flex items-center gap-4">
            <Link href="/">
              <span className="admin-logo">🏗️ Blueladder</span>
            </Link>
            <span className="admin-breadcrumb">/</span>
            <span className="font-semibold">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="admin-user-info">
              👤 Welcome, {user?.name || "Admin"}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="admin-button-secondary border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              🚪 Logout
            </Button>
            <Link href="/">
              <Button variant="outline" size="sm" className="admin-button-secondary border-white/20 text-white hover:bg-white/10 hover:text-white">
                🌐 View Site
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}