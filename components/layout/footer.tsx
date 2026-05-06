import Link from "next/link";
import { Ticket, Share2, Camera, User, Video, Mail } from "lucide-react";

const FOOTER_LINKS = {
  Discover: [
    { label: "All Events", href: "/events" },
    { label: "Trending", href: "/events?sort=trending" },
    { label: "Venues", href: "/venues" },
    { label: "Categories", href: "/categories" },
    { label: "Artists", href: "/artists" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Refund Policy", href: "/refunds" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const SOCIAL = [
  { icon: Share2, href: "#", label: "Share" },
  { icon: Camera, href: "#", label: "Instagram" },
  { icon: User, href: "#", label: "Facebook" },
  { icon: Video, href: "#", label: "YouTube" },
  { icon: Mail, href: "mailto:support@eventhubpro.com", label: "Email" },
];

export function Footer() {
  return (
    <footer
      style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--bg-border)" }}
      className="mt-24"
    >
      {/* Newsletter bar */}
      <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))", borderBottom: "1px solid var(--bg-border)" }}>
        <div className="container py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 style={{ fontFamily: "var(--font-display)" }} className="text-xl font-bold mb-1">
                Never miss an event 🎉
              </h3>
              <p style={{ color: "var(--text-secondary)" }} className="text-sm">
                Get personalized event recommendations delivered to your inbox.
              </p>
            </div>
            <form className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="min-w-64 text-sm"
                style={{ background: "var(--bg-elevated)" }}
              />
              <button type="submit" className="btn-primary text-sm py-2.5 whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800 }} className="gradient-text text-lg">
                EventHub Pro
              </span>
            </Link>
            <p style={{ color: "var(--text-muted)" }} className="text-sm leading-relaxed mb-6">
              The world&apos;s most trusted event ticketing marketplace. Buy and experience events worldwide.
            </p>
            <div className="flex gap-2">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center hover:border-indigo-500/40 transition-all text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-700 mb-4" style={{ fontFamily: "var(--font-display)" }}>
                {section}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-[var(--text-primary)]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 mt-16 pt-8"
          style={{ borderTop: "1px solid var(--bg-border)", color: "var(--text-muted)" }}
        >
          <p className="text-sm">
            © {new Date().getFullYear()} EventHub Pro. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-[var(--text-primary)] transition-colors">Cookies</Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">Secure payments</span>
            <div className="flex gap-1.5">
              {["Visa", "MC", "Amex", "PayPal"].map((brand) => (
                <span
                  key={brand}
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: "var(--bg-overlay)", color: "var(--text-muted)" }}
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
