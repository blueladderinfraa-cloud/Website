import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
}

interface AdminNavigationProps {
  currentPage: string;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/subcontractors", label: "Subcontractors" },
  { href: "/admin/tenders", label: "Tenders" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNavigation({ currentPage }: AdminNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="admin-navigation">
      <div className="container">
        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            // Extract page name from href for comparison
            const pageName = item.href === "/admin" ? "dashboard" : item.href.split("/").pop() || "";
            const isActive = pageName === currentPage || item.href === `/admin/${currentPage}`;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`admin-nav-item rounded-none whitespace-nowrap px-6 py-3 ${
                    isActive ? "active" : ""
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex items-center justify-between py-3">
            <span className="font-medium admin-page-title">
              {navItems.find(item => {
                const pageName = item.href === "/admin" ? "dashboard" : item.href.split("/").pop() || "";
                return pageName === currentPage || item.href === `/admin/${currentPage}`;
              })?.label || "Admin"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 admin-nav-item"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="border-t border-gray-200 bg-white">
              <div className="py-2 space-y-1">
                {navItems.map((item) => {
                  const pageName = item.href === "/admin" ? "dashboard" : item.href.split("/").pop() || "";
                  const isActive = pageName === currentPage || item.href === `/admin/${currentPage}`;
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start admin-nav-item ${
                          isActive ? "active" : ""
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}