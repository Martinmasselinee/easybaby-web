import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkBasketAvailability } from "@/lib/db";

// Schema for checking basket availability
const availabilitySchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    pickupHotelId: z.string(),
    dropHotelId: z.string(),
    pickupDate: z.string().datetime(),
    dropDate: z.string().datetime(),
    quantity: z.number().int().min(1),
  })),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = availabilitySchema.parse(body);

    if (validatedData.items.length === 0) {
      return NextResponse.json({
        available: true,
        conflicts: [],
        availabilityResults: [],
      });
    }

    // Convert string dates to Date objects
    const itemsWithDates = validatedData.items.map(item => ({
      ...item,
      pickupDate: new Date(item.pickupDate),
      dropDate: new Date(item.dropDate),
    }));

    const availabilityCheck = await checkBasketAvailability(itemsWithDates);

    return NextResponse.json(availabilityCheck);
  } catch (error) {
    console.error("Error checking basket availability:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to check basket availability" },
      { status: 500 }
    );
  }
}
