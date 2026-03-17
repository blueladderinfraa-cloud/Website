import { Link } from "wouter";
import { 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight
} from "lucide-react";
import { useContentManager } from "@/hooks/useContentManager";


const quickLinks = [
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Our Services" },
  { href: "/projects", label: "Projects" },
  { href: "/cost-estimator", label: "Cost Estimator" },
  { href: "/contact", label: "Contact Us" },
];

const services = [
  { href: "/services#residential", label: "Residential" },
  { href: "/services#commercial", label: "Commercial" },
  { href: "/services#industrial", label: "Industrial" },
  { href: "/services#infrastructure", label: "Infrastructure" },
];

const socialLinks = [
  { icon: "facebook", href: "https://www.facebook.com/blueladderinfra", label: "Facebook", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
  { icon: "instagram", href: "https://www.instagram.com/blueladder_infra_", label: "Instagram", path: "M16 4H8a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4zm-4 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm3.5-7.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" },
  { icon: "linkedin", href: "https://www.linkedin.com/company/blueladderinfra", label: "LinkedIn", path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" },
];

export default function Footer() {
  const { getContactContent } = useContentManager();
  const contactContent = getContactContent();

  return (
    <footer className="bg-[#0a1628] text-white">
      {/* Main Footer */}
      <div className="container section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 logo-container">
              <img
                src="/logo.jpg"
                alt="Blueladder Infra Logo"
                className="h-10 w-10 object-cover rounded-lg"
              />
              <div className="flex flex-col">
                <span className="font-bold text-xl leading-tight">
                  Blueladder
                </span>
                <span className="text-sm leading-tight text-white/60">
                  INFRA
                </span>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Building excellence since 2005. We transform visions into reality 
              with quality construction, timely delivery, and customer satisfaction.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label={social.label}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={social.path} /></svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-accent transition-colors text-sm flex items-center gap-2"
                  >
                    <ArrowRight className="w-3 h-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Our Services</h4>
            <ul className="space-y-3">
              {services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-accent transition-colors text-sm flex items-center gap-2"
                  >
                    <ArrowRight className="w-3 h-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-white/70 text-sm">
                  {contactContent.address}
                </span>
              </li>
              {contactContent.phone1 && (
                <li>
                  <a
                    href={`tel:${contactContent.phone1.replace(/\D/g, '')}`}
                    className="flex items-center gap-3 text-white/70 hover:text-accent transition-colors text-sm"
                  >
                    <Phone className="w-5 h-5 text-accent" />
                    {contactContent.phone1}
                  </a>
                </li>
              )}
              {contactContent.phone2 && (
                <li>
                  <a
                    href={`tel:${contactContent.phone2.replace(/\D/g, '')}`}
                    className="flex items-center gap-3 text-white/70 hover:text-accent transition-colors text-sm"
                  >
                    <Phone className="w-5 h-5 text-accent" />
                    {contactContent.phone2}
                  </a>
                </li>
              )}
              {contactContent.email1 && (
                <li>
                  <a
                    href={`mailto:${contactContent.email1}`}
                    className="flex items-center gap-3 text-white/70 hover:text-accent transition-colors text-sm"
                  >
                    <Mail className="w-5 h-5 text-accent" />
                    {contactContent.email1}
                  </a>
                </li>
              )}
              {contactContent.email2 && (
                <li>
                  <a
                    href={`mailto:${contactContent.email2}`}
                    className="flex items-center gap-3 text-white/70 hover:text-accent transition-colors text-sm"
                  >
                    <Mail className="w-5 h-5 text-accent" />
                    {contactContent.email2}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} Blueladder Infra. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {/* Development Admin Access - Only visible in dev mode */}
              {import.meta.env.DEV && (
                <button
                  onClick={() => window.location.assign('/admin-login')}
                  className="text-accent hover:text-accent/80 text-sm font-medium px-3 py-1 rounded border border-accent/30 hover:border-accent/50 transition-colors"
                  title="Admin Login"
                >
                  🔧 Admin Login
                </button>
              )}
              <Link href="/privacy" className="text-white/50 hover:text-white text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-white/50 hover:text-white text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
