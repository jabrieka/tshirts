import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/upload";

export async function POST(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
  const body = await req.json();
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Name required." }, { status: 400 });
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let n = 1;
  while (await prisma.client.findUnique({ where: { slug } })) {
    n++; slug = `${baseSlug}-${n}`;
  }
  const created = await prisma.client.create({
    data: { name, slug, email: body.email || null },
  });
  return NextResponse.json({ id: created.id });
}
