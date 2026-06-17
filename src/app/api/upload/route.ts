import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireAdmin } from "@/lib/auth";

/**
 * Issues short-lived client upload tokens so the browser can upload files
 * directly to Vercel Blob, bypassing the 4.5 MB serverless request body limit.
 * Only authenticated admins may obtain a token.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json()) as HandleUploadBody;
  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        await requireAdmin(); // throws if not signed in
        return {
          allowedContentTypes: [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "image/gif",
            "image/svg+xml",
          ],
          addRandomSuffix: true,
        };
      },
      // The browser receives the URL from the upload() call directly, so there
      // is nothing to persist here. (This callback is not invoked on localhost.)
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Upload failed" }, { status: 400 });
  }
}
