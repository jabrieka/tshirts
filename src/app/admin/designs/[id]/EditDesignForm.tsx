"use client";

import { useState } from "react";
import type { Palette } from "@/lib/palette";
import { uploadToBlob } from "@/lib/client-upload";

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

  const ALL_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
  const [vSizes, setVSizes] = useState<string[]>(
    Array.from(new Set(variants.filter((v) => v.active).map((v) => v.size)))
  );
  const [vColors, setVColors] = useState<{ name: string; hex: string }[]>(
    colors.map((c) => ({ name: c.name, hex: c.hex ?? "#000000" }))
  );
  const [newVColor, setNewVColor] = useState({ name: "", hex: "#000000" });
  const [savingVariants, setSavingVariants] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);

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

  async function uploadColorImage(color: string, file: File) {
    const fd = new FormData();
    // Upload directly to Blob when available (avoids the 4.5 MB function limit);
    // otherwise send the raw file for the local filesystem fallback.
    const url = await uploadToBlob(file, "designs");
    if (url) fd.set(`colorImageUrl:${color}`, url);
    else fd.set(`colorImage:${color}`, file);
    return postColorImages(fd, color);
  }

  function removeColorImage(color: string) {
    const fd = new FormData();
    fd.set("remove", color);
    return postColorImages(fd, color);
  }

  async function saveVariants() {
    setSavingVariants(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/designs/${design.id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sizes: vSizes, colors: vColors }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Failed to save variants.");
      window.location.reload();
    } catch (e: any) {
      setErr(e.message);
      setSavingVariants(false);
    }
  }

  async function changePrimaryPhoto(file: File) {
    setPhotoBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const url = await uploadToBlob(file, "designs");
      if (!url) throw new Error("Image upload needs Blob storage (available in production).");
      const res = await fetch(`/api/designs/${design.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...d, orderDeadline: d.orderDeadline || null, artworkUrl: url }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Failed to update photo.");
      }
      window.location.reload();
    } catch (e: any) {
      setErr(e.message);
      setPhotoBusy(false);
    }
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
        <div className="label">PRIMARY PHOTO</div>
        <div className="text-xs text-cream/60 mt-1">Replacing the artwork re-themes the palette, flyer, and QR.</div>
        <div className="flex items-center gap-3 mt-2">
          <input
            type="file"
            accept="image/*"
            className="input flex-1"
            disabled={photoBusy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) changePrimaryPhoto(f);
              e.target.value = "";
            }}
          />
          {photoBusy && <span className="text-xs text-cream/60">Uploading…</span>}
        </div>
      </div>

      <div>
        <div className="label">SIZES</div>
        <div className="flex flex-wrap gap-2 mt-2">
          {ALL_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setVSizes((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))}
              className={`px-3 py-1 rounded-full border-2 font-display tracking-widest ${vSizes.includes(s) ? "bg-sun text-ink border-ink" : "border-white/30 text-cream"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="label">COLORS</div>
        <div className="flex flex-wrap gap-2 mt-2">
          {vColors.map((c, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1 border-2 border-white/20 rounded-full">
              <span className="inline-block w-4 h-4 rounded-full" style={{ background: c.hex }} />
              <span>{c.name}</span>
              <button type="button" className="text-flame" onClick={() => setVColors(vColors.filter((_, idx) => idx !== i))}>×</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <input placeholder="Color name" className="input" value={newVColor.name} onChange={(e) => setNewVColor({ ...newVColor, name: e.target.value })} />
          <input type="color" className="h-12 w-14 rounded" value={newVColor.hex} onChange={(e) => setNewVColor({ ...newVColor, hex: e.target.value })} />
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              if (!newVColor.name) return;
              if (vColors.some((c) => c.name.toLowerCase() === newVColor.name.toLowerCase())) return;
              setVColors([...vColors, newVColor]);
              setNewVColor({ name: "", hex: "#000000" });
            }}
          >
            ADD
          </button>
        </div>
        <div className="text-xs text-cream/60 mt-2">
          {variants.length} variant{variants.length === 1 ? "" : "s"} now. Saving creates every size × color combo; removed combos with existing orders are deactivated (not deleted) to keep order history.
        </div>
        <button type="button" onClick={saveVariants} disabled={savingVariants} className="btn-ghost mt-3">
          {savingVariants ? "SAVING…" : "SAVE SIZES & COLORS"}
        </button>
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
