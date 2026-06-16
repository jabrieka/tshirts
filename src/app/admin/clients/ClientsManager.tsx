"use client";

import { useState } from "react";

type Row = { id: string; name: string; email: string | null; designsCount: number };

export default function ClientsManager({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function addClient(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const j = await res.json();
    if (!res.ok) return setErr(j.error ?? "Failed");
    setRows([{ id: j.id, name, email, designsCount: 0 }, ...rows]);
    setName(""); setEmail("");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addClient} className="card p-5 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <div className="label">CLIENT NAME</div>
          <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="label">EMAIL</div>
          <input className="input mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button type="submit" className="btn-pop">+ ADD CLIENT</button>
        {err && <div className="text-flame text-sm w-full">{err}</div>}
      </form>

      <div className="card overflow-x-auto">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Designs</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={3} className="text-cream/60">No clients yet.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.email ?? "—"}</td>
                <td>{r.designsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
