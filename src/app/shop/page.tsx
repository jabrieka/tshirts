import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safeParsePalette } from "@/lib/palette";
import { formatUsd } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const designs = await prisma.shirtDesign.findMany({
    where: { publiclyOrderable: true },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-5 pt-12 pb-20">
      <span className="section-eyebrow">SHOP</span>
      <h1 className="font-display text-6xl md:text-7xl mt-4 leading-[0.95]">
        ALL <span className="gradient-text">LIVE DROPS.</span>
      </h1>
      <p className="text-cream/80 mt-4 max-w-2xl">
        Browse the open campaigns Cosette Productions is currently running for clients and community partners.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {designs.length === 0 && (
          <div className="card p-8 text-cream/70">No open campaigns right now.</div>
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
              <div className="aspect-square relative" style={{ background: palette.background }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.artworkUrl} alt={d.title} className="w-full h-full object-contain p-6 transition-transform group-hover:scale-105" />
              </div>
              <div className="p-5" style={{ background: palette.background, color: palette.text }}>
                {d.client && (
                  <div className="text-xs tracking-widest uppercase" style={{ color: palette.secondary }}>
                    {d.client.name}
                  </div>
                )}
                <div className="font-display text-2xl mt-1">{d.title}</div>
                <div className="flex items-center justify-between mt-3">
                  <div className="font-semibold" style={{ color: palette.secondary }}>
                    from {formatUsd(d.basePrice)}
                  </div>
                  {d.orderDeadline && (
                    <div className="text-xs opacity-80" style={{ color: palette.text }}>
                      until {new Date(d.orderDeadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
