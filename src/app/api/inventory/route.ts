import { NextRequest, NextResponse } from 'next/server';
import { createOrUpdateInventoryItem, getHotelById, getProductById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation basique
    if (!body.hotelId || !body.productId || body.quantity === undefined) {
      return NextResponse.json(
        { error: 'HotelId, productId, and quantity are required' },
        { status: 400 }
      );
    }
    
    // Vérifier que la quantité est un nombre positif
    if (body.quantity < 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive number' },
        { status: 400 }
      );
    }
    
    // Vérifier que l'hôtel existe
    const hotel = await getHotelById(body.hotelId);
    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }
    
    // Vérifier que le produit existe
    const product = await getProductById(body.productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Créer ou mettre à jour l'élément d'inventaire
    const inventoryItem = await createOrUpdateInventoryItem(
      body.hotelId,
      body.productId,
      body.quantity
    );
    
    return NextResponse.json(inventoryItem, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to create/update inventory item' },
      { status: 500 }
    );
  }
}
