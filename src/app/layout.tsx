import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cosette Productions · Custom T-Shirts, Campaigns & Culture",
  description:
    "Bold custom T-shirt design, printing, and campaign launches for artists, organizers, and community brands.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-ink/70 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl tracking-wider">
          <span className="inline-block w-3 h-3 rounded-full bg-flame shadow-glow" />
          <span className="text-cream">COSETTE</span>
          <span className="text-sun">PRODUCTIONS</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 font-display tracking-widest text-sm">
          <Link href="/shop" className="hover:text-sun">SHOP</Link>
          <Link href="/custom-request" className="hover:text-sun">CUSTOM REQUEST</Link>
          <Link href="/pricing" className="hover:text-sun">PRICING</Link>
          <Link href="/contact" className="hover:text-sun">CONTACT / FAQ</Link>
          <Link href="/admin" className="text-flame hover:text-sun">ADMIN</Link>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-ink/80">
      <div className="max-w-7xl mx-auto px-5 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <div className="font-display text-2xl tracking-wider">
            <span className="text-cream">COSETTE</span> <span className="text-sun">PRODUCTIONS</span>
          </div>
          <p className="text-sm text-cream/70 mt-3 max-w-sm">
            Designed, printed, and promoted with culture. Tees, campaigns, and community storytelling.
          </p>
        </div>
        <div>
          <div className="section-eyebrow">Studio</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/custom-request" className="hover:text-sun">Custom T-shirt Requests</Link></li>
            <li><Link href="/pricing" className="hover:text-sun">Pricing</Link></li>
            <li><Link href="/shop" className="hover:text-sun">Open Campaigns</Link></li>
          </ul>
        </div>
        <div>
          <div className="section-eyebrow">Contact</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>hello@cosetteproductions.com</li>
            <li><Link href="/contact" className="hover:text-sun">FAQ + Contact Form</Link></li>
            <li className="text-cream/60">© {new Date().getFullYear()} Cosette Productions LLC</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
