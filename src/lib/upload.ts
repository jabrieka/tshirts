import path from "node:path";
import fs from "node:fs/promises";
import { randomBytes } from "node:crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "public/uploads";

/**
 * Saves an uploaded file. On Vercel (or any host) where BLOB_READ_WRITE_TOKEN
 * is configured, uses Vercel Blob storage and returns the absolute blob URL.
 * Locally, writes to the public/uploads directory and returns a relative URL.
 */
export async function saveUploadedFile(file: File, subdir = ""): Promise<string> {
  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const id = randomBytes(8).toString("hex");
  const filename = `${id}.${ext || "bin"}`;
  const key = path.posix.join(subdir, filename);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    // Vercel Blob (lazy import so build works without the package locally)
    try {
      const mod = await import("@vercel/blob" as any);
      const buf = Buffer.from(await file.arrayBuffer());
      const { url } = await mod.put(key, buf, { access: "public", token: process.env.BLOB_READ_WRITE_TOKEN });
      return url;
    } catch (e) {
      console.warn("Vercel Blob unavailable, falling back to filesystem:", e);
    }
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const targetDir = path.join(process.cwd(), UPLOAD_DIR, subdir);
  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(path.join(targetDir, filename), buf);
  const publicRoot = UPLOAD_DIR.startsWith("public/") ? UPLOAD_DIR.slice("public/".length) : UPLOAD_DIR;
  return `/${path.posix.join(publicRoot, subdir, filename)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || randomBytes(4).toString("hex");
}
