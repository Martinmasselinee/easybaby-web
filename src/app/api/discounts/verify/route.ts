import { NextRequest, NextResponse } from "next/server";
import { getDiscountCodeByCode } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Code de réduction manquant" },
        { status: 400 }
      );
    }

    // Vérifier si le code existe dans la base de données
    const discountCode = await getDiscountCodeByCode(code);

    if (!discountCode) {
      return NextResponse.json({ valid: false });
    }

    // Vérifier si le code est actif
    if (!discountCode.active) {
      return NextResponse.json({ valid: false });
    }

    // Retourner les informations du code
    return NextResponse.json({
      valid: true,
      hotelId: discountCode.hotelId,
      kind: discountCode.kind,
      // Pour la V1, appliquer une réduction de 10% (à titre d'exemple)
      discountPercent: 10,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du code de réduction:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification du code" },
      { status: 500 }
    );
  }
}
