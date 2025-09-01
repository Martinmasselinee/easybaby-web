import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createBasketReservation, generateReservationCode } from "@/lib/db";
import { stripe } from "@/lib/stripe/stripe-server";

// Validation schema for checkout request
const checkoutSchema = z.object({
  userEmail: z.string().email(),
  userPhone: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ basketId: string }> }
) {
  try {
    const { basketId } = await params;
    const body = await request.json();
    
    console.log('Checkout request for basket:', basketId);
    console.log('Checkout request body:', body);
    
    const { userEmail, userPhone } = checkoutSchema.parse(body);

    console.log('Validated checkout data:', { userEmail, userPhone });

    // Get basket with items
    const basket = await prisma.shoppingBasket.findUnique({
      where: { id: basketId },
      include: {
        items: {
          include: {
            product: true,
            pickupHotel: {
              include: {
                city: true,
              },
            },
            dropHotel: {
              include: {
                city: true,
              },
            },
          },
        },
      },
    });

    console.log('Found basket:', basket ? { id: basket.id, itemCount: basket.items.length } : null);

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

    // Get city ID from the first item's pickup hotel
    const cityId = basket.items[0].pickupHotel.cityId;
    console.log('Using city ID from basket:', cityId);

    // Calculate totals
    const totalPriceCents = basket.items.reduce(
      (sum, item) => sum + (item.priceCents * item.quantity),
      0
    );
    const totalDepositCents = basket.items.reduce(
      (sum, item) => sum + (item.depositCents * item.quantity),
      0
    );

    console.log('Calculated totals:', { totalPriceCents, totalDepositCents });

    // Generate shared reservation code
    const reservationCode = generateReservationCode();

    console.log('Generated reservation code:', reservationCode);

    // Create basket reservation
    const basketReservation = await createBasketReservation(basketId, {
      userEmail,
      userPhone,
      cityId,
      totalPriceCents,
      totalDepositCents,
      reservationCode,
    });

    console.log('Created basket reservation:', basketReservation.id);

    // Verify Stripe is available
    if (!stripe) {
      throw new Error('Stripe is not initialized');
    }

    // Create Stripe Payment Intent
    let paymentIntent;
    try {
      console.log('Creating Stripe payment intent with amount:', totalPriceCents + totalDepositCents);
      paymentIntent = await stripe().paymentIntents.create({
        amount: totalPriceCents + totalDepositCents,
        currency: "eur",
        metadata: {
          basketId,
          basketReservationId: basketReservation.id,
          reservationCode,
          userEmail,
        },
      });
      console.log('Created payment intent:', paymentIntent.id);
    } catch (stripeError) {
      console.error('Stripe payment intent creation failed:', stripeError);
      throw stripeError;
    }

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
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
