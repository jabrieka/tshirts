import { prisma } from "@/lib/prisma";
import { safeParsePalette } from "@/lib/palette";
import { renderFlyerPng } from "@/lib/flyer";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const design = await prisma.shirtDesign.findUnique({
    where: { id },
    include: { client: true },
  });
  if (!design) return new Response("Not found", { status: 404 });
  const palette = safeParsePalette(design.paletteJson);
  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/shop/${design.slug}`;

  // Optional ?color=<name> swaps the embedded artwork to that colorway's image.
  const color = new URL(req.url).searchParams.get("color");
  let artworkPublicUrl = design.artworkUrl;
  if (color) {
    try {
      const map = design.colorImagesJson ? JSON.parse(design.colorImagesJson) : {};
      if (map[color]) artworkPublicUrl = map[color];
    } catch {}
  }

  const png = await renderFlyerPng({
    title: design.title,
    clientName: design.client?.name ?? null,
    price: design.basePrice,
    orderDeadline: design.orderDeadline,
    artworkPublicUrl,
    orderUrl,
    palette,
  });
  return new Response(png as any, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=300",
      "Content-Disposition": `inline; filename="${design.slug}-flyer.png"`,
    },
  });
}
