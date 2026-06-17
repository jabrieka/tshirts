import { prisma } from "@/lib/prisma";
import { safeParsePalette, type Palette } from "@/lib/palette";
import { renderSvgToPng } from "@/lib/render-svg";

/**
 * Auto-themed wide email banner (1200×600) for the campaign — drop into Mailchimp,
 * Klaviyo, or your transactional sender.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const design = await prisma.shirtDesign.findUnique({ where: { id }, include: { client: true } });
  if (!design) return new Response("Not found", { status: 404 });
  const palette = safeParsePalette(design.paletteJson);
  const svg = buildEmailSvg(design.title, design.client?.name ?? null, design.basePrice, palette);
  const png = renderSvgToPng(svg);
  return new Response(png as any, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=300",
      "Content-Disposition": `inline; filename="${design.slug}-email.png"`,
    },
  });
}

function buildEmailSvg(title: string, client: string | null, price: number, p: Palette): string {
  const W = 1200, H = 600;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.primary}"/>
      <stop offset="100%" stop-color="${p.accent}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="${W-260}" y="0" width="260" height="${H}" fill="${p.background}"/>
  <text x="60" y="120" font-family="Inter, sans-serif" font-size="22" letter-spacing="8" fill="${p.secondary}">${escape((client ?? "COSETTE").toUpperCase())} · NEW DROP</text>
  <text x="60" y="290" font-family="Anton, sans-serif" font-size="130" fill="${p.text}">${escape(title.toUpperCase())}</text>
  <text x="60" y="370" font-family="Inter, sans-serif" font-size="28" fill="${p.text}" opacity="0.9">Auto-themed by the artwork. Order, share, repeat.</text>
  <rect x="60" y="430" width="320" height="86" rx="20" fill="${p.secondary}"/>
  <text x="84" y="466" font-family="Inter, sans-serif" font-size="18" letter-spacing="3" fill="${p.background}">STARTING AT</text>
  <text x="84" y="504" font-family="Anton, sans-serif" font-size="40" fill="${p.background}">$${price.toFixed(0)} →</text>
  <text x="${W-130}" y="${H/2}" text-anchor="middle" font-family="Anton, sans-serif" font-size="48" fill="${p.secondary}" transform="rotate(-90 ${W-130} ${H/2})">COSETTE PRODUCTIONS</text>
</svg>`;
}
function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
