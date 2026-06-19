import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";
import { Resvg } from "@resvg/resvg-js";

// Brand tokens (mirrors tailwind.config.ts / globals.css)
const INK = "#0B0B12";
const CREAM = "#FAF5EA";
const FLAME = "#FF1F6D";
const ROYAL = "#3B1FFF";
const SUN = "#FFD23F";
const LIME = "#9DFF00";

const SITE_URL = "https://tshirts.cosetteproductions.com";
const W = 1080;
const H = 1620;

const FONT_DIR = path.join(process.cwd(), "src/assets/fonts");
const dataUrl = (file: string, mime: string) =>
  `data:${mime};base64,${fs.readFileSync(path.join(process.cwd(), file)).toString("base64")}`;

function pill(x: number, y: number, w: number, label: string, fill: string): string {
  return `
    <g transform="translate(${x}, ${y})">
      <rect x="6" y="6" width="${w}" height="64" rx="14" fill="${INK}"/>
      <rect x="0" y="0" width="${w}" height="64" rx="14" fill="${fill}" stroke="${INK}" stroke-width="3"/>
      <text x="${w / 2}" y="42" text-anchor="middle" font-family="Inter" font-weight="700" font-size="26" fill="${INK}" letter-spacing="1">${label}</text>
    </g>`;
}

async function main() {
  const qr = await QRCode.toDataURL(SITE_URL, {
    width: 360,
    margin: 1,
    color: { dark: INK, light: "#FFFFFFFF" },
    errorCorrectionLevel: "H",
  });
  const logo = dataUrl("public/cosette-logo.png", "image/png");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="g1" cx="18%" cy="14%" r="55%">
      <stop offset="0%" stop-color="${FLAME}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${FLAME}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="92%" cy="6%" r="55%">
      <stop offset="0%" stop-color="${ROYAL}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${ROYAL}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g3" cx="50%" cy="104%" r="60%">
      <stop offset="0%" stop-color="${SUN}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${SUN}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="head" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${FLAME}"/>
      <stop offset="55%" stop-color="${SUN}"/>
      <stop offset="100%" stop-color="${ROYAL}"/>
    </linearGradient>
  </defs>

  <rect width="100%" height="100%" fill="${INK}"/>
  <rect width="100%" height="100%" fill="url(#g1)"/>
  <rect width="100%" height="100%" fill="url(#g2)"/>
  <rect width="100%" height="100%" fill="url(#g3)"/>

  <!-- Brand row -->
  <g transform="translate(72, 80)">
    <image href="${logo}" x="0" y="0" width="92" height="92"/>
    <text x="112" y="40" font-family="Bebas Neue" font-size="40" fill="${CREAM}" letter-spacing="2">TSHIRTS</text>
    <text x="112" y="80" font-family="Bebas Neue" font-size="40" fill="${SUN}" letter-spacing="2">COSETTE PRODUCTIONS</text>
  </g>

  <!-- Hero headline -->
  <g transform="translate(72, 360)" font-family="Bebas Neue">
    <text x="0" y="0" font-size="150" fill="${CREAM}" letter-spacing="1">CUSTOM TEES.</text>
    <text x="0" y="150" font-size="150" fill="${SUN}" letter-spacing="1">CAMPAIGNS.</text>
    <text x="0" y="300" font-size="150" fill="${CREAM}" letter-spacing="1">CULTURE.</text>
  </g>

  <text x="72" y="800" font-family="Inter" font-size="30" fill="${CREAM}" opacity="0.92">Bold custom T-shirt design, printing &amp; full</text>
  <text x="72" y="842" font-family="Inter" font-size="30" fill="${CREAM}" opacity="0.92">campaign launches — for artists, organizers</text>
  <text x="72" y="884" font-family="Inter" font-size="30" fill="${CREAM}" opacity="0.92">&amp; community brands.</text>

  <!-- Feature pills -->
  ${pill(72, 950, 360, "CUSTOM SHIRTS FROM $25", SUN)}
  ${pill(452, 950, 300, "BULK DISCOUNTS", LIME)}
  ${pill(72, 1040, 420, "FLYER + QR ORDER PAGES", FLAME)}
  ${pill(512, 1040, 300, "PICKUP OR SHIPPING", "#00E0FF")}

  <!-- CTA + QR -->
  <g transform="translate(72, 1200)">
    <rect x="8" y="8" width="560" height="300" rx="24" fill="${INK}"/>
    <rect x="0" y="0" width="560" height="300" rx="24" fill="${SUN}" stroke="${INK}" stroke-width="4"/>
    <text x="40" y="80" font-family="Bebas Neue" font-size="64" fill="${INK}">ORDER NOW</text>
    <text x="40" y="135" font-family="Inter" font-weight="700" font-size="26" fill="${INK}">Scan or visit:</text>
    <text x="40" y="180" font-family="Inter" font-weight="700" font-size="30" fill="${FLAME}">tshirts.cosette</text>
    <text x="40" y="218" font-family="Inter" font-weight="700" font-size="30" fill="${FLAME}">productions.com</text>
    <text x="40" y="272" font-family="Inter" font-size="22" fill="${INK}" opacity="0.7">Design · Print · Promote</text>
  </g>

  <g transform="translate(700, 1200)">
    <rect x="0" y="0" width="308" height="308" rx="24" fill="#FFFFFF" stroke="${INK}" stroke-width="4"/>
    <image href="${qr}" x="14" y="14" width="280" height="280"/>
  </g>

  <rect x="0" y="${H - 60}" width="${W}" height="60" fill="${INK}"/>
  <text x="${W / 2}" y="${H - 22}" text-anchor="middle" font-family="Inter" font-size="18" fill="${SUN}" letter-spacing="6">DESIGNED · PRINTED · PROMOTED BY COSETTE PRODUCTIONS</text>
</svg>`;

  const resvg = new Resvg(svg, {
    font: {
      fontFiles: [
        path.join(FONT_DIR, "BebasNeue-Regular.ttf"),
        path.join(FONT_DIR, "Inter-Regular.ttf"),
        path.join(FONT_DIR, "Inter-Bold.ttf"),
      ],
      loadSystemFonts: false,
      defaultFontFamily: "Inter",
    },
  });
  const png = resvg.render().asPng();
  fs.writeFileSync("public/site-flyer.png", png);
  console.log("Wrote public/site-flyer.png", (png.length / 1024).toFixed(0) + "KB");
}

main();
