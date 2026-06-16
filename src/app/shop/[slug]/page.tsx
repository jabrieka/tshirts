import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { safeParsePalette } from "@/lib/palette";
import DesignOrderExperience from "@/components/DesignOrderExperience";

export const dynamic = "force-dynamic";

export default async function DesignOrderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const design = await prisma.shirtDesign.findUnique({
    where: { slug },
    include: { client: true, variants: { where: { active: true } } },
  });

  if (!design || !design.publiclyOrderable) notFound();

  const palette = safeParsePalette(design.paletteJson);
  let colorImages: Record<string, string> = {};
  try {
    colorImages = design.colorImagesJson ? JSON.parse(design.colorImagesJson) : {};
  } catch {}
  const qrPng = `/api/qr/${design.id}`;
  const flyerPng = `/api/flyer/${design.id}`;

  return (
    <div
      className="min-h-screen"
      style={{
        // Dynamic theming from artwork palette
        background: `linear-gradient(160deg, ${palette.background} 0%, ${palette.accent}33 60%, ${palette.background} 100%)`,
        color: palette.text,
        // CSS vars for child elements
        ["--p" as any]: palette.primary,
        ["--s" as any]: palette.secondary,
        ["--a" as any]: palette.accent,
      }}
    >
      <div className="max-w-7xl mx-auto px-5 pt-10 pb-20">
        {design.client && (
          <Link
            href="/shop"
            className="inline-flex items-center text-xs tracking-widest uppercase opacity-75 hover:opacity-100"
            style={{ color: palette.secondary }}
          >
            ← All Drops
          </Link>
        )}

        <DesignOrderExperience
          design={{
            id: design.id,
            slug: design.slug,
            title: design.title,
            description: design.description,
            artworkUrl: design.artworkUrl,
            basePrice: design.basePrice,
            shirtType: design.shirtType,
            orderDeadline: design.orderDeadline ? design.orderDeadline.toISOString() : null,
            pickupEnabled: design.pickupEnabled,
            shippingEnabled: design.shippingEnabled,
            stripeEnabled: design.stripeEnabled,
            manualPayEnabled: design.manualPayEnabled,
            pickupAddress: design.pickupAddress,
            variants: design.variants.map((v) => ({
              id: v.id,
              size: v.size,
              color: v.color,
              colorHex: v.colorHex,
              priceDelta: v.priceDelta,
              stock: v.stock,
            })),
          }}
          palette={palette}
          colorImages={colorImages}
          clientName={design.client?.name ?? null}
          flyerPng={flyerPng}
          qrPng={qrPng}
        />
      </div>
    </div>
  );
}
