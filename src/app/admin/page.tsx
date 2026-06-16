import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatUsd } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session.userId) redirect("/admin/login");

  const [designCount, orderCount, requestCount, revenue, recentOrders, recentRequests] = await Promise.all([
    prisma.shirtDesign.count(),
    prisma.order.count(),
    prisma.customRequest.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { design: true } }),
    prisma.customRequest.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const stats = [
    { label: "Designs", value: String(designCount), color: "#FF1F6D" },
    { label: "Orders", value: String(orderCount), color: "#FFD23F" },
    { label: "Custom Requests", value: String(requestCount), color: "#3B1FFF" },
    { label: "Paid Revenue", value: formatUsd(revenue._sum.total ?? 0), color: "#00E0FF" },
  ];

  return (
    <div className="space-y-10">
      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20" style={{ background: s.color }} />
            <div className="text-cream/70 text-xs tracking-widest uppercase">{s.label}</div>
            <div className="font-display text-4xl mt-2" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl">Recent Orders</h2>
          <Link href="/admin/orders" className="btn-ghost text-xs">VIEW ALL</Link>
        </div>
        <div className="card mt-3 overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr><th>When</th><th>Customer</th><th>Design</th><th>Status</th><th>Payment</th><th>Total</th></tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && (
                <tr><td colSpan={6} className="text-cream/60">No orders yet.</td></tr>
              )}
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                  <td>{o.customerName}</td>
                  <td>{o.design.title}</td>
                  <td>{o.status}</td>
                  <td>{o.paymentStatus}</td>
                  <td>{formatUsd(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl">Recent Custom Requests</h2>
          <Link href="/admin/requests" className="btn-ghost text-xs">VIEW ALL</Link>
        </div>
        <div className="card mt-3 overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr><th>When</th><th>Name</th><th>Type</th><th>Qty</th><th>Status</th></tr>
            </thead>
            <tbody>
              {recentRequests.length === 0 && (
                <tr><td colSpan={5} className="text-cream/60">No requests yet.</td></tr>
              )}
              {recentRequests.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>{r.customerName}</td>
                  <td>{r.shirtType ?? "—"}</td>
                  <td>{r.quantityRange ?? "—"}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
