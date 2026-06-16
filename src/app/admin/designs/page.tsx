import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatUsd } from "@/lib/money";
import { safeParsePalette } from "@/lib/palette";

export const dynamic = "force-dynamic";

export default async function AdminDesignsPage() {
  const session = await getSession();
  if (!session.userId) redirect("/admin/login");

  const designs = await prisma.shirtDesign.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true, _count: { select: { orders: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-4xl">Designs</h1>
        <Link href="/admin/designs/new" className="btn-pop">+ NEW DESIGN</Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {designs.map((d) => {
          const palette = safeParsePalette(d.paletteJson);
          return (
            <Link
              key={d.id}
              href={`/admin/designs/${d.id}`}
              className="card overflow-hidden block"
              style={{ borderColor: palette.primary }}
            >
              <div className="aspect-square" style={{ background: palette.background }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.artworkUrl} alt={d.title} className="w-full h-full object-contain p-4" />
              </div>
              <div className="p-4">
                {d.client && <div className="text-xs tracking-widest uppercase text-cream/60">{d.client.name}</div>}
                <div className="font-display text-2xl">{d.title}</div>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span>{formatUsd(d.basePrice)}</span>
                  <span className="text-cream/60">{d._count.orders} orders</span>
                </div>
                <div className="mt-2 flex gap-1 text-[10px] uppercase tracking-widest">
                  {d.publiclyOrderable ? (
                    <span className="px-2 py-0.5 rounded-full bg-lime/20 text-lime">live</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-cream/70">hidden</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
        {designs.length === 0 && (
          <div className="card p-6 text-cream/70">No designs yet — create your first campaign.</div>
        )}
      </div>
    </div>
  );
}
