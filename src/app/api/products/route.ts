import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, createProduct } from '@/lib/db';
import { invalidateProductsCache } from '@/lib/cache';

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation basique
    if (!body.name || body.pricePerHour === undefined || body.pricePerDay === undefined || body.deposit === undefined) {
      return NextResponse.json(
        { error: 'Name, pricePerHour, pricePerDay, and deposit are required' },
        { status: 400 }
      );
    }
    
    // Vérifier que les prix sont des nombres positifs
    if (body.pricePerHour < 0 || body.pricePerDay < 0 || body.deposit < 0) {
      return NextResponse.json(
        { error: 'Prices and deposit must be positive numbers' },
        { status: 400 }
      );
    }
    
    // Créer le produit
    const product = await createProduct({
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
      pricePerHour: body.pricePerHour,
      pricePerDay: body.pricePerDay,
      deposit: body.deposit,
    });
    
    // Invalider le cache des produits
    invalidateProductsCache(product.id);
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
