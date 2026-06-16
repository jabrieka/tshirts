import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { extractPalette } from "@/lib/palette";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const { id } = await params;
  const design = await prisma.shirtDesign.findUnique({ where: { id } });
  if (!design) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Re-extract palette (e.g. if you swapped the artwork on disk)
  const palette = await extractPalette(design.artworkUrl);
  await prisma.shirtDesign.update({ where: { id }, data: { paletteJson: JSON.stringify(palette) } });
  // QR + flyer are generated on demand by /api/qr/[id] and /api/flyer/[id]
  return NextResponse.redirect(new URL(`/admin/designs/${id}`, process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}
