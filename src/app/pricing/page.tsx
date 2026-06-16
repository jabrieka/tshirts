import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CATEGORIES: { key: string; title: string; eyebrow: string; color: string }[] = [
  { key: "single", title: "Single Custom Shirt Orders", eyebrow: "ONE-OFFS", color: "#FF1F6D" },
  { key: "bulk", title: "Bulk Shirt Orders", eyebrow: "TEAM RUNS", color: "#FFD23F" },
  { key: "design", title: "Design Services", eyebrow: "ART + SETUP", color: "#3B1FFF" },
  { key: "extra", title: "Rush + Add-Ons", eyebrow: "EXTRAS", color: "#FF5E3A" },
  { key: "package", title: "Campaign Packages", eyebrow: "FULL LAUNCH", color: "#00E0FF" },
];

export default async function PricingPage() {
  const items = await prisma.pricingItem.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-5 pt-12 pb-20">
      <span className="section-eyebrow">PRICING</span>
      <h1 className="font-display text-6xl md:text-7xl mt-4 leading-[0.95]">
        TRANSPARENT, <span className="gradient-text">BOLD</span>, BUILT FOR YOU.
      </h1>
      <p className="mt-5 text-cream/80 max-w-2xl">
        Starting points for every campaign — from a single statement tee to a full community drop with
        flyers, QR codes, and a branded storefront. Custom quotes available for everything.
      </p>

      <div className="grid gap-10 mt-12">
        {CATEGORIES.map((cat) => {
          const catItems = items.filter((i) => i.category === cat.key);
          if (catItems.length === 0) return null;
          return (
            <section key={cat.key}>
              <div className="flex items-center gap-3">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: cat.color, boxShadow: `0 0 16px ${cat.color}` }} />
                <span className="section-eyebrow" style={{ color: cat.color, borderColor: `${cat.color}55`, background: `${cat.color}15` }}>
                  {cat.eyebrow}
                </span>
              </div>
              <h2 className="font-display text-4xl mt-3">{cat.title}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
                {catItems.map((item) => (
                  <div key={item.id} className="card p-6 relative overflow-hidden">
                    <div
                      className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-25"
                      style={{ background: cat.color }}
                    />
                    <div className="relative">
                      <div className="font-display text-2xl">{item.title}</div>
                      {item.description && (
                        <p className="text-cream/75 mt-2 text-sm">{item.description}</p>
                      )}
                      <div className="mt-5 font-display text-3xl" style={{ color: cat.color }}>
                        {item.priceLabel}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="card p-8 mt-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-cosette-mesh opacity-30 pointer-events-none" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-3xl">Need a custom quote?</h3>
            <p className="text-cream/80 mt-1">Bulk over 50, multi-day events, or a full campaign — we’ve got you.</p>
          </div>
          <Link href="/custom-request" className="btn-pop">REQUEST A QUOTE</Link>
        </div>
      </div>
    </div>
  );
}
