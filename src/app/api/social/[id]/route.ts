import { prisma } from "@/lib/prisma";
import { safeParsePalette, type Palette } from "@/lib/palette";
import { renderSvgToPng } from "@/lib/render-svg";

/**
 * Auto-generated social media graphic for a design (1080×1080).
 * Themed to the artwork palette — share-ready for Instagram / Twitter.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const design = await prisma.shirtDesign.findUnique({ where: { id }, include: { client: true } });
  if (!design) return new Response("Not found", { status: 404 });
  const palette = safeParsePalette(design.paletteJson);
  const svg = buildSocialSvg(design, palette);
  const png = renderSvgToPng(svg);
  return new Response(png as any, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=300",
      "Content-Disposition": `inline; filename="${design.slug}-social.png"`,
    },
  });
}

function buildSocialSvg(design: { title: string; basePrice: number; client?: { name: string } | null; orderDeadline?: Date | null }, p: Palette): string {
  const W = 1080;
  const H = 1080;
  const deadline = design.orderDeadline ? new Date(design.orderDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "OPEN NOW";
  const client = design.client?.name ?? "COSETTE PRODUCTIONS";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.primary}"/>
      <stop offset="100%" stop-color="${p.accent}"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="${p.secondary}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${p.background}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#halo)"/>
  <g font-family="Anton, sans-serif" fill="${p.text}">
    <text x="60" y="120" font-size="32" letter-spacing="8" fill="${p.secondary}">${escape(client.toUpperCase())} · DROP</text>
    <text x="60" y="380" font-size="160">${escape(design.title.toUpperCase())}</text>
  </g>
  <g transform="translate(60, 820)">
    <rect x="0" y="0" width="380" height="120" rx="24" fill="${p.secondary}"/>
    <text x="28" y="50" font-family="Inter, sans-serif" font-size="22" fill="${p.background}" letter-spacing="4">STARTING AT</text>
    <text x="28" y="100" font-family="Anton, sans-serif" font-size="60" fill="${p.background}">$${design.basePrice.toFixed(0)}</text>
  </g>
  <g transform="translate(480, 820)">
    <rect x="0" y="0" width="540" height="120" rx="24" fill="${p.background}"/>
    <text x="28" y="50" font-family="Inter, sans-serif" font-size="22" fill="${p.secondary}" letter-spacing="4">ORDER BY</text>
    <text x="28" y="100" font-family="Anton, sans-serif" font-size="56" fill="${p.text}">${escape(deadline.toUpperCase())}</text>
  </g>
  <text x="${W/2}" y="${H-50}" text-anchor="middle" font-family="Inter, sans-serif" font-size="22" fill="${p.text}" letter-spacing="8">COSETTEPRODUCTIONS.COM</text>
</svg>`;
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
