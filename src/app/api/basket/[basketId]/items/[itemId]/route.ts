import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateBasketItem, removeBasketItem, checkBasketAvailability } from "@/lib/db";

// Schema for updating basket item
const updateItemSchema = z.object({
  pickupHotelId: z.string().optional(),
  dropHotelId: z.string().optional(),
  pickupDate: z.string().datetime().optional(),
  dropDate: z.string().datetime().optional(),
  quantity: z.number().int().min(1).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ basketId: string; itemId: string }> }
) {
  try {
    const { basketId, itemId } = await params;
    const body = await request.json();
    const validatedData = updateItemSchema.parse(body);

    // If dates or hotels are being updated, check availability
    if (validatedData.pickupDate || validatedData.dropDate || validatedData.pickupHotelId) {
      // Get current item to check availability
      // This is a simplified check - in production, you'd get the current item first
      const availabilityCheck = await checkBasketAvailability([
        {
          productId: "temp", // Would get from current item
          pickupHotelId: validatedData.pickupHotelId || "temp",
          dropHotelId: validatedData.dropHotelId || "temp",
          pickupDate: validatedData.pickupDate ? new Date(validatedData.pickupDate) : new Date(),
          dropDate: validatedData.dropDate ? new Date(validatedData.dropDate) : new Date(),
          quantity: validatedData.quantity || 1,
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
    }

    // Prepare update data
    const updateData: any = {};
    if (validatedData.pickupHotelId) updateData.pickupHotelId = validatedData.pickupHotelId;
    if (validatedData.dropHotelId) updateData.dropHotelId = validatedData.dropHotelId;
    if (validatedData.pickupDate) updateData.pickupDate = new Date(validatedData.pickupDate);
    if (validatedData.dropDate) updateData.dropDate = new Date(validatedData.dropDate);
    if (validatedData.quantity) updateData.quantity = validatedData.quantity;

    const basketItem = await updateBasketItem(itemId, updateData);

    return NextResponse.json(basketItem);
  } catch (error) {
    console.error("Error updating basket item:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update basket item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ basketId: string; itemId: string }> }
) {
  try {
    const { basketId, itemId } = await params;

    await removeBasketItem(itemId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing basket item:", error);
    return NextResponse.json(
      { error: "Failed to remove basket item" },
      { status: 500 }
    );
  }
}
