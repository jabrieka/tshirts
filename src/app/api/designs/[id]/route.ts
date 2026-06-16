import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.shirtDesign.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description ?? null,
      basePrice: typeof body.basePrice === "number" ? body.basePrice : undefined,
      shirtType: body.shirtType,
      orderDeadline: body.orderDeadline ? new Date(body.orderDeadline) : null,
      pickupAddress: body.pickupAddress ?? null,
      publiclyOrderable: body.publiclyOrderable,
      pickupEnabled: body.pickupEnabled,
      shippingEnabled: body.shippingEnabled,
      stripeEnabled: body.stripeEnabled,
      manualPayEnabled: body.manualPayEnabled,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const { id } = await params;
  // Unlink orders, then cascade variants
  await prisma.order.updateMany({ where: { designId: id }, data: {} }); // orders kept; FK preserved
  await prisma.shirtDesign.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
