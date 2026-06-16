import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: body.status,
      paymentStatus: body.paymentStatus,
      notes: body.notes,
    },
  });
  return NextResponse.json(updated);
}
