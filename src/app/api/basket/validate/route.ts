import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateBasketItems } from "@/lib/db";

// Schema for validating basket
const validateBasketSchema = z.object({
  basketId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateBasketSchema.parse(body);

    const validationResult = await validateBasketItems(validatedData.basketId);

    if (!validationResult.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: validationResult.error,
          conflicts: validationResult.conflicts,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      valid: true,
      conflicts: validationResult.conflicts || [],
      availabilityResults: validationResult.availabilityResults || [],
    });
  } catch (error) {
    console.error("Error validating basket:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to validate basket" },
      { status: 500 }
    );
  }
}
