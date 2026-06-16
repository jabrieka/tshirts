import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientsManager from "./ClientsManager";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const session = await getSession();
  if (!session.userId) redirect("/admin/login");
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { designs: true } } },
  });
  return (
    <div>
      <h1 className="font-display text-4xl">Clients</h1>
      <p className="text-cream/70 mt-2">Manage the brands, organizations, and artists Cosette runs campaigns for.</p>
      <div className="mt-6">
        <ClientsManager initial={clients.map((c) => ({ id: c.id, name: c.name, email: c.email, designsCount: c._count.designs }))} />
      </div>
    </div>
  );
}
