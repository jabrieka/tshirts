import { upload } from "@vercel/blob/client";

/**
 * Uploads a file straight from the browser to Vercel Blob via a server-issued
 * token, returning the public blob URL. This avoids routing large files through
 * the API function (Vercel caps function request bodies at 4.5 MB).
 *
 * Returns null when Blob is not available (e.g. local dev with no token), so
 * callers can fall back to submitting the raw file in a multipart form.
 */
export async function uploadToBlob(file: File, subdir = ""): Promise<string | null> {
  try {
    const pathname = subdir ? `${subdir}/${file.name}` : file.name;
    const result = await upload(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
    });
    return result.url;
  } catch (e) {
    console.warn("Blob client upload unavailable, falling back to form upload:", e);
    return null;
  }
}
