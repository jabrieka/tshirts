"use client";

import { useState } from "react";
import type { Palette } from "@/lib/palette";

type DesignFields = {
  id: string;
  title: string;
  description: string | null;
  basePrice: number;
  shirtType: string;
  orderDeadline: string; // yyyy-mm-dd
  pickupAddress: string | null;
  publiclyOrderable: boolean;
  pickupEnabled: boolean;
  shippingEnabled: boolean;
  stripeEnabled: boolean;
  manualPayEnabled: boolean;
};

type Variant = {
  id: string;
  size: string;
  color: string;
  colorHex: string | null;
  priceDelta: number;
  active: boolean;
};

export default function EditDesignForm({
  design,
  variants,
  colors,
  colorImages: initialColorImages,
  palette,
}: {
  design: DesignFields;
  variants: Variant[];
  colors: { name: string; hex: string | null }[];
  colorImages: Record<string, string>;
  palette: Palette;
}) {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [d, setD] = useState(design);
  const [colorImages, setColorImages] = useState<Record<string, string>>(initialColorImages);
  const [busyColor, setBusyColor] = useState<string | null>(null);

  async function postColorImages(fd: FormData, color: string) {
    setBusyColor(color);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/designs/${design.id}/color-images`, { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Failed to update artwork.");
      setColorImages(j.colorImages ?? {});
      setMsg("Per-color artwork updated.");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusyColor(null);
    }
  }

  function uploadColorImage(color: string, file: File) {
    const fd = new FormData();
    fd.set(`colorImage:${color}`, file);
    return postColorImages(fd, color);
  }

  function removeColorImage(color: string) {
    const fd = new FormData();
    fd.set("remove", color);
    return postColorImages(fd, color);
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/designs/${design.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...d, orderDeadline: d.orderDeadline || null }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Failed");
      setMsg("Saved.");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm("Delete this design and its variants? Orders are kept but unlinked.")) return;
    const res = await fetch(`/api/designs/${design.id}`, { method: "DELETE" });
    if (res.ok) window.location.href = "/admin/designs";
    else setErr("Failed to delete.");
  }

  return (
    <form onSubmit={onSave} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <div className="label">TITLE</div>
          <input className="input mt-1" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} required />
        </div>
        <div>
          <div className="label">BASE PRICE</div>
          <input className="input mt-1" type="number" step="0.01" value={d.basePrice} onChange={(e) => setD({ ...d, basePrice: parseFloat(e.target.value) || 0 })} />
        </div>
        <div>
          <div className="label">SHIRT TYPE</div>
          <input className="input mt-1" value={d.shirtType} onChange={(e) => setD({ ...d, shirtType: e.target.value })} />
        </div>
        <div>
          <div className="label">ORDER DEADLINE</div>
          <input className="input mt-1" type="date" value={d.orderDeadline} onChange={(e) => setD({ ...d, orderDeadline: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <div className="label">DESCRIPTION</div>
          <textarea className="input mt-1" rows={3} value={d.description ?? ""} onChange={(e) => setD({ ...d, description: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <div className="label">PICKUP ADDRESS</div>
          <input className="input mt-1" value={d.pickupAddress ?? ""} onChange={(e) => setD({ ...d, pickupAddress: e.target.value })} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-2 text-sm">
        {([
          ["publiclyOrderable", "Publicly orderable"],
          ["pickupEnabled", "Pickup enabled"],
          ["shippingEnabled", "Shipping enabled"],
          ["stripeEnabled", "Stripe checkout"],
          ["manualPayEnabled", "Manual invoice option"],
        ] as const).map(([k, label]) => (
          <label key={k} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={(d as any)[k]}
              onChange={(e) => setD({ ...d, [k]: e.target.checked } as any)}
            />
            {label}
          </label>
        ))}
      </div>

      <div>
        <div className="label">VARIANTS ({variants.length})</div>
        <div className="grid md:grid-cols-2 gap-2 mt-2 text-sm">
          {variants.map((v) => (
            <div key={v.id} className="flex items-center justify-between border border-white/10 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: v.colorHex ?? "#888" }} />
                <span>{v.size} · {v.color}</span>
              </div>
              <span className="text-cream/70">+${v.priceDelta.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-cream/60 mt-2">Variant editing UI can be expanded — variants are also auto-created from the New Design form.</div>
      </div>

      <div>
        <div className="label">ARTWORK PER COLOR</div>
        <div className="text-xs text-cream/60 mt-1">
          Upload a PNG for any color that uses a different design. Colors left blank fall back to the main artwork.
        </div>
        <div className="space-y-2 mt-3">
          {colors.length === 0 && (
            <div className="text-xs text-cream/60">No colors on this design yet.</div>
          )}
          {colors.map((c) => {
            const current = colorImages[c.name];
            const busy = busyColor === c.name;
            return (
              <div key={c.name} className="flex items-center gap-3 border border-white/10 rounded-lg px-3 py-2">
                <span className="inline-flex items-center gap-2 w-28 shrink-0">
                  <span className="inline-block w-4 h-4 rounded-full" style={{ background: c.hex ?? "#888" }} />
                  <span className="text-sm">{c.name}</span>
                </span>
                {current ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={current} alt={`${c.name} artwork`} className="w-10 h-10 object-contain rounded bg-white/5" />
                ) : (
                  <span className="text-xs text-cream/50 w-10 text-center">—</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="input flex-1"
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadColorImage(c.name, file);
                    e.target.value = "";
                  }}
                />
                {current && (
                  <button
                    type="button"
                    className="text-flame text-sm"
                    disabled={busy}
                    onClick={() => removeColorImage(c.name)}
                  >
                    Remove
                  </button>
                )}
                {busy && <span className="text-xs text-cream/60">…</span>}
              </div>
            );
          })}
        </div>
      </div>

      {err && <div className="text-flame text-sm">{err}</div>}
      {msg && <div className="text-lime text-sm">{msg}</div>}

      <div className="flex gap-3">
        <button type="submit" className="btn-pop" style={{ background: palette.secondary, color: palette.background, borderColor: palette.background, boxShadow: `6px 6px 0 0 ${palette.primary}` }} disabled={saving}>
          {saving ? "SAVING…" : "SAVE CHANGES"}
        </button>
        <button type="button" onClick={onDelete} className="btn-ghost border-flame text-flame">DELETE</button>
      </div>
    </form>
  );
}
