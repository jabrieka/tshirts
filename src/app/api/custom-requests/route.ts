import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/upload";

export async function POST(req: Request) {
  const fd = await req.formData();
  let uploadUrl: string | null = null;
  const file = fd.get("upload");
  if (file instanceof File && file.size > 0) {
    uploadUrl = await saveUploadedFile(file, "custom-requests");
  }
  const created = await prisma.customRequest.create({
    data: {
      customerName: String(fd.get("customerName") ?? "").trim(),
      customerEmail: String(fd.get("customerEmail") ?? "").trim(),
      customerPhone: (fd.get("customerPhone") as string) || null,
      shirtType: (fd.get("shirtType") as string) || null,
      quantityRange: (fd.get("quantityRange") as string) || null,
      deadline: fd.get("deadline") ? new Date(String(fd.get("deadline"))) : null,
      description: String(fd.get("description") ?? "").trim(),
      uploadUrl,
      needsDesign: String(fd.get("needsDesign") ?? "false") === "true",
    },
  });
  return NextResponse.json({ ok: true, id: created.id });
}
