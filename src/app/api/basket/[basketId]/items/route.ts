import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addItemToBasket, getBasketItems, checkBasketAvailability, getProductById } from "@/lib/db";

// Schema for adding item to basket
const addItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  pickupHotelId: z.string().min(1, "Pickup hotel ID is required"),
  dropHotelId: z.string().min(1, "Drop hotel ID is required"),
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
    
    console.log('Received basket item data:', body);
    
    const validatedData = addItemSchema.parse(body);

    console.log('Validated data:', validatedData);

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

    // Get product details to calculate correct price and deposit
    const product = await getProductById(validatedData.productId);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Calculate duration in days
    const startDate = new Date(validatedData.pickupDate);
    const endDate = new Date(validatedData.dropDate);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    // Calculate total price for the duration
    const totalPriceCents = product.pricePerDay * durationDays * validatedData.quantity;
    const totalDepositCents = product.deposit * validatedData.quantity;

    console.log('Calculated prices:', {
      productPricePerDay: product.pricePerDay,
      durationDays,
      quantity: validatedData.quantity,
      totalPriceCents,
      totalDepositCents
    });

    const basketItem = await addItemToBasket(basketId, {
      productId: validatedData.productId,
      pickupHotelId: validatedData.pickupHotelId,
      dropHotelId: validatedData.dropHotelId,
      pickupDate: new Date(validatedData.pickupDate),
      dropDate: new Date(validatedData.dropDate),
      quantity: validatedData.quantity,
      priceCents: totalPriceCents,
      depositCents: totalDepositCents,
    });

    console.log('Created basket item:', basketItem);

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
