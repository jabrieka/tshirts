import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, stripeEnabled } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.json();
  const designId = body.designId as string;
  const items = (body.items ?? []) as { variantId: string; quantity: number }[];

  if (!designId || items.length === 0) {
    return NextResponse.json({ error: "Missing design or items." }, { status: 400 });
  }

  const design = await prisma.shirtDesign.findUnique({
    where: { id: designId },
    include: { variants: true, client: true },
  });
  if (!design || !design.publiclyOrderable) {
    return NextResponse.json({ error: "Design unavailable." }, { status: 404 });
  }

  let subtotal = 0;
  const orderItemsData = items.map((it) => {
    const v = design.variants.find((x) => x.id === it.variantId);
    if (!v) throw new Error("Invalid variant");
    const unitPrice = design.basePrice + v.priceDelta;
    subtotal += unitPrice * it.quantity;
    return { variantId: v.id, quantity: it.quantity, unitPrice };
  });

  const fulfillment = body.fulfillment === "SHIPPING" ? "SHIPPING" : "PICKUP";
  const shippingCost = fulfillment === "SHIPPING" ? 8 : 0;
  const total = subtotal + shippingCost;
  const paymentMethod =
    body.paymentMethod === "MANUAL" && design.manualPayEnabled ? "MANUAL" : design.stripeEnabled ? "STRIPE" : "MANUAL";

  const order = await prisma.order.create({
    data: {
      designId,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone ?? null,
      fulfillment,
      shippingAddress: body.shippingAddress ?? null,
      notes: body.notes ?? null,
      subtotal,
      shippingCost,
      total,
      paymentMethod,
      paymentStatus: "UNPAID",
      status: paymentMethod === "MANUAL" ? "INVOICED" : "PENDING",
      items: { create: orderItemsData },
    },
  });

  // Stripe checkout
  if (paymentMethod === "STRIPE" && stripeEnabled && stripe) {
    const variantsMap = Object.fromEntries(design.variants.map((v) => [v.id, v]));
    const line_items = orderItemsData.map((oi) => {
      const v = variantsMap[oi.variantId];
      return {
        quantity: oi.quantity,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(oi.unitPrice * 100),
          product_data: {
            name: `${design.title} — ${v.size}/${v.color}`,
          },
        },
      } as const;
    });
    if (shippingCost > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(shippingCost * 100),
          product_data: { name: "Shipping" },
        },
      } as any);
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      customer_email: body.customerEmail,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/shop/${design.slug}?order=${order.id}&status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/shop/${design.slug}?order=${order.id}&status=cancel`,
      metadata: { orderId: order.id },
    });
    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
    return NextResponse.json({ orderId: order.id, checkoutUrl: session.url });
  }

  return NextResponse.json({ orderId: order.id });
}
