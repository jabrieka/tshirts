import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export type SessionData = {
  userId?: string;
  email?: string;
  role?: string;
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD ?? "this_is_a_dev_secret_change_me_now_xxxxxxxxxxxxx",
  cookieName: "cosette_session",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore as any, sessionOptions);
}

export async function login(email: string, password: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return false;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return false;
  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.role = user.role;
  await session.save();
  return true;
}

export async function logout() {
  const session = await getSession();
  session.destroy();
}

export async function requireAdmin(): Promise<SessionData> {
  const session = await getSession();
  if (!session.userId) throw new Error("UNAUTHORIZED");
  return session;
}
