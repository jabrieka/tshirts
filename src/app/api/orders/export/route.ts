import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try { await requireAdmin(); } catch { return new Response("Unauthorized", { status: 401 }); }
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { design: true, items: { include: { variant: true } } },
  });
  const rows: string[][] = [
    ["Order ID", "Created", "Customer", "Email", "Phone", "Design", "Items", "Fulfillment", "Shipping Address", "Subtotal", "Shipping", "Total", "Payment Method", "Payment Status", "Status"],
  ];
  for (const o of orders) {
    const itemsText = o.items.map((i) => `${i.quantity}× ${i.variant.size}/${i.variant.color}`).join("; ");
    rows.push([
      o.id,
      o.createdAt.toISOString(),
      o.customerName,
      o.customerEmail,
      o.customerPhone ?? "",
      o.design.title,
      itemsText,
      o.fulfillment,
      o.shippingAddress ?? "",
      o.subtotal.toFixed(2),
      o.shippingCost.toFixed(2),
      o.total.toFixed(2),
      o.paymentMethod,
      o.paymentStatus,
      o.status,
    ]);
  }
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cosette-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
