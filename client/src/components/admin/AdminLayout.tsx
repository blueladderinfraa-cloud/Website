import React from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminNavigation from "@/components/admin/AdminNavigation";
import ErrorBoundary from "@/components/ErrorBoundary";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  title: string;
  description?: string;
}

export default function AdminLayout({ children, currentPage, title, description }: AdminLayoutProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen admin-layout">
        <PageLoadingSpinner text="Loading admin dashboard..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen admin-layout flex items-center justify-center">
        <Card className="admin-card p-8 max-w-md">
          <CardContent className="text-center">
            <h2 className="text-xl font-bold mb-4 admin-page-title">Authentication Required</h2>
            <p className="admin-page-description mb-4">You need to be logged in to access the admin dashboard.</p>
            <Button onClick={() => window.location.href = getLoginUrl()} className="admin-button-primary">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen admin-layout flex items-center justify-center">
        <Card className="admin-card p-8 max-w-md">
          <CardContent className="text-center">
            <h2 className="text-xl font-bold mb-4 admin-page-title">Access Denied</h2>
            <p className="admin-page-description mb-4">
              You need admin privileges to access this dashboard.
            </p>
            <p className="text-sm admin-page-description mb-4">
              Current user: {user?.name || 'Unknown'} (Role: {user?.role || 'None'})
            </p>
            <Button onClick={() => window.location.href = "/"} className="admin-button-secondary">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen admin-layout">
      <AdminHeader user={user} />
      <AdminNavigation currentPage={currentPage} />
      
      <main className="container admin-main-content px-4 md:px-8">
        <div className="mb-4 md:mb-8">
          <h1 className="text-xl md:text-3xl admin-page-title">{title}</h1>
          {description && (
            <p className="admin-page-description">{description}</p>
          )}
        </div>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
}