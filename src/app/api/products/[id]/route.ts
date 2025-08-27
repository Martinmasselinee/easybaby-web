import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const product = await getProductById(id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Validation basique
    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: 'At least one field is required' },
        { status: 400 }
      );
    }
    
    // Vérifier que les prix sont des nombres positifs s'ils sont fournis
    if ((body.pricePerHour !== undefined && body.pricePerHour < 0) || 
        (body.pricePerDay !== undefined && body.pricePerDay < 0) || 
        (body.deposit !== undefined && body.deposit < 0)) {
      return NextResponse.json(
        { error: 'Prices and deposit must be positive numbers' },
        { status: 400 }
      );
    }
    
    // Mettre à jour le produit
    const product = await updateProduct(id, {
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
      pricePerHour: body.pricePerHour,
      pricePerDay: body.pricePerDay,
      deposit: body.deposit,
    });
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    
    // Gérer l'erreur d'entité non trouvée
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update product' },
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
    
    // Supprimer le produit
    await deleteProduct(id);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting product:', error);
    
    // Gérer l'erreur d'entité non trouvée
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Gérer l'erreur de contrainte de clé étrangère
    if ((error as any).code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete product because it has related records' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
