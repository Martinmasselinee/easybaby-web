import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandling } from "@/lib/api-middleware";

async function handleGet(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const productId = params.id;

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      inventory: {
        include: {
          hotel: {
            include: {
              city: true,
            },
          },
        },
        orderBy: [
          { hotel: { name: 'asc' } },
        ],
      },
    },
  });

  if (!product) {
    return NextResponse.json(
      { error: "Produit non trouvé" },
      { status: 404 }
    );
  }

  return NextResponse.json(product);
}

async function handlePut(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const productId = params.id;
  const body = await request.json();

  const { name, description, pricePerHour, pricePerDay, deposit } = body;

  const updatedProduct = await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      name,
      description,
      pricePerHour: parseInt(pricePerHour),
      pricePerDay: parseInt(pricePerDay),
      deposit: parseInt(deposit),
    },
  });

  return NextResponse.json(updatedProduct);
}

async function handleDelete(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const productId = params.id;

  // First delete all related inventory items
  await prisma.inventoryItem.deleteMany({
    where: {
      productId: productId,
    },
  });

  // Then delete the product
  await prisma.product.delete({
    where: {
      id: productId,
    },
  });

  return NextResponse.json({ success: true });
}

export const GET = withErrorHandling(handleGet);
export const PUT = withErrorHandling(handlePut);
export const DELETE = withErrorHandling(handleDelete);