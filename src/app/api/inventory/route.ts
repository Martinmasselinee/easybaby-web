import { NextRequest, NextResponse } from 'next/server';
import { getAllInventory, createInventoryItem, updateInventoryItem } from '@/lib/db';

export async function GET() {
  try {
    const inventory = await getAllInventory();
    return NextResponse.json(inventory || []);
  } catch (error: any) {
    console.error('Erreur GET /api/inventory:', error);
    // Retourner un array vide au lieu d'une erreur 500
    return NextResponse.json([]);
  }
}

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
    
    // Créer l'item d'inventaire
    const inventoryItem = await createInventoryItem({
      hotelId: body.hotelId,
      productId: body.productId,
      quantity: body.quantity,
      active: body.active !== undefined ? body.active : true,
    });
    
    return NextResponse.json(inventoryItem, { status: 201 });
  } catch (error: any) {
    console.error('Erreur POST /api/inventory:', error);
    
    // Gérer les erreurs de clé étrangère
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid hotel or product reference' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation basique
    if (!body.id || body.quantity === undefined) {
      return NextResponse.json(
        { error: 'Id and quantity are required' },
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
    
    // Mettre à jour l'item d'inventaire
    const inventoryItem = await updateInventoryItem(body.id, {
      quantity: body.quantity,
      active: body.active,
    });
    
    return NextResponse.json(inventoryItem);
  } catch (error: any) {
    console.error('Erreur PUT /api/inventory:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}