import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useBrandingManager } from "@/hooks/useBrandingManager";
import { useContentManager } from "@/hooks/useContentManager";
import { getLoginUrl } from "@/const";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/cost-estimator", label: "Cost Estimator" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { hasCustomLogo, getLogoProps } = useBrandingManager();
  const { getContactContent } = useContentManager();
  const contactContent = getContactContent();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const getPortalLink = () => {
    if (!user) return null;
    if (user.role === "admin") return "/admin";
    if (user.role === "client") return "/client";
    if (user.role === "subcontractor") return "/subcontractor";
    return null;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="container">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 logo-container">
            {hasCustomLogo() && (
              <img
                src={getLogoProps().src}
                alt={getLogoProps().alt}
                className="h-12 object-contain max-w-[160px] logo-transparent logo-no-bg force-transparent dark-logo remove-white-filter"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const iconLogo = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                  if (iconLogo) iconLogo.style.display = 'flex';
                }}
              />
            )}
            <div className="flex items-center gap-2">
              {!hasCustomLogo() && (
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center fallback-icon">
                  <span className="text-white font-bold text-xl">BL</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className={`font-bold text-xl leading-tight ${isScrolled ? "text-primary" : "text-white"}`}>
                  {getLogoProps().fallbackText.split(' ')[0] || 'Blueladder'}
                </span>
                <span className={`text-sm leading-tight ${isScrolled ? "text-muted-foreground" : "text-white/80"}`}>
                  {getLogoProps().fallbackText.split(' ')[1] || 'INFRA'}
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? isScrolled
                      ? "text-primary bg-primary/10"
                      : "text-white bg-white/20"
                    : isScrolled
                    ? "text-foreground hover:text-primary hover:bg-primary/5"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-3 navbar-admin-section">
            {contactContent.phone1 && (
              <a
                href={`tel:${contactContent.phone1.replace(/\D/g, '')}`}
                className={`flex items-center gap-2 text-sm font-medium ${
                  isScrolled ? "text-foreground" : "text-white"
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>{contactContent.phone1}</span>
              </a>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className={`gap-2 admin-user-button ${
                      isScrolled 
                        ? "bg-white/95 text-primary border-primary/20 hover:bg-white" 
                        : "bg-white/90 text-primary border-white/20 hover:bg-white backdrop-blur-sm"
                    }`}
                  >
                    👤 {user?.name || user?.email || "Admin"}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="admin-dropdown-menu bg-white/98 backdrop-blur-md border-white/20">
                  {getPortalLink() && (
                    <DropdownMenuItem asChild>
                      <Link href={getPortalLink()!} className="admin-dropdown-item text-primary hover:bg-primary/10 font-medium">
                        🏗️ Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => logout()} className="admin-dropdown-item text-primary hover:bg-primary/10 font-medium">
                    🚪 Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                className={`admin-user-button ${
                  isScrolled 
                    ? "bg-white/95 text-primary border-primary/20 hover:bg-white" 
                    : "bg-white/90 text-primary border-white/20 hover:bg-white backdrop-blur-sm"
                }`}
                onClick={() => (window.location.href = getLoginUrl())}
              >
                🔐 Admin Login
              </Button>
            )}

            <Link href="/contact">
              <Button className="gradient-accent text-accent-foreground font-semibold">
                Get a Quote
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className={isScrolled ? "text-foreground" : "text-white"}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-80 p-6 border-l-0 text-white" style={{ backgroundColor: "#0a1628" }}>
              <div className="flex flex-col gap-6 mt-8">
                {/* Mobile Contact Info */}
                {contactContent.phone1 && (
                  <a
                    href={`tel:${contactContent.phone1.replace(/\D/g, '')}`}
                    className="flex items-center gap-2 text-lg font-medium text-white/90 hover:text-white"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{contactContent.phone1}</span>
                  </a>
                )}

                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-lg font-medium ${
                      isActive(link.href)
                        ? "text-amber-400"
                        : "text-white hover:text-amber-400"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <hr className="border-white/20" />
                <div className="mobile-admin-section">
                  {isAuthenticated ? (
                    <>
                      <div className="mobile-admin-info text-white/70 text-sm mb-2">
                        👤 Logged in as: {user?.name || user?.email || "Admin"}
                      </div>
                      {getPortalLink() && (
                        <Link
                          href={getPortalLink()!}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block text-lg font-medium text-amber-400 hover:text-amber-300 bg-white/10 px-4 py-3 rounded-lg mb-3"
                        >
                          🏗️ Admin Dashboard
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => logout()}
                        className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20"
                      >
                        🚪 Logout
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20"
                      onClick={() => (window.location.href = getLoginUrl())}
                    >
                      🔐 Admin Login
                    </Button>
                  )}
                </div>
                <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full gradient-accent text-accent-foreground font-semibold">
                    Get a Quote
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}
