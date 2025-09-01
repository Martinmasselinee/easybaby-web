import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/stripe-server";
import { sendMultiItemUserConfirmation, sendMultiItemHotelNotifications } from "@/lib/email/multi-item-emails";

// Validation schema for payment confirmation
const paymentConfirmationSchema = z.object({
  paymentIntentId: z.string(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ basketId: string }> }
) {
  try {
    const { basketId } = await params;
    const body = await request.json();
    const { paymentIntentId } = paymentConfirmationSchema.parse(body);

    // Get basket reservation
    const basketReservation = await prisma.basketReservation.findFirst({
      where: { 
        basketId,
        stripePaymentIntentId: paymentIntentId 
      },
      include: {
        basket: {
          include: {
            items: {
              include: {
                product: true,
                pickupHotel: true,
                dropHotel: true,
              },
            },
          },
        },
        city: true,
      },
    });

    if (!basketReservation) {
      return NextResponse.json(
        { error: "Basket reservation not found" },
        { status: 404 }
      );
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe().paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Update basket reservation status
    await prisma.basketReservation.update({
      where: { id: basketReservation.id },
      data: { status: "CONFIRMED" },
    });

    // Create individual reservations for each item
    const reservations = [];
    for (const item of basketReservation.basket.items) {
      const reservation = await prisma.reservation.create({
        data: {
          productId: item.productId,
          pickupHotelId: item.pickupHotelId,
          dropHotelId: item.dropHotelId,
          pickupDate: item.pickupDate,
          dropDate: item.dropDate,
          quantity: item.quantity,
          rentalPrice: item.priceCents,
          deposit: item.depositCents,
          userEmail: basketReservation.userEmail,
          userPhone: basketReservation.userPhone,
          status: "CONFIRMED",
          stripePaymentIntentId: paymentIntentId,
          basketReservationId: basketReservation.id,
        },
        include: {
          product: true,
          pickupHotel: true,
          dropHotel: true,
        },
      });
      reservations.push(reservation);
    }

    // Send confirmation emails
    try {
      await sendMultiItemUserConfirmation({
        userEmail: basketReservation.userEmail,
        reservationCode: basketReservation.reservationCode,
        cityName: basketReservation.city.name,
        items: basketReservation.basket.items.map(item => ({
          productName: item.product.name,
          pickupHotelName: item.pickupHotel.name,
          dropHotelName: item.dropHotel.name,
          pickupDate: item.pickupDate,
          dropDate: item.dropDate,
          quantity: item.quantity,
          priceCents: item.priceCents,
          depositCents: item.depositCents,
        })),
        totalPriceCents: basketReservation.totalPriceCents,
        totalDepositCents: basketReservation.totalDepositCents,
      });

      await sendMultiItemHotelNotifications({
        basketReservationId: basketReservation.id,
        reservationCode: basketReservation.reservationCode,
        userEmail: basketReservation.userEmail,
        userPhone: basketReservation.userPhone,
        cityName: basketReservation.city.name,
        items: basketReservation.basket.items,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the entire process if emails fail
    }

    return NextResponse.json({
      success: true,
      reservationCode: basketReservation.reservationCode,
      reservationsCount: reservations.length,
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
