import path from "node:path";
import fs from "node:fs";
import { Resvg } from "@resvg/resvg-js";

/**
 * Rasterizes an SVG string to PNG using bundled fonts. We render with resvg
 * (not sharp/librsvg) because resvg lets us supply font buffers explicitly —
 * essential on Vercel's serverless runtime, which ships no system fonts (so
 * sharp would render every glyph as a tofu box).
 *
 * Font families referenced in our SVGs:
 *   - "Anton"  → bold display/headline (replaces Impact / Arial Black)
 *   - "Inter"  → body / labels (replaces Helvetica / Arial)
 */
const FONT_DIR = path.join(process.cwd(), "src/assets/fonts");
const FONT_FILES = ["Anton-Regular.ttf", "Inter-Regular.ttf", "Inter-Bold.ttf"];

let cachedFontFiles: string[] | null = null;
function fontFiles(): string[] {
  if (cachedFontFiles) return cachedFontFiles;
  cachedFontFiles = FONT_FILES.map((f) => path.join(FONT_DIR, f)).filter((p) => fs.existsSync(p));
  return cachedFontFiles;
}

export function renderSvgToPng(svg: string): Buffer {
  const resvg = new Resvg(svg, {
    font: {
      fontFiles: fontFiles(),
      loadSystemFonts: false,
      defaultFontFamily: "Inter",
    },
  });
  return Buffer.from(resvg.render().asPng());
}
