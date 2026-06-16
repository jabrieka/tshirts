import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/upload";

/**
 * Manage per-color artwork for a design. Accepts multipart form data:
 *  - `colorImage:<colorName>` file fields → set/replace that color's image
 *  - `remove` field(s) with a color name → delete that color's mapping
 * Returns the updated { color: imageUrl } map.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const { id } = await params;
  const design = await prisma.shirtDesign.findUnique({ where: { id } });
  if (!design) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let map: Record<string, string> = {};
  try { map = design.colorImagesJson ? JSON.parse(design.colorImagesJson) : {}; } catch {}

  const fd = await req.formData();

  // Removals first, so re-uploading the same color in one request still wins.
  for (const value of fd.getAll("remove")) {
    const color = String(value);
    if (color) delete map[color];
  }

  // Uploads
  for (const [field, value] of fd.entries()) {
    if (!field.startsWith("colorImage:")) continue;
    if (!(value instanceof File) || value.size === 0) continue;
    const color = field.slice("colorImage:".length);
    map[color] = await saveUploadedFile(value, "designs");
  }

  const colorImagesJson = Object.keys(map).length ? JSON.stringify(map) : null;
  await prisma.shirtDesign.update({ where: { id }, data: { colorImagesJson } });
  return NextResponse.json({ colorImages: map });
}
