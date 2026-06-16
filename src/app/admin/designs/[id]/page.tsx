import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { formatUsd } from "@/lib/money";
import { safeParsePalette } from "@/lib/palette";
import EditDesignForm from "./EditDesignForm";

export const dynamic = "force-dynamic";

export default async function AdminDesignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) redirect("/admin/login");

  const { id } = await params;
  const design = await prisma.shirtDesign.findUnique({
    where: { id },
    include: { client: true, variants: true, orders: { include: { items: true } } },
  });
  if (!design) notFound();

  const palette = safeParsePalette(design.paletteJson);
  const colors = Array.from(
    new Map(design.variants.map((v) => [v.color, { name: v.color, hex: v.colorHex }])).values()
  );
  let colorImages: Record<string, string> = {};
  try {
    colorImages = design.colorImagesJson ? JSON.parse(design.colorImagesJson) : {};
  } catch {}
  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/shop/${design.slug}`;
  const flyerUrl = `/api/flyer/${design.id}`;
  const qrUrl = `/api/qr/${design.id}`;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/admin/designs" className="text-sm text-cream/70 hover:text-sun">← All designs</Link>
          <h1 className="font-display text-4xl mt-1">{design.title}</h1>
          {design.client && <div className="text-cream/70 text-sm">{design.client.name}</div>}
        </div>
        <Link href={`/shop/${design.slug}`} target="_blank" className="btn-ghost">VIEW PUBLIC PAGE →</Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="aspect-square relative" style={{ background: palette.background }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={design.artworkUrl} alt={design.title} className="w-full h-full object-contain p-8" />
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            <a href={flyerUrl} target="_blank" rel="noreferrer" className="card p-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flyerUrl} alt="Flyer preview" className="w-12 h-16 object-cover rounded" />
              <div>
                <div className="font-display">FLYER</div>
                <div className="text-xs text-cream/70">Open / Download</div>
              </div>
            </a>
            <a href={qrUrl} target="_blank" rel="noreferrer" className="card p-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="QR code" className="w-12 h-12 object-contain rounded bg-white p-0.5" />
              <div>
                <div className="font-display">QR CODE</div>
                <div className="text-xs text-cream/70">Open / Download</div>
              </div>
            </a>
            <div className="card p-3 col-span-2">
              <div className="font-display text-sm">SHARE URL</div>
              <div className="text-xs break-all text-cream/80 mt-1">{orderUrl}</div>
            </div>
            <form action={`/api/designs/${design.id}/regenerate`} method="post" className="col-span-2">
              <button className="btn-ghost w-full">REGENERATE FLYER & QR</button>
            </form>
          </div>
        </div>

        <div className="card p-6">
          <EditDesignForm
            design={{
              id: design.id,
              title: design.title,
              description: design.description,
              basePrice: design.basePrice,
              shirtType: design.shirtType,
              orderDeadline: design.orderDeadline ? design.orderDeadline.toISOString().slice(0, 10) : "",
              pickupAddress: design.pickupAddress,
              publiclyOrderable: design.publiclyOrderable,
              pickupEnabled: design.pickupEnabled,
              shippingEnabled: design.shippingEnabled,
              stripeEnabled: design.stripeEnabled,
              manualPayEnabled: design.manualPayEnabled,
            }}
            variants={design.variants.map((v) => ({
              id: v.id, size: v.size, color: v.color, colorHex: v.colorHex, priceDelta: v.priceDelta, active: v.active,
            }))}
            colors={colors}
            colorImages={colorImages}
            palette={palette}
          />
        </div>
      </div>

      <section>
        <h2 className="font-display text-3xl">Orders ({design.orders.length})</h2>
        <div className="card mt-3 overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr><th>When</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th></tr>
            </thead>
            <tbody>
              {design.orders.length === 0 && (
                <tr><td colSpan={6} className="text-cream/60">No orders yet.</td></tr>
              )}
              {design.orders.map((o) => (
                <tr key={o.id}>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                  <td>{o.customerName}<br /><span className="text-xs text-cream/60">{o.customerEmail}</span></td>
                  <td>{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td>{formatUsd(o.total)}</td>
                  <td>{o.status}</td>
                  <td>{o.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
