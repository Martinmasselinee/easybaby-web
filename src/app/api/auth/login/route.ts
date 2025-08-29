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

    // Authentification simple pour démo
    // TODO: Remplacer par une vraie authentification avec base de données
    if (email === "admin@easybaby.io" && password === "admin123") {
      return NextResponse.json(
        {
          id: "admin-1",
          email: "admin@easybaby.io",
          role: "ADMIN",
        },
        { status: 200 }
      );
    }

    // Essayer aussi avec la base de données au cas où il y aurait des utilisateurs
    const user = await prisma.adminUser.findFirst({
      where: {
        email: email,
      },
    });

    if (user) {
      const isPasswordValid = await compare(password, user.passwordHash);
      if (isPasswordValid) {
        return NextResponse.json(
          {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      { error: "Identifiants invalides" },
      { status: 401 }
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