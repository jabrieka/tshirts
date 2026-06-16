import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatUsd } from "@/lib/money";
import OrdersTable from "./OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await getSession();
  if (!session.userId) redirect("/admin/login");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { design: { select: { title: true, slug: true } }, items: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-4xl">Orders</h1>
        <a href="/api/orders/export" className="btn-pop">EXPORT CSV</a>
      </div>
      <div className="card mt-6 overflow-x-auto">
        <OrdersTable orders={orders.map((o) => ({
          id: o.id,
          createdAt: o.createdAt.toISOString(),
          customerName: o.customerName,
          customerEmail: o.customerEmail,
          design: o.design.title,
          itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
          total: o.total,
          status: o.status,
          paymentStatus: o.paymentStatus,
          fulfillment: o.fulfillment,
        }))} />
      </div>
    </div>
  );
}
