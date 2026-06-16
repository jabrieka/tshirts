import path from "node:path";
import fs from "node:fs/promises";

export type Palette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
};

const FALLBACK: Palette = {
  primary: "#FF1F6D",
  secondary: "#FFD23F",
  accent: "#3B1FFF",
  background: "#0B0B12",
  text: "#FAF5EA",
};

function hex(n: number): string {
  return n.toString(16).padStart(2, "0");
}
function rgbToHex(r: number, g: number, b: number): string {
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}
function luminance(r: number, g: number, b: number): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

async function resolveBufferFromPublicUrl(publicUrl: string): Promise<Buffer | null> {
  if (publicUrl.startsWith("http://") || publicUrl.startsWith("https://")) {
    try {
      const res = await fetch(publicUrl);
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    } catch {
      return null;
    }
  }
  const rel = publicUrl.startsWith("/") ? publicUrl.slice(1) : publicUrl;
  const abs = path.join(process.cwd(), "public", rel);
  try {
    return await fs.readFile(abs);
  } catch {
    return null;
  }
}

/**
 * AI-style branding extraction: pulls a vibrant 5-color palette from artwork
 * so the order page, QR, flyer, social, and email graphics can all theme
 * around the design. Uses node-vibrant for raster; falls back to a quantized
 * sharp-based pixel scan (handles SVG, network errors, weird codecs).
 */
export async function extractPalette(input: Buffer | string): Promise<Palette> {
  const buf = typeof input === "string" ? await resolveBufferFromPublicUrl(input) : input;
  if (!buf) return FALLBACK;

  // node-vibrant path
  try {
    const { default: Vibrant } = await import("node-vibrant");
    const v = await Vibrant.from(buf).getPalette();
    const swatch = (name: keyof typeof v) => v[name]?.getHex();
    const palette: Palette = {
      primary: (swatch("Vibrant") ?? swatch("LightVibrant") ?? FALLBACK.primary).toUpperCase(),
      secondary: (swatch("LightVibrant") ?? swatch("Muted") ?? FALLBACK.secondary).toUpperCase(),
      accent: (swatch("DarkVibrant") ?? swatch("LightMuted") ?? FALLBACK.accent).toUpperCase(),
      background: (swatch("DarkMuted") ?? swatch("DarkVibrant") ?? FALLBACK.background).toUpperCase(),
      text: FALLBACK.text,
    };
    const bg = palette.background.replace("#", "");
    const br = parseInt(bg.substring(0, 2), 16);
    const bgg = parseInt(bg.substring(2, 4), 16);
    const bb = parseInt(bg.substring(4, 6), 16);
    palette.text = luminance(br, bgg, bb) > 0.55 ? "#0B0B12" : "#FAF5EA";
    return palette;
  } catch {
    // Sharp fallback
    try {
      const sharp = (await import("sharp")).default;
      const result = await sharp(buf).resize(64, 64, { fit: "cover" }).raw().toBuffer({ resolveWithObject: true });
      const { data, info } = result;
      const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
      const stride = info.channels;
      for (let i = 0; i < data.length; i += stride) {
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        const key = `${r},${g},${b}`;
        const cur = buckets.get(key) ?? { r, g, b, count: 0 };
        cur.count++;
        buckets.set(key, cur);
      }
      const sorted = [...buckets.values()].sort((a, b) => b.count - a.count);
      const top = sorted.slice(0, 5);
      if (top.length === 0) return FALLBACK;
      const primary = rgbToHex(top[0].r, top[0].g, top[0].b);
      const secondary = top[1] ? rgbToHex(top[1].r, top[1].g, top[1].b) : FALLBACK.secondary;
      const accent = top[2] ? rgbToHex(top[2].r, top[2].g, top[2].b) : FALLBACK.accent;
      const darkest = [...top].sort((a, b) => luminance(a.r, a.g, a.b) - luminance(b.r, b.g, b.b))[0];
      const background = rgbToHex(darkest.r, darkest.g, darkest.b);
      const text = luminance(darkest.r, darkest.g, darkest.b) > 0.55 ? "#0B0B12" : "#FAF5EA";
      return { primary, secondary, accent, background, text };
    } catch {
      return FALLBACK;
    }
  }
}

export async function extractPaletteFromPublicUrl(publicUrl: string): Promise<Palette> {
  return extractPalette(publicUrl);
}

export function safeParsePalette(json: string | null | undefined): Palette {
  if (!json) return FALLBACK;
  try {
    const obj = JSON.parse(json);
    return {
      primary: obj.primary ?? FALLBACK.primary,
      secondary: obj.secondary ?? FALLBACK.secondary,
      accent: obj.accent ?? FALLBACK.accent,
      background: obj.background ?? FALLBACK.background,
      text: obj.text ?? FALLBACK.text,
    };
  } catch {
    return FALLBACK;
  }
}

export const FALLBACK_PALETTE = FALLBACK;
