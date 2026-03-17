import { useState } from "react";
import { useLocation } from "wouter";

export default function WhatsAppButton() {
  const [location] = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  // Hide on admin pages
  if (location.startsWith("/admin")) {
    return null;
  }

  const phoneNumber = "917778870070";
  const message = encodeURIComponent(
    "Hello! I'm interested in your construction services."
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Chat with us on WhatsApp"
    >
      {/* Tooltip */}
      <span
        className={`absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white shadow-lg transition-all duration-200 ${
          isHovered
            ? "translate-y-0 opacity-100"
            : "translate-y-1 opacity-0 pointer-events-none"
        }`}
      >
        Chat with us
      </span>

      {/* Pulse ring */}
      <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-30" />

      {/* Button */}
      <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-green-500 shadow-lg transition-transform duration-200 hover:scale-110 hover:bg-green-600 sm:h-14 sm:w-14">
        {/* WhatsApp SVG icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="h-6 w-6 fill-white sm:h-7 sm:w-7"
        >
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.906 15.906 0 0 0 16.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.31 22.6c-.39 1.1-1.932 2.014-3.164 2.282-.844.178-1.946.32-5.658-1.216-4.752-1.964-7.806-6.78-8.04-7.094-.226-.314-1.9-2.53-1.9-4.826s1.2-3.426 1.628-3.894c.39-.426 1.034-.64 1.65-.64.2 0 .378.02.54.036.428.018.642.044.924.716.352.84 1.21 2.95 1.316 3.164.108.214.214.5.072.786-.132.294-.25.424-.464.672-.214.25-.418.44-.632.71-.196.234-.418.484-.176.912.242.428 1.076 1.776 2.312 2.878 1.59 1.416 2.93 1.856 3.346 2.062.428.214.676.178.924-.108.25-.294 1.058-1.234 1.342-1.66.276-.428.558-.356.94-.214.386.142 2.444 1.154 2.862 1.364.428.214.712.32.816.498.108.178.108 1.026-.282 2.126z" />
        </svg>
      </span>
    </a>
  );
}
