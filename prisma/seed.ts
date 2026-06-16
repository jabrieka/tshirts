import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const email = process.env.ADMIN_EMAIL ?? "admin@cosetteproductions.com";
  const password = process.env.ADMIN_PASSWORD ?? "changeMe!";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "Cosette Admin", role: "ADMIN" },
  });

  // Pricing items
  const pricing = [
    { key: "basic_shirt", category: "single", title: "Basic Custom Shirt", description: "Single shirt with your design.", priceLabel: "Starting at $25", priceCents: 2500, sortOrder: 1 },
    { key: "bulk_10_24", category: "bulk", title: "Bulk Order · 10–24 Shirts", description: "Per-shirt price for runs of 10–24.", priceLabel: "Starting at $20 each", priceCents: 2000, sortOrder: 2 },
    { key: "bulk_25_49", category: "bulk", title: "Bulk Order · 25–49 Shirts", description: "Per-shirt price for runs of 25–49.", priceLabel: "Starting at $18 each", priceCents: 1800, sortOrder: 3 },
    { key: "bulk_50_plus", category: "bulk", title: "Bulk Order · 50+ Shirts", description: "Custom quote for runs of 50+.", priceLabel: "Custom Quote", priceCents: 0, sortOrder: 4 },
    { key: "design_setup", category: "design", title: "Design Setup Fee", description: "Prepping a customer-supplied design for print.", priceLabel: "$25–$75", priceCents: 2500, sortOrder: 5 },
    { key: "full_custom_design", category: "design", title: "Full Custom Design Creation", description: "From-scratch design built by Cosette Productions.", priceLabel: "Starting at $75", priceCents: 7500, sortOrder: 6 },
    { key: "rush_fee", category: "extra", title: "Rush Order Fee", description: "Tight turnaround? We move fast.", priceLabel: "$25+", priceCents: 2500, sortOrder: 7 },
    { key: "flyer_qr_package", category: "package", title: "Flyer + QR Order Page Setup", description: "Branded flyer and QR-linked order page for your campaign.", priceLabel: "Starting at $50", priceCents: 5000, sortOrder: 8 },
    { key: "client_campaign", category: "package", title: "Full Client Shirt Campaign Setup", description: "Storefront + flyer + QR + marketing graphics for your launch.", priceLabel: "Starting at $150", priceCents: 15000, sortOrder: 9 },
  ];
  for (const item of pricing) {
    await prisma.pricingItem.upsert({
      where: { key: item.key },
      update: item,
      create: item,
    });
  }

  // Sample clients + designs
  const client1 = await prisma.client.upsert({
    where: { slug: "the-block-block-party" },
    update: {},
    create: {
      name: "The Block Block Party",
      slug: "the-block-block-party",
      email: "hello@theblock.example",
      bio: "A community block party celebrating local artists and food.",
    },
  });

  const client2 = await prisma.client.upsert({
    where: { slug: "sunset-soul-fest" },
    update: {},
    create: {
      name: "Sunset Soul Fest",
      slug: "sunset-soul-fest",
      email: "team@sunsetsoul.example",
      bio: "An annual outdoor music + soul food festival.",
    },
  });

  const designs = [
    {
      slug: "block-party-24",
      title: "Block Party '24",
      description: "Official tee for the 2024 community Block Party — limited run.",
      artworkUrl: "/seed/block-party.svg",
      basePrice: 25,
      clientId: client1.id,
      paletteJson: JSON.stringify({
        primary: "#FF1F6D",
        secondary: "#FFD23F",
        accent: "#3B1FFF",
        background: "#0B0B12",
        text: "#FAF5EA",
      }),
    },
    {
      slug: "sunset-soul-fest-tee",
      title: "Sunset Soul Fest Tour Tee",
      description: "Sunset hues, soulful energy. Festival edition tee.",
      artworkUrl: "/seed/sunset-soul.svg",
      basePrice: 28,
      clientId: client2.id,
      paletteJson: JSON.stringify({
        primary: "#FF5E3A",
        secondary: "#FFD23F",
        accent: "#FF1F6D",
        background: "#1B0B12",
        text: "#FAF5EA",
      }),
    },
    {
      slug: "cosette-staple-tee",
      title: "Cosette Productions Staple Tee",
      description: "The Cosette Productions house tee — bold logo print, premium cotton.",
      artworkUrl: "/seed/cosette-staple.svg",
      basePrice: 30,
      paletteJson: JSON.stringify({
        primary: "#3B1FFF",
        secondary: "#00E0FF",
        accent: "#9DFF00",
        background: "#0B0B12",
        text: "#FAF5EA",
      }),
    },
  ];

  for (const d of designs) {
    const design = await prisma.shirtDesign.upsert({
      where: { slug: d.slug },
      update: {},
      create: d,
    });
    // Variants
    const sizes = ["S", "M", "L", "XL", "2XL"];
    const colors = [
      { name: "Black", hex: "#0B0B12" },
      { name: "Cream", hex: "#FAF5EA" },
    ];
    for (const size of sizes) {
      for (const color of colors) {
        const exists = await prisma.shirtVariant.findFirst({
          where: { designId: design.id, size, color: color.name },
        });
        if (!exists) {
          await prisma.shirtVariant.create({
            data: {
              designId: design.id,
              size,
              color: color.name,
              colorHex: color.hex,
              priceDelta: size === "2XL" ? 3 : 0,
            },
          });
        }
      }
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
