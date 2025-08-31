import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createBasketReservation, generateReservationCode } from "@/lib/db";
import { stripe } from "@/lib/stripe/stripe-server";

// Validation schema for checkout request
const checkoutSchema = z.object({
  userEmail: z.string().email(),
  userPhone: z.string().optional(),
  cityId: z.string(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ basketId: string }> }
) {
  try {
    const { basketId } = await params;
    const body = await request.json();
    const { userEmail, userPhone, cityId } = checkoutSchema.parse(body);

    // Get basket with items
    const basket = await prisma.shoppingBasket.findUnique({
      where: { id: basketId },
      include: {
        items: {
          include: {
            product: true,
            pickupHotel: true,
            dropHotel: true,
          },
        },
      },
    });

    if (!basket) {
      return NextResponse.json(
        { error: "Basket not found" },
        { status: 404 }
      );
    }

    if (basket.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Basket is not active" },
        { status: 400 }
      );
    }

    if (basket.items.length === 0) {
      return NextResponse.json(
        { error: "Basket is empty" },
        { status: 400 }
      );
    }

    // Calculate totals
    const totalPriceCents = basket.items.reduce(
      (sum, item) => sum + (item.priceCents * item.quantity),
      0
    );
    const totalDepositCents = basket.items.reduce(
      (sum, item) => sum + (item.depositCents * item.quantity),
      0
    );

    // Generate shared reservation code
    const reservationCode = generateReservationCode();

    // Create basket reservation
    const basketReservation = await createBasketReservation(basketId, {
      userEmail,
      userPhone,
      cityId,
      totalPriceCents,
      totalDepositCents,
      reservationCode,
    });

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPriceCents + totalDepositCents,
      currency: "eur",
      metadata: {
        basketId,
        basketReservationId: basketReservation.id,
        reservationCode,
        userEmail,
      },
    });

    // Update basket reservation with payment intent
    await prisma.basketReservation.update({
      where: { id: basketReservation.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    // Update basket status to CONVERTED
    await prisma.shoppingBasket.update({
      where: { id: basketId },
      data: { status: "CONVERTED" },
    });

    return NextResponse.json({
      success: true,
      basketReservationId: basketReservation.id,
      reservationCode,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      totalPriceCents,
      totalDepositCents,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
