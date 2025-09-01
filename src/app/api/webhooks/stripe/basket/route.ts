import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/stripe-server";
import { prisma } from "@/lib/prisma";
import { sendMultiItemUserConfirmation, sendMultiItemHotelNotifications } from "@/lib/email/multi-item-emails";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe signature" },
      { status: 400 }
    );
  }

  let event;

  try {
          event = stripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object);
        break;
      
      case "payment_intent.payment_failed":
        await handlePaymentFailure(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  const { basketId, basketReservationId, reservationCode, userEmail } = paymentIntent.metadata;

  if (!basketReservationId) {
    console.log("No basket reservation ID in payment intent metadata");
    return;
  }

  // Get basket reservation with items
  const basketReservation = await prisma.basketReservation.findUnique({
    where: { id: basketReservationId },
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
    console.error("Basket reservation not found:", basketReservationId);
    return;
  }

  // Update basket reservation status
  await prisma.basketReservation.update({
    where: { id: basketReservationId },
    data: { status: "CONFIRMED" },
  });

  // Create individual reservations for each item
  for (const item of basketReservation.basket.items) {
    await prisma.reservation.create({
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
        stripePaymentIntentId: paymentIntent.id,
        basketReservationId: basketReservation.id,
      },
    });
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
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  const { basketReservationId } = paymentIntent.metadata;

  if (basketReservationId) {
    // Update basket reservation status to failed
    await prisma.basketReservation.update({
      where: { id: basketReservationId },
      data: { status: "FAILED" },
    });
  }
}
