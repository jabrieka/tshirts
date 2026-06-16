"use client";

import { useState } from "react";

type Row = {
  id: string;
  key: string;
  category: string;
  title: string;
  description: string;
  priceLabel: string;
  priceCents: number;
  sortOrder: number;
  active: boolean;
};

const CATEGORIES = ["single", "bulk", "design", "extra", "package"];

export default function PricingEditor({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [savingId, setSavingId] = useState<string | null>(null);

  function update(id: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function save(row: Row) {
    setSavingId(row.id);
    await fetch(`/api/pricing/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    setSavingId(null);
  }

  async function addNew() {
    const res = await fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: `item_${Date.now()}`,
        category: "extra",
        title: "New Item",
        description: "",
        priceLabel: "Starting at $0",
        priceCents: 0,
        sortOrder: rows.length + 1,
      }),
    });
    const j = await res.json();
    if (res.ok) setRows([...rows, j]);
  }

  async function remove(id: string) {
    if (!confirm("Delete this pricing item?")) return;
    const res = await fetch(`/api/pricing/${id}`, { method: "DELETE" });
    if (res.ok) setRows(rows.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="card p-4 grid md:grid-cols-12 gap-2 items-center">
          <select className="input md:col-span-2" value={r.category} onChange={(e) => update(r.id, { category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input className="input md:col-span-3" value={r.title} onChange={(e) => update(r.id, { title: e.target.value })} />
          <input className="input md:col-span-3" placeholder="Description" value={r.description} onChange={(e) => update(r.id, { description: e.target.value })} />
          <input className="input md:col-span-2" value={r.priceLabel} onChange={(e) => update(r.id, { priceLabel: e.target.value })} />
          <input className="input md:col-span-1" type="number" value={r.sortOrder} onChange={(e) => update(r.id, { sortOrder: parseInt(e.target.value) || 0 })} />
          <div className="md:col-span-1 flex gap-1">
            <button type="button" className="btn-ghost text-xs px-2 py-1" onClick={() => save(r)} disabled={savingId === r.id}>{savingId === r.id ? "…" : "SAVE"}</button>
            <button type="button" className="btn-ghost text-xs px-2 py-1 border-flame text-flame" onClick={() => remove(r.id)}>✕</button>
          </div>
        </div>
      ))}
      <button type="button" className="btn-pop" onClick={addNew}>+ NEW ITEM</button>
    </div>
  );
}
