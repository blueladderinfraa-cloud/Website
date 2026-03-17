import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone } from "lucide-react";
import { useContentManager } from "@/hooks/useContentManager";

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
            <img
              src="/logo.jpg"
              alt="Blueladder Infra Logo"
              className="h-12 w-12 object-cover rounded-lg"
            />
            <div className="flex flex-col">
              <span className={`font-bold text-xl leading-tight ${isScrolled ? "text-primary" : "text-white"}`}>
                Blueladder
              </span>
              <span className={`text-sm leading-tight ${isScrolled ? "text-muted-foreground" : "text-white/80"}`}>
                INFRA
              </span>
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
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                  isScrolled ? "text-foreground hover:bg-primary/10" : "text-white hover:bg-white/10"
                }`}
                title="Call us"
              >
                <Phone className="w-5 h-5" />
              </a>
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
            <SheetContent side="right" className="w-[85vw] max-w-80 p-6 border-l-0 text-white !bg-[#0a1628]">
              <div className="flex flex-col gap-6 mt-8">
                {/* Mobile Contact Info */}
                {contactContent.phone1 && (
                  <a
                    href={`tel:${contactContent.phone1.replace(/\D/g, '')}`}
                    className="flex items-center gap-2 text-lg font-medium text-white/90 hover:text-white"
                    title="Call us"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call Us</span>
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
