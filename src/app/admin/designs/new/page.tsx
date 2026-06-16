import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import NewDesignForm from "./NewDesignForm";

export const dynamic = "force-dynamic";

export default async function NewDesignPage() {
  const session = await getSession();
  if (!session.userId) redirect("/admin/login");
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="font-display text-4xl">+ New Design</h1>
      <p className="text-cream/70 mt-2 max-w-prose">
        Upload artwork — Cosette will auto-extract a palette and theme the order page, QR code, and flyer to match.
      </p>
      <div className="card p-6 mt-6">
        <NewDesignForm clients={clients.map((c) => ({ id: c.id, name: c.name }))} />
      </div>
    </div>
  );
}
