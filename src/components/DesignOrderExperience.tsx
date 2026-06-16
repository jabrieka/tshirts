"use client";

import { useMemo, useState } from "react";
import type { Palette } from "@/lib/palette";
import { formatUsd } from "@/lib/money";
import OrderForm from "./OrderForm";

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
  description?: string | null;
  artworkUrl: string;
  basePrice: number;
  shirtType: string;
  orderDeadline?: string | null;
  pickupEnabled: boolean;
  shippingEnabled: boolean;
  stripeEnabled: boolean;
  manualPayEnabled: boolean;
  pickupAddress?: string | null;
  variants: Variant[];
};

export default function DesignOrderExperience({
  design,
  palette,
  colorImages,
  clientName,
  flyerPng,
  qrPng,
}: {
  design: DesignProp;
  palette: Palette;
  colorImages: Record<string, string>;
  clientName?: string | null;
  flyerPng: string;
  qrPng: string;
}) {
  const colors = useMemo(
    () =>
      Array.from(
        new Map(design.variants.map((v) => [v.color, v.color])).values()
      ),
    [design.variants]
  );
  const [color, setColor] = useState<string>(colors[0] ?? "");
  const previewSrc = colorImages[color] ?? design.artworkUrl;
  const hasColorImages = Object.keys(colorImages).length > 0;
  // When the selected colorway has its own artwork, render the flyer with it too.
  const flyerHref = colorImages[color]
    ? `${flyerPng}?color=${encodeURIComponent(color)}`
    : flyerPng;

  return (
    <div className="grid lg:grid-cols-2 gap-10 mt-6">
      {/* ARTWORK */}
      <div>
        <div
          className="relative rounded-3xl overflow-hidden border-2"
          style={{ borderColor: palette.primary, background: palette.background }}
        >
          <div className="aspect-square relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewSrc} alt={design.title} className="w-full h-full object-contain p-8" />
            <div
              className="absolute inset-0 pointer-events-none mix-blend-screen opacity-50"
              style={{
                background: `radial-gradient(circle at 25% 25%, ${palette.primary} 0%, transparent 55%), radial-gradient(circle at 75% 75%, ${palette.accent} 0%, transparent 55%)`,
              }}
            />
          </div>
        </div>

        {hasColorImages && (
          <div className="text-xs mt-2 opacity-75" style={{ color: palette.secondary }}>
            Showing the <strong>{color}</strong> colorway
          </div>
        )}

        {/* Palette swatches */}
        <div className="mt-6 card p-5" style={{ borderColor: `${palette.primary}55`, background: `${palette.background}AA` }}>
          <div className="text-xs tracking-widest uppercase" style={{ color: palette.secondary }}>
            CAMPAIGN PALETTE — AUTO-EXTRACTED FROM ARTWORK
          </div>
          <div className="flex gap-2 mt-3">
            {[palette.primary, palette.secondary, palette.accent, palette.background, palette.text].map((c) => (
              <div key={c} className="flex-1 text-center">
                <div className="h-10 rounded-md border border-white/10" style={{ background: c }} />
                <div className="text-[10px] tracking-widest mt-1 opacity-75" style={{ color: palette.text }}>{c}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Share / QR / Flyer */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <a
            href={flyerHref}
            target="_blank"
            rel="noreferrer"
            className="card p-4 flex items-center gap-3"
            style={{ borderColor: `${palette.primary}55`, background: `${palette.background}AA` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={flyerHref} alt="Flyer preview" className="w-12 h-16 object-cover rounded" />
            <div>
              <div className="font-display text-lg" style={{ color: palette.text }}>FLYER</div>
              <div className="text-xs opacity-75">Download · Print</div>
            </div>
          </a>
          <a
            href={qrPng}
            target="_blank"
            rel="noreferrer"
            className="card p-4 flex items-center gap-3"
            style={{ borderColor: `${palette.primary}55`, background: `${palette.background}AA` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrPng} alt="QR code" className="w-12 h-12 object-contain rounded bg-white p-0.5" />
            <div>
              <div className="font-display text-lg" style={{ color: palette.text }}>QR CODE</div>
              <div className="text-xs opacity-75">Save · Share</div>
            </div>
          </a>
        </div>
      </div>

      {/* DETAILS + ORDER */}
      <div>
        {clientName && (
          <div className="text-xs tracking-[0.3em] uppercase" style={{ color: palette.secondary }}>
            {clientName} · presents
          </div>
        )}
        <h1
          className="font-display text-5xl md:text-6xl mt-3 leading-[0.95]"
          style={{ color: palette.text }}
        >
          {design.title}
        </h1>
        {design.description && (
          <p className="mt-4 opacity-90 max-w-prose">{design.description}</p>
        )}

        <div className="flex flex-wrap gap-3 mt-5">
          <span
            className="px-4 py-2 rounded-full font-display tracking-widest text-sm"
            style={{ background: palette.secondary, color: palette.background }}
          >
            FROM {formatUsd(design.basePrice)}
          </span>
          <span
            className="px-4 py-2 rounded-full font-display tracking-widest text-sm border"
            style={{ borderColor: palette.primary, color: palette.text }}
          >
            {design.shirtType.toUpperCase()}
          </span>
          {design.orderDeadline && (
            <span
              className="px-4 py-2 rounded-full font-display tracking-widest text-sm"
              style={{ background: palette.primary, color: palette.text }}
            >
              ORDER BY {new Date(design.orderDeadline).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="mt-8">
          <OrderForm
            design={{
              id: design.id,
              slug: design.slug,
              title: design.title,
              basePrice: design.basePrice,
              pickupEnabled: design.pickupEnabled,
              shippingEnabled: design.shippingEnabled,
              stripeEnabled: design.stripeEnabled,
              manualPayEnabled: design.manualPayEnabled,
              pickupAddress: design.pickupAddress,
              variants: design.variants,
            }}
            palette={palette}
            color={color}
            onColorChange={setColor}
          />
        </div>
      </div>
    </div>
  );
}
