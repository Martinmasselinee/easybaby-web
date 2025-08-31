import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createShoppingBasket, getBasketByEmail, getBasketBySession } from "@/lib/db";

// Schema for creating a basket
const createBasketSchema = z.object({
  userEmail: z.string().email(),
  sessionId: z.string().optional(),
});

// Schema for getting a basket
const getBasketSchema = z.object({
  userEmail: z.string().email().optional(),
  sessionId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createBasketSchema.parse(body);

    // Check if user already has an active basket
    let existingBasket = null;
    if (validatedData.userEmail) {
      existingBasket = await getBasketByEmail(validatedData.userEmail);
    } else if (validatedData.sessionId) {
      existingBasket = await getBasketBySession(validatedData.sessionId);
    }

    if (existingBasket) {
      return NextResponse.json(existingBasket);
    }

    // Create new basket
    const basket = await createShoppingBasket(
      validatedData.userEmail,
      validatedData.sessionId
    );

    return NextResponse.json(basket, { status: 201 });
  } catch (error) {
    console.error("Error creating basket:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create basket" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("userEmail");
    const sessionId = searchParams.get("sessionId");

    if (!userEmail && !sessionId) {
      return NextResponse.json(
        { error: "userEmail or sessionId is required" },
        { status: 400 }
      );
    }

    let basket = null;
    if (userEmail) {
      basket = await getBasketByEmail(userEmail);
    } else if (sessionId) {
      basket = await getBasketBySession(sessionId);
    }

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
