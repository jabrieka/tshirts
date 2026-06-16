"use client";

import { useMemo, useState } from "react";
import type { Palette } from "@/lib/palette";

type Variant = {
  id: string;
  size: string;
  color: string;
  colorHex?: string | null;
  priceDelta: number;
  stock?: number | null;
};

type DesignProp = {
  id: string;
  slug: string;
  title: string;
  basePrice: number;
  pickupEnabled: boolean;
  shippingEnabled: boolean;
  stripeEnabled: boolean;
  manualPayEnabled: boolean;
  pickupAddress?: string | null;
  variants: Variant[];
};

export default function OrderForm({
  design,
  palette,
  color: controlledColor,
  onColorChange,
}: {
  design: DesignProp;
  palette: Palette;
  color?: string;
  onColorChange?: (color: string) => void;
}) {
  const sizes = useMemo(() => Array.from(new Set(design.variants.map((v) => v.size))), [design.variants]);
  const colors = useMemo(
    () =>
      Array.from(
        new Map(design.variants.map((v) => [v.color, { name: v.color, hex: v.colorHex }])).values()
      ),
    [design.variants]
  );

  const [size, setSize] = useState<string>(sizes[0] ?? "");
  const [colorState, setColorState] = useState<string>(colors[0]?.name ?? "");
  const color = controlledColor ?? colorState;
  const setColor = onColorChange ?? setColorState;
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<"PICKUP" | "SHIPPING">(
    design.pickupEnabled ? "PICKUP" : "SHIPPING"
  );
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "MANUAL">(
    design.stripeEnabled ? "STRIPE" : "MANUAL"
  );
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; orderId?: string; checkoutUrl?: string } | null>(null);

  const selectedVariant = design.variants.find((v) => v.size === size && v.color === color);
  const unitPrice = design.basePrice + (selectedVariant?.priceDelta ?? 0);
  const subtotal = unitPrice * qty;
  const shippingCost = fulfillment === "SHIPPING" ? 8 : 0;
  const total = subtotal + shippingCost;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designId: design.id,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          fulfillment,
          shippingAddress: fulfillment === "SHIPPING" ? shippingAddress : null,
          notes,
          paymentMethod,
          items: selectedVariant ? [{ variantId: selectedVariant.id, quantity: qty }] : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to place order.");
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setResult({ ok: true, message: "Order received! Check your email for next steps.", orderId: data.orderId });
    } catch (err: any) {
      setResult({ ok: false, message: err.message ?? "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.ok) {
    return (
      <div
        className="card p-6"
        style={{ borderColor: palette.primary, background: `${palette.background}AA`, color: palette.text }}
      >
        <div className="font-display text-3xl" style={{ color: palette.secondary }}>YOU’RE IN.</div>
        <p className="mt-3">{result.message}</p>
        <div className="text-sm opacity-75 mt-2">Order #{result.orderId}</div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card p-6 space-y-5"
      style={{ borderColor: `${palette.primary}88`, background: `${palette.background}CC` }}
    >
      {/* Size */}
      <div>
        <div className="label" style={{ color: palette.secondary }}>SIZE</div>
        <div className="flex flex-wrap gap-2 mt-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className="font-display tracking-widest px-4 py-2 rounded-full border-2"
              style={{
                borderColor: size === s ? palette.primary : `${palette.text}33`,
                background: size === s ? palette.primary : "transparent",
                color: size === s ? palette.text : palette.text,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      {colors.length > 1 && (
        <div>
          <div className="label" style={{ color: palette.secondary }}>COLOR</div>
          <div className="flex flex-wrap gap-3 mt-2">
            {colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c.name)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2"
                style={{
                  borderColor: color === c.name ? palette.primary : `${palette.text}33`,
                  background: color === c.name ? `${palette.primary}33` : "transparent",
                  color: palette.text,
                }}
              >
                <span
                  className="inline-block w-4 h-4 rounded-full border border-white/30"
                  style={{ background: c.hex ?? "#888" }}
                />
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <div className="label" style={{ color: palette.secondary }}>QUANTITY</div>
        <div className="flex items-center gap-3 mt-2">
          <button type="button" className="px-3 py-1 border-2 rounded font-display" style={{ borderColor: palette.text, color: palette.text }} onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            className="input w-24 text-center"
            style={{ color: palette.text, borderColor: `${palette.text}33`, background: palette.background }}
          />
          <button type="button" className="px-3 py-1 border-2 rounded font-display" style={{ borderColor: palette.text, color: palette.text }} onClick={() => setQty(qty + 1)}>+</button>
        </div>
      </div>

      {/* Customer details */}
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <div className="label" style={{ color: palette.secondary }}>FULL NAME</div>
          <input className="input mt-1" required value={name} onChange={(e) => setName(e.target.value)} style={{ color: palette.text, borderColor: `${palette.text}33`, background: palette.background }} />
        </div>
        <div>
          <div className="label" style={{ color: palette.secondary }}>EMAIL</div>
          <input className="input mt-1" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ color: palette.text, borderColor: `${palette.text}33`, background: palette.background }} />
        </div>
        <div className="md:col-span-2">
          <div className="label" style={{ color: palette.secondary }}>PHONE</div>
          <input className="input mt-1" required value={phone} onChange={(e) => setPhone(e.target.value)} style={{ color: palette.text, borderColor: `${palette.text}33`, background: palette.background }} />
        </div>
      </div>

      {/* Fulfillment */}
      <div>
        <div className="label" style={{ color: palette.secondary }}>FULFILLMENT</div>
        <div className="flex flex-wrap gap-2 mt-2">
          {design.pickupEnabled && (
            <button
              type="button"
              onClick={() => setFulfillment("PICKUP")}
              className="font-display tracking-widest px-4 py-2 rounded-full border-2"
              style={{
                borderColor: fulfillment === "PICKUP" ? palette.primary : `${palette.text}33`,
                background: fulfillment === "PICKUP" ? palette.primary : "transparent",
                color: palette.text,
              }}
            >
              PICKUP
            </button>
          )}
          {design.shippingEnabled && (
            <button
              type="button"
              onClick={() => setFulfillment("SHIPPING")}
              className="font-display tracking-widest px-4 py-2 rounded-full border-2"
              style={{
                borderColor: fulfillment === "SHIPPING" ? palette.primary : `${palette.text}33`,
                background: fulfillment === "SHIPPING" ? palette.primary : "transparent",
                color: palette.text,
              }}
            >
              SHIPPING (+$8)
            </button>
          )}
        </div>
        {fulfillment === "PICKUP" && design.pickupAddress && (
          <div className="text-sm opacity-80 mt-2">Pickup at: {design.pickupAddress}</div>
        )}
        {fulfillment === "SHIPPING" && (
          <textarea
            placeholder="Shipping address"
            className="input mt-2"
            rows={3}
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            required
            style={{ color: palette.text, borderColor: `${palette.text}33`, background: palette.background }}
          />
        )}
      </div>

      {/* Notes */}
      <div>
        <div className="label" style={{ color: palette.secondary }}>NOTES (OPTIONAL)</div>
        <textarea className="input mt-1" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} style={{ color: palette.text, borderColor: `${palette.text}33`, background: palette.background }} />
      </div>

      {/* Payment */}
      {(design.stripeEnabled && design.manualPayEnabled) && (
        <div>
          <div className="label" style={{ color: palette.secondary }}>PAYMENT</div>
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("STRIPE")}
              className="font-display tracking-widest px-4 py-2 rounded-full border-2"
              style={{
                borderColor: paymentMethod === "STRIPE" ? palette.primary : `${palette.text}33`,
                background: paymentMethod === "STRIPE" ? palette.primary : "transparent",
                color: palette.text,
              }}
            >
              PAY ONLINE
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("MANUAL")}
              className="font-display tracking-widest px-4 py-2 rounded-full border-2"
              style={{
                borderColor: paymentMethod === "MANUAL" ? palette.primary : `${palette.text}33`,
                background: paymentMethod === "MANUAL" ? palette.primary : "transparent",
                color: palette.text,
              }}
            >
              MANUAL INVOICE
            </button>
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="rounded-xl p-4 border-2" style={{ borderColor: `${palette.text}22`, background: `${palette.background}66` }}>
        <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Shipping</span><span>${shippingCost.toFixed(2)}</span></div>
        <div className="flex justify-between font-display text-2xl mt-2" style={{ color: palette.secondary }}>
          <span>TOTAL</span><span>${total.toFixed(2)}</span>
        </div>
      </div>

      {result && !result.ok && (
        <div className="text-sm" style={{ color: "#FF6B6B" }}>{result.message}</div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-pop w-full"
        style={{
          background: palette.secondary,
          color: palette.background,
          borderColor: palette.background,
          boxShadow: `6px 6px 0 0 ${palette.primary}`,
        }}
      >
        {submitting ? "PROCESSING…" : paymentMethod === "STRIPE" ? "PAY & CONFIRM ORDER" : "SUBMIT ORDER"}
      </button>
    </form>
  );
}
