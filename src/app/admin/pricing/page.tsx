import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import PricingEditor from "./PricingEditor";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const session = await getSession();
  if (!session.userId) redirect("/admin/login");
  const items = await prisma.pricingItem.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <h1 className="font-display text-4xl">Pricing</h1>
      <p className="text-cream/70 mt-2">Editable pricing rows — changes appear on the public Pricing page immediately.</p>
      <div className="mt-6">
        <PricingEditor initial={items.map((i) => ({
          id: i.id, key: i.key, category: i.category, title: i.title, description: i.description ?? "", priceLabel: i.priceLabel, priceCents: i.priceCents, sortOrder: i.sortOrder, active: i.active,
        }))} />
      </div>
    </div>
  );
}
