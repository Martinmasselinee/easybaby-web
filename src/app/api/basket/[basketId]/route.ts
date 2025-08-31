import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBasketById, updateBasketStatus } from "@/lib/db";

// Schema for updating basket status
const updateBasketSchema = z.object({
  status: z.enum(["ACTIVE", "CONVERTED", "EXPIRED", "ABANDONED"]),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ basketId: string }> }
) {
  try {
    const { basketId } = await params;

    const basket = await getBasketById(basketId);

    if (!basket) {
      return NextResponse.json(
        { error: "Basket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(basket);
  } catch (error) {
    console.error("Error getting basket:", error);
    return NextResponse.json(
      { error: "Failed to get basket" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ basketId: string }> }
) {
  try {
    const { basketId } = await params;
    const body = await request.json();
    const validatedData = updateBasketSchema.parse(body);

    const basket = await updateBasketStatus(basketId, validatedData.status);

    return NextResponse.json(basket);
  } catch (error) {
    console.error("Error updating basket:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update basket" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ basketId: string }> }
) {
  try {
    const { basketId } = await params;

    // Soft delete by setting status to ABANDONED
    const basket = await updateBasketStatus(basketId, "ABANDONED");

    return NextResponse.json({ success: true, basket });
  } catch (error) {
    console.error("Error deleting basket:", error);
    return NextResponse.json(
      { error: "Failed to delete basket" },
      { status: 500 }
    );
  }
}
