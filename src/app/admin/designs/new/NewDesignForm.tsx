"use client";

import { useState } from "react";
import { uploadToBlob } from "@/lib/client-upload";

const DEFAULT_SIZES = ["S", "M", "L", "XL", "2XL"];
const DEFAULT_COLORS = [
  { name: "Black", hex: "#0B0B12" },
  { name: "Cream", hex: "#FAF5EA" },
];

export default function NewDesignForm({ clients }: { clients: { id: string; name: string }[] }) {
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sizes, setSizes] = useState<string[]>(DEFAULT_SIZES);
  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [newColor, setNewColor] = useState({ name: "", hex: "#000000" });
  const [colorFiles, setColorFiles] = useState<Record<string, File>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("sizes", JSON.stringify(sizes));
      fd.set("colors", JSON.stringify(colors));

      // Upload the main artwork directly to Blob when possible; fall back to
      // sending the raw file in the form (local dev without Blob).
      const artwork = fd.get("artwork");
      if (artwork instanceof File && artwork.size > 0) {
        const url = await uploadToBlob(artwork, "designs");
        if (url) {
          fd.delete("artwork");
          fd.set("artworkUrl", url);
        }
      }

      for (const [name, file] of Object.entries(colorFiles)) {
        if (!colors.some((c) => c.name === name)) continue;
        const url = await uploadToBlob(file, "designs");
        if (url) fd.set(`colorImageUrl:${name}`, url);
        else fd.set(`colorImage:${name}`, file);
      }

      const res = await fetch("/api/designs", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create design.");
      window.location.href = `/admin/designs/${data.id}`;
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="label">TITLE</div>
          <input name="title" required className="input mt-1" />
        </div>
        <div>
          <div className="label">CLIENT (OPTIONAL)</div>
          <select name="clientId" className="input mt-1">
            <option value="">— None —</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <div className="label">BASE PRICE (USD)</div>
          <input name="basePrice" type="number" step="0.01" defaultValue={25} required className="input mt-1" />
        </div>
        <div>
          <div className="label">SHIRT TYPE</div>
          <input name="shirtType" defaultValue="Unisex Tee" className="input mt-1" />
        </div>
        <div>
          <div className="label">ORDER DEADLINE</div>
          <input name="orderDeadline" type="date" className="input mt-1" />
        </div>
        <div>
          <div className="label">PICKUP ADDRESS</div>
          <input name="pickupAddress" placeholder="Optional" className="input mt-1" />
        </div>
      </div>

      <div>
        <div className="label">DESCRIPTION</div>
        <textarea name="description" rows={3} className="input mt-1" />
      </div>

      <div>
        <div className="label">ARTWORK (REQUIRED — PNG/JPG/SVG)</div>
        <input type="file" name="artwork" accept="image/*" required className="input mt-1" />
        <div className="text-xs text-cream/60 mt-1">Palette will be auto-extracted for theming.</div>
      </div>

      <div>
        <div className="label">SIZES</div>
        <div className="flex flex-wrap gap-2 mt-2">
          {DEFAULT_SIZES.concat("3XL", "XS").map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSizes((cur) => cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s])}
              className={`px-3 py-1 rounded-full border-2 font-display tracking-widest ${sizes.includes(s) ? "bg-sun text-ink border-ink" : "border-white/30 text-cream"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="label">COLORS</div>
        <div className="flex flex-wrap gap-2 mt-2">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1 border-2 border-white/20 rounded-full">
              <span className="inline-block w-4 h-4 rounded-full" style={{ background: c.hex }} />
              <span>{c.name}</span>
              <button type="button" className="text-flame" onClick={() => setColors(colors.filter((_, idx) => idx !== i))}>×</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <input placeholder="Color name" className="input" value={newColor.name} onChange={(e) => setNewColor({ ...newColor, name: e.target.value })} />
          <input type="color" className="h-12 w-14 rounded" value={newColor.hex} onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })} />
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              if (!newColor.name) return;
              setColors([...colors, newColor]);
              setNewColor({ name: "", hex: "#000000" });
            }}
          >
            ADD
          </button>
        </div>
      </div>

      <div>
        <div className="label">ARTWORK PER COLOR (OPTIONAL)</div>
        <div className="text-xs text-cream/60 mt-1">
          Upload a PNG for any color that uses a different design. Colors left blank fall back to the main artwork above.
        </div>
        <div className="space-y-2 mt-3">
          {colors.map((c) => (
            <div key={c.name} className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 w-32 shrink-0">
                <span className="inline-block w-4 h-4 rounded-full" style={{ background: c.hex }} />
                <span className="text-sm">{c.name}</span>
              </span>
              <input
                type="file"
                accept="image/*"
                className="input flex-1"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setColorFiles((cur) => {
                    const next = { ...cur };
                    if (file) next[c.name] = file;
                    else delete next[c.name];
                    return next;
                  });
                }}
              />
              {colorFiles[c.name] && <span className="text-lime text-xs">✓</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="publiclyOrderable" defaultChecked /> Publicly orderable
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="pickupEnabled" defaultChecked /> Pickup enabled
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="shippingEnabled" defaultChecked /> Shipping enabled
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="stripeEnabled" defaultChecked /> Stripe checkout
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="manualPayEnabled" defaultChecked /> Manual invoice option
        </label>
      </div>

      {err && <div className="text-flame text-sm">{err}</div>}

      <button type="submit" className="btn-pop" disabled={submitting}>
        {submitting ? "CREATING…" : "CREATE DESIGN"}
      </button>
    </form>
  );
}
