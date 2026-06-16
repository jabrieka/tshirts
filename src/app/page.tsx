import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safeParsePalette } from "@/lib/palette";
import { formatUsd } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function Home() {
  const designs = await prisma.shirtDesign.findMany({
    where: { publiclyOrderable: true },
    include: { client: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cosette-mesh opacity-40 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-5 pt-16 pb-20 relative">
          <span className="section-eyebrow">CUSTOM TEES · CULTURE · COMMUNITY</span>
          <h1 className="mt-5 font-display text-6xl md:text-8xl leading-[0.95] max-w-5xl">
            <span className="text-cream">WEAR YOUR</span>{" "}
            <span className="gradient-text">CAMPAIGN.</span>
            <br />
            <span className="text-cream">PRINT YOUR</span>{" "}
            <span className="gradient-text" style={{ ["--p" as any]: "#FFD23F", ["--s" as any]: "#FF1F6D", ["--a" as any]: "#00E0FF" }}>
              CULTURE.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-cream/80 text-lg">
            Cosette Productions builds bold custom t-shirts and full launch campaigns —
            design, print, flyers, QR order pages, and the storefront, all in your colors.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/custom-request" className="btn-pop">START A CUSTOM ORDER</Link>
            <Link href="/shop" className="btn-ghost">SHOP OPEN CAMPAIGNS</Link>
          </div>

          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
            {[
              { k: "Designs Printed", v: "500+" },
              { k: "Campaigns Launched", v: "60+" },
              { k: "Avg Turnaround", v: "7 Days" },
              { k: "Client Brands", v: "Local + National" },
            ].map((s) => (
              <div key={s.k} className="card p-4">
                <div className="font-display text-3xl text-sun">{s.v}</div>
                <div className="text-xs text-cream/70 tracking-wider uppercase mt-1">{s.k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* marquee */}
        <div className="border-y border-white/10 py-3 bg-ink/60 overflow-hidden">
          <div className="marquee-track font-display tracking-[0.4em] text-cream/80 text-lg">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-12 px-6 whitespace-nowrap">
                <span>● BLOCK PARTIES</span>
                <span>● FUNDRAISERS</span>
                <span>● ALBUM DROPS</span>
                <span>● FESTIVALS</span>
                <span>● TEAM MERCH</span>
                <span>● COMMUNITY EVENTS</span>
                <span>● TOUR TEES</span>
                <span>● BUSINESS BRANDS</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED DESIGNS */}
      <section className="max-w-7xl mx-auto px-5 mt-20">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="section-eyebrow">LIVE CAMPAIGNS</span>
            <h2 className="font-display text-5xl mt-3">SHOP OPEN DROPS</h2>
          </div>
          <Link href="/shop" className="btn-ghost">SEE ALL →</Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {designs.length === 0 && (
            <div className="card p-6 text-cream/70">No live campaigns yet — check back soon.</div>
          )}
          {designs.map((d) => {
            const palette = safeParsePalette(d.paletteJson);
            return (
              <Link
                key={d.id}
                href={`/shop/${d.slug}`}
                className="group card p-0 overflow-hidden block"
                style={{ borderColor: palette.primary }}
              >
                <div className="aspect-square relative" style={{ backgroundColor: palette.background }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.artworkUrl}
                    alt={d.title}
                    className="w-full h-full object-contain p-6 transition-transform group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none opacity-50 mix-blend-screen"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${palette.primary} 0%, transparent 60%), radial-gradient(circle at 70% 80%, ${palette.accent} 0%, transparent 60%)`,
                    }}
                  />
                </div>
                <div className="p-5" style={{ background: palette.background, color: palette.text }}>
                  {d.client && (
                    <div className="text-xs tracking-widest uppercase" style={{ color: palette.secondary }}>
                      {d.client.name}
                    </div>
                  )}
                  <div className="font-display text-2xl mt-1" style={{ color: palette.text }}>{d.title}</div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="font-semibold" style={{ color: palette.secondary }}>
                      from {formatUsd(d.basePrice)}
                    </div>
                    <span className="text-xs tracking-widest" style={{ color: palette.primary }}>SHOP →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SERVICES */}
      <section className="max-w-7xl mx-auto px-5 mt-24">
        <span className="section-eyebrow">FULL-SERVICE STUDIO</span>
        <h2 className="font-display text-5xl mt-3">FROM CONCEPT TO COMMUNITY DROP.</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {[
            { t: "DESIGN", d: "Full custom designs from your concept — bold, vibrant, and on-brand for your audience.", c: "#FF1F6D" },
            { t: "PRINT", d: "Premium tees, single shirts to bulk runs, packed with care and ready for pickup or shipping.", c: "#FFD23F" },
            { t: "CAMPAIGN", d: "QR-linked order pages, branded flyers, and social graphics auto-themed from your art.", c: "#3B1FFF" },
          ].map((b) => (
            <div key={b.t} className="card p-6">
              <div className="w-12 h-12 rounded-full mb-4" style={{ background: b.c, boxShadow: `0 0 30px ${b.c}55` }} />
              <div className="font-display text-3xl">{b.t}</div>
              <p className="text-cream/75 mt-2">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-5 mt-24">
        <div className="card p-10 md:p-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-cosette-mesh opacity-30 pointer-events-none" />
          <div className="relative">
            <span className="section-eyebrow">READY TO LAUNCH?</span>
            <h2 className="font-display text-5xl md:text-6xl mt-3">
              YOUR ART. YOUR PEOPLE. <span className="gradient-text">YOUR DROP.</span>
            </h2>
            <p className="text-cream/80 mt-4 max-w-2xl">
              Tell us about your vision and we’ll deliver a fully branded launch — shirts, flyers, QR code,
              and storefront, all themed from your artwork.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/custom-request" className="btn-pop">START A CUSTOM ORDER</Link>
              <Link href="/pricing" className="btn-ghost">SEE PRICING</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
