import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const session = await getSession();
  if (!session.userId) redirect("/admin/login");
  const requests = await prisma.customRequest.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="font-display text-4xl">Custom Requests</h1>
      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        {requests.length === 0 && <div className="card p-5 text-cream/70">No requests yet.</div>}
        {requests.map((r) => (
          <div key={r.id} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display text-2xl">{r.customerName}</div>
                <div className="text-cream/70 text-sm">{r.customerEmail} · {r.customerPhone ?? "—"}</div>
              </div>
              <div className="text-xs uppercase tracking-widest px-2 py-1 rounded-full border border-white/15">{r.status}</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-cream/60">Type:</span> {r.shirtType ?? "—"}</div>
              <div><span className="text-cream/60">Qty:</span> {r.quantityRange ?? "—"}</div>
              <div><span className="text-cream/60">Needs design:</span> {r.needsDesign ? "Yes" : "No"}</div>
              <div><span className="text-cream/60">Deadline:</span> {r.deadline ? new Date(r.deadline).toLocaleDateString() : "—"}</div>
            </div>
            <p className="mt-3 text-cream/90 text-sm whitespace-pre-wrap">{r.description}</p>
            {r.uploadUrl && (
              <a className="btn-ghost mt-3 inline-block" href={r.uploadUrl} target="_blank" rel="noreferrer">VIEW UPLOAD</a>
            )}
            <div className="mt-4 text-xs text-cream/60">{new Date(r.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
