import { NextRequest, NextResponse } from 'next/server';
import { deleteInventoryItem, updateInventoryItem } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { quantity } = body;
    
    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { error: 'Invalid quantity. Must be a non-negative number.' },
        { status: 400 }
      );
    }
    
    // Mettre à jour la quantité de l'élément d'inventaire
    const updatedItem = await updateInventoryItem(id, { quantity });
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    
    // Gérer l'erreur d'entité non trouvée
    if ((error as unknown).code === 'P2025') {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Supprimer l'élément d'inventaire
    await deleteInventoryItem(id);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    
    // Gérer l'erreur d'entité non trouvée
    if ((error as unknown).code === 'P2025') {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }
    
    // Gérer l'erreur de contrainte de clé étrangère
    if ((error as unknown).code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete inventory item because it has related records' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}
