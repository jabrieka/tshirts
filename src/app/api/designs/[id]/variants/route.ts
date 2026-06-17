import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * Reconciles a design's variants to the given set of sizes × colors.
 *  - Creates any new size/color combination.
 *  - Re-activates and syncs the swatch hex for combos that still exist.
 *  - For combos that were removed: deletes them, unless they already have
 *    order items (then they're deactivated so order history stays intact).
 *
 * Body: { sizes: string[], colors: { name: string; hex?: string | null }[] }
 */
function sizeDelta(size: string): number {
  return size === "2XL" ? 3 : size === "3XL" ? 5 : 0;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const { id } = await params;
  const body = await req.json();
  const sizes: string[] = Array.isArray(body.sizes) ? body.sizes.filter(Boolean) : [];
  const colors: { name: string; hex?: string | null }[] = Array.isArray(body.colors)
    ? body.colors.filter((c: any) => c && c.name)
    : [];

  if (sizes.length === 0 || colors.length === 0) {
    return NextResponse.json({ error: "Pick at least one size and one color." }, { status: 400 });
  }

  const design = await prisma.shirtDesign.findUnique({
    where: { id },
    include: { variants: { include: { orderItems: { select: { id: true } } } } },
  });
  if (!design) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const key = (size: string, color: string) => `${size}|||${color}`;
  const desired = new Map<string, { size: string; color: string; hex: string | null }>();
  for (const s of sizes) {
    for (const c of colors) desired.set(key(s, c.name), { size: s, color: c.name, hex: c.hex ?? null });
  }
  const existingKeys = new Set(design.variants.map((v) => key(v.size, v.color)));

  // Create new combos.
  const toCreate = [...desired.values()].filter((d) => !existingKeys.has(key(d.size, d.color)));
  if (toCreate.length) {
    await prisma.shirtVariant.createMany({
      data: toCreate.map((d) => ({
        designId: id,
        size: d.size,
        color: d.color,
        colorHex: d.hex,
        priceDelta: sizeDelta(d.size),
      })),
    });
  }

  // Update / deactivate / delete existing combos.
  for (const v of design.variants) {
    const want = desired.get(key(v.size, v.color));
    if (want) {
      if (!v.active || v.colorHex !== want.hex) {
        await prisma.shirtVariant.update({ where: { id: v.id }, data: { active: true, colorHex: want.hex } });
      }
    } else if (v.orderItems.length > 0) {
      if (v.active) await prisma.shirtVariant.update({ where: { id: v.id }, data: { active: false } });
    } else {
      await prisma.shirtVariant.delete({ where: { id: v.id } });
    }
  }

  const variants = await prisma.shirtVariant.findMany({
    where: { designId: id },
    orderBy: [{ color: "asc" }, { size: "asc" }],
  });
  return NextResponse.json({ variants });
}
