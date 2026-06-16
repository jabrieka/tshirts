"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Invalid login.");
      }
      window.location.href = "/admin";
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <form onSubmit={onSubmit} className="card p-8 w-full max-w-md">
        <div className="font-display text-4xl tracking-wider">
          <span className="text-cream">COSETTE</span>{" "}
          <span className="text-sun">ADMIN</span>
        </div>
        <p className="text-cream/70 mt-2">Log in to manage designs, orders, and campaigns.</p>

        <div className="mt-6 space-y-4">
          <div>
            <div className="label">EMAIL</div>
            <input className="input mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <div className="label">PASSWORD</div>
            <input className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {err && <div className="text-flame text-sm">{err}</div>}
          <button type="submit" disabled={submitting} className="btn-pop w-full">
            {submitting ? "…" : "LOG IN"}
          </button>
        </div>
      </form>
    </div>
  );
}
