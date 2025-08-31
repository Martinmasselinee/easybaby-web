import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addItemToBasket, getBasketItems, checkBasketAvailability } from "@/lib/db";

// Schema for adding item to basket
const addItemSchema = z.object({
  productId: z.string(),
  pickupHotelId: z.string(),
  dropHotelId: z.string(),
  pickupDate: z.string().datetime(),
  dropDate: z.string().datetime(),
  quantity: z.number().int().min(1).default(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ basketId: string }> }
) {
  try {
    const { basketId } = await params;
    const body = await request.json();
    const validatedData = addItemSchema.parse(body);

    // Check availability before adding to basket
    const availabilityCheck = await checkBasketAvailability([
      {
        productId: validatedData.productId,
        pickupHotelId: validatedData.pickupHotelId,
        dropHotelId: validatedData.dropHotelId,
        pickupDate: new Date(validatedData.pickupDate),
        dropDate: new Date(validatedData.dropDate),
        quantity: validatedData.quantity,
      },
    ]);

    if (!availabilityCheck.available) {
      return NextResponse.json(
        { 
          error: "Product not available for selected dates",
          conflicts: availabilityCheck.conflicts,
        },
        { status: 409 }
      );
    }

    // Calculate price and deposit (simplified - should get from product)
    const priceCents = 5000; // 50€ default
    const depositCents = 2000; // 20€ default

    const basketItem = await addItemToBasket(basketId, {
      productId: validatedData.productId,
      pickupHotelId: validatedData.pickupHotelId,
      dropHotelId: validatedData.dropHotelId,
      pickupDate: new Date(validatedData.pickupDate),
      dropDate: new Date(validatedData.dropDate),
      quantity: validatedData.quantity,
      priceCents: priceCents * validatedData.quantity,
      depositCents: depositCents * validatedData.quantity,
    });

    return NextResponse.json(basketItem, { status: 201 });
  } catch (error) {
    console.error("Error adding item to basket:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add item to basket" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ basketId: string }> }
) {
  try {
    const { basketId } = await params;

    const items = await getBasketItems(basketId);

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error getting basket items:", error);
    return NextResponse.json(
      { error: "Failed to get basket items" },
      { status: 500 }
    );
  }
}
