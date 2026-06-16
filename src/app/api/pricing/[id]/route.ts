import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.pricingItem.update({
    where: { id },
    data: {
      category: body.category,
      title: body.title,
      description: body.description ?? null,
      priceLabel: body.priceLabel,
      priceCents: body.priceCents,
      sortOrder: body.sortOrder,
      active: body.active,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const { id } = await params;
  await prisma.pricingItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
