import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.userId) {
    // Allow login route through
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-ink">
      <div className="max-w-7xl mx-auto px-5 pt-8 pb-20">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/admin" className="font-display text-3xl tracking-wider">
            <span className="text-cream">COSETTE</span>{" "}
            <span className="text-sun">ADMIN</span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-cream/70">{session.email}</span>
            <form action="/api/auth/logout" method="post">
              <button className="btn-ghost text-xs px-3 py-1">LOG OUT</button>
            </form>
          </div>
        </div>

        <nav className="mt-6 flex flex-wrap gap-2 font-display tracking-widest text-sm">
          {[
            ["/admin", "DASHBOARD"],
            ["/admin/designs", "DESIGNS"],
            ["/admin/designs/new", "+ NEW DESIGN"],
            ["/admin/clients", "CLIENTS"],
            ["/admin/orders", "ORDERS"],
            ["/admin/requests", "CUSTOM REQUESTS"],
            ["/admin/pricing", "PRICING"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-2 rounded-full border border-white/15 hover:border-sun hover:text-sun"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  return children;
}

export async function ensureAdmin() {
  const session = await getSession();
  if (!session.userId) redirect("/admin/login");
}
