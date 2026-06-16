import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const items = await prisma.pricingItem.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const body = await req.json();
  const created = await prisma.pricingItem.create({
    data: {
      key: body.key,
      category: body.category,
      title: body.title,
      description: body.description ?? null,
      priceLabel: body.priceLabel,
      priceCents: body.priceCents ?? 0,
      sortOrder: body.sortOrder ?? 0,
    },
  });
  return NextResponse.json({ ...created, description: created.description ?? "" });
}
