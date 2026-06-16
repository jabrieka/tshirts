import { NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Email and password required." }, { status: 400 });
  const ok = await login(email, password);
  if (!ok) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  return NextResponse.json({ ok: true });
}
