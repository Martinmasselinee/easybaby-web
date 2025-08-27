import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// Initialisation directe dans la route
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Utilisation de findFirst au lieu de findUnique pour éviter les erreurs potentielles
    const user = await prisma.adminUser.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    const isPasswordValid = await compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur de connexion:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

// Répondre aux requêtes GET avec un message d'erreur approprié
export async function GET() {
  return NextResponse.json(
    { error: "Méthode non autorisée" },
    { status: 405 }
  );
}