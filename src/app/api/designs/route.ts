import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { saveUploadedFile, slugify } from "@/lib/upload";
import { extractPalette } from "@/lib/palette";

export async function GET() {
  const designs = await prisma.shirtDesign.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(designs);
}

export async function POST(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }

  const fd = await req.formData();
  const title = String(fd.get("title") ?? "").trim();
  if (!title) return NextResponse.json({ error: "Title required." }, { status: 400 });
  const file = fd.get("artwork");
  if (!(file instanceof File)) return NextResponse.json({ error: "Artwork required." }, { status: 400 });

  const artworkUrl = await saveUploadedFile(file, "designs");

  // Palette
  let paletteJson: string | undefined;
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const palette = await extractPalette(buf);
    paletteJson = JSON.stringify(palette);
  } catch {}

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let n = 1;
  while (await prisma.shirtDesign.findUnique({ where: { slug } })) {
    n++;
    slug = `${baseSlug}-${n}`;
  }

  const sizes: string[] = JSON.parse(String(fd.get("sizes") ?? "[]"));
  const colors: { name: string; hex: string }[] = JSON.parse(String(fd.get("colors") ?? "[]"));

  // Per-color artwork: file fields named `colorImage:<colorName>`. The primary
  // `artwork` above still drives the palette / flyer / QR.
  const colorImages: Record<string, string> = {};
  for (const [field, value] of fd.entries()) {
    if (!field.startsWith("colorImage:")) continue;
    if (!(value instanceof File) || value.size === 0) continue;
    const colorName = field.slice("colorImage:".length);
    colorImages[colorName] = await saveUploadedFile(value, "designs");
  }
  const colorImagesJson = Object.keys(colorImages).length ? JSON.stringify(colorImages) : undefined;

  const created = await prisma.shirtDesign.create({
    data: {
      slug,
      title,
      description: (fd.get("description") as string) || null,
      artworkUrl,
      basePrice: parseFloat(String(fd.get("basePrice") ?? "25")),
      shirtType: (fd.get("shirtType") as string) || "Unisex Tee",
      orderDeadline: fd.get("orderDeadline") ? new Date(String(fd.get("orderDeadline"))) : null,
      pickupAddress: (fd.get("pickupAddress") as string) || null,
      publiclyOrderable: fd.get("publiclyOrderable") === "on",
      pickupEnabled: fd.get("pickupEnabled") === "on",
      shippingEnabled: fd.get("shippingEnabled") === "on",
      stripeEnabled: fd.get("stripeEnabled") === "on",
      manualPayEnabled: fd.get("manualPayEnabled") === "on",
      clientId: (fd.get("clientId") as string) || null,
      paletteJson,
      colorImagesJson,
      variants: {
        create: sizes.flatMap((size) =>
          colors.map((c) => ({
            size,
            color: c.name,
            colorHex: c.hex,
            priceDelta: size === "2XL" ? 3 : size === "3XL" ? 5 : 0,
          }))
        ),
      },
    },
  });

  return NextResponse.json({ id: created.id, slug: created.slug });
}
