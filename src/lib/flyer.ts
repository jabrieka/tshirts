import path from "node:path";
import fs from "node:fs/promises";
import QRCode from "qrcode";
import type { Palette } from "./palette";
import { renderSvgToPng } from "./render-svg";

type FlyerInput = {
  title: string;
  clientName?: string | null;
  price: number;
  orderDeadline?: Date | null;
  artworkPublicUrl: string;
  orderUrl: string;
  palette: Palette;
};

/**
 * Build the flyer SVG (vibrant, layered, dynamically themed from palette).
 * Use renderFlyerPng() to rasterize via sharp.
 */
export async function buildFlyerSvg(input: FlyerInput): Promise<string> {
  const { title, clientName, price, orderDeadline, artworkPublicUrl, orderUrl, palette } = input;
  const W = 1080;
  const H = 1620;
  const qrDataUrl = await QRCode.toDataURL(orderUrl, {
    width: 360,
    margin: 1,
    color: {
      dark: palette.text === "#FAF5EA" ? palette.primary : palette.background,
      light: palette.text === "#FAF5EA" ? palette.background : "#FFFFFFFF",
    },
    errorCorrectionLevel: "H",
  });

  const artworkDataUrl = await imageToDataUrl(artworkPublicUrl);

  const deadlineStr = orderDeadline
    ? new Date(orderDeadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "Order Anytime";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.primary}"/>
      <stop offset="55%" stop-color="${palette.accent}"/>
      <stop offset="100%" stop-color="${palette.background}"/>
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="34%" r="60%">
      <stop offset="0%" stop-color="${palette.secondary}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${palette.background}" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain" x="0" y="0">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0"/>
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#halo)"/>

  <g opacity="0.18">
    ${stripes(W, H, palette.secondary)}
  </g>

  <rect x="0" y="0" width="${W}" height="80" fill="${palette.background}"/>
  <text x="48" y="54" font-family="Anton, sans-serif" font-size="34" fill="${palette.secondary}" letter-spacing="2">COSETTE PRODUCTIONS</text>
  <text x="${W - 48}" y="54" text-anchor="end" font-family="Inter, sans-serif" font-size="24" fill="${palette.text}">CUSTOM TEES · CULTURE · COMMUNITY</text>

  <g transform="translate(120, 160)">
    <rect x="-12" y="-12" width="864" height="864" fill="${palette.background}" opacity="0.92" rx="32"/>
    <rect x="0" y="0" width="840" height="840" fill="${palette.text === "#FAF5EA" ? "#000" : "#fff"}" rx="24"/>
    <image href="${artworkDataUrl}" x="0" y="0" width="840" height="840" preserveAspectRatio="xMidYMid meet"/>
  </g>

  <g transform="translate(80, 1060)">
    ${clientName ? `<text x="0" y="0" font-family="Inter, sans-serif" font-size="28" fill="${palette.secondary}" letter-spacing="6">${escapeXml(clientName.toUpperCase())} · PRESENTS</text>` : ""}
    <text x="0" y="80" font-family="Anton, sans-serif" font-size="${titleSize(title)}" fill="${palette.text}">${escapeXml(title.toUpperCase())}</text>
  </g>

  <g transform="translate(80, 1230)" font-family="Inter, sans-serif">
    <g>
      <rect x="0" y="0" width="280" height="86" rx="20" fill="${palette.secondary}"/>
      <text x="22" y="36" font-size="18" fill="${palette.background}" letter-spacing="3">STARTING AT</text>
      <text x="22" y="74" font-size="38" font-weight="700" fill="${palette.background}">$${price.toFixed(0)}</text>
    </g>
    <g transform="translate(300,0)">
      <rect x="0" y="0" width="430" height="86" rx="20" fill="${palette.primary}"/>
      <text x="22" y="36" font-size="18" fill="${palette.text}" letter-spacing="3">ORDER BY</text>
      <text x="22" y="74" font-size="32" font-weight="700" fill="${palette.text}">${escapeXml(deadlineStr.toUpperCase())}</text>
    </g>
  </g>

  <g transform="translate(80, 1370)">
    <text x="0" y="0" font-family="Anton, sans-serif" font-size="40" fill="${palette.text}">SCAN TO ORDER →</text>
    <text x="0" y="46" font-family="Inter, sans-serif" font-size="22" fill="${palette.text}" opacity="0.85">cosetteproductions.com</text>
  </g>

  <g transform="translate(${W - 380}, 1290)">
    <rect x="-20" y="-20" width="320" height="320" rx="28" fill="${palette.text === "#FAF5EA" ? palette.background : "#fff"}"/>
    <image href="${qrDataUrl}" x="0" y="0" width="280" height="280"/>
  </g>

  <rect width="100%" height="100%" filter="url(#grain)" opacity="0.4"/>

  <rect x="0" y="${H - 56}" width="${W}" height="56" fill="${palette.background}"/>
  <text x="${W / 2}" y="${H - 20}" text-anchor="middle" font-family="Inter, sans-serif" font-size="18" fill="${palette.secondary}" letter-spacing="6">DESIGNED · PRINTED · PROMOTED BY COSETTE PRODUCTIONS</text>
</svg>`;
}

export async function renderFlyerPng(input: FlyerInput): Promise<Buffer> {
  const svg = await buildFlyerSvg(input);
  return renderSvgToPng(svg);
}

function titleSize(t: string): number {
  if (t.length > 28) return 72;
  if (t.length > 20) return 92;
  return 116;
}

function stripes(w: number, h: number, color: string): string {
  const out: string[] = [];
  const step = 90;
  for (let x = -h; x < w; x += step) {
    out.push(`<rect x="${x}" y="0" width="22" height="${h}" fill="${color}" transform="rotate(20 ${x} 0)"/>`);
  }
  return out.join("");
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function imageToDataUrl(publicUrl: string): Promise<string> {
  let buf: Buffer | null = null;
  let ext = "png";
  if (publicUrl.startsWith("http://") || publicUrl.startsWith("https://")) {
    try {
      const res = await fetch(publicUrl);
      if (res.ok) {
        buf = Buffer.from(await res.arrayBuffer());
        const ct = res.headers.get("content-type") ?? "";
        if (ct.includes("svg")) ext = "svg";
        else if (ct.includes("jpeg")) ext = "jpg";
        else if (ct.includes("webp")) ext = "webp";
        else if (ct.includes("gif")) ext = "gif";
        else ext = "png";
      }
    } catch {}
  } else {
    const rel = publicUrl.startsWith("/") ? publicUrl.slice(1) : publicUrl;
    const abs = path.join(process.cwd(), "public", rel);
    try {
      buf = await fs.readFile(abs);
      ext = path.extname(abs).toLowerCase().replace(".", "") || "png";
    } catch {}
  }
  if (!buf) {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  }
  const mime =
    ext === "svg" ? "image/svg+xml" :
    ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
    ext === "webp" ? "image/webp" :
    ext === "gif" ? "image/gif" :
    "image/png";
  return `data:${mime};base64,${buf.toString("base64")}`;
}
