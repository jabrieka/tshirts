import { prisma } from "@/lib/prisma";
import { safeParsePalette } from "@/lib/palette";
import { renderQrPng } from "@/lib/qr";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const design = await prisma.shirtDesign.findUnique({ where: { id } });
  if (!design) return new Response("Not found", { status: 404 });
  const palette = safeParsePalette(design.paletteJson);
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/shop/${design.slug}`;
  const png = await renderQrPng(url, palette);
  return new Response(png as any, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=300",
    },
  });
}
