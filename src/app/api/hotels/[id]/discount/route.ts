import { NextRequest, NextResponse } from 'next/server';
import { createOrUpdateDiscountCode, getHotelById } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hotelId = params.id;
    const body = await request.json();
    
    // Vérifier si l'hôtel existe
    const hotel = await getHotelById(hotelId);
    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }
    
    // Validation basique
    if (!body.code || !body.kind) {
      return NextResponse.json(
        { error: 'Code and kind are required' },
        { status: 400 }
      );
    }
    
    // Vérifier que le type est valide
    if (!['PLATFORM_70', 'HOTEL_70'].includes(body.kind)) {
      return NextResponse.json(
        { error: 'Kind must be either PLATFORM_70 or HOTEL_70' },
        { status: 400 }
      );
    }
    
    // Créer ou mettre à jour le code de réduction
    const discountCode = await createOrUpdateDiscountCode(hotelId, {
      code: body.code,
      kind: body.kind,
      active: body.active !== false, // Par défaut true si non spécifié
    });
    
    return NextResponse.json(discountCode);
  } catch (error) {
    console.error('Error creating/updating discount code:', error);
    
    // Gérer l'erreur de clé unique (code déjà utilisé)
    if ((error as unknown).code === 'P2002') {
      return NextResponse.json(
        { error: 'This discount code is already used by another hotel' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create/update discount code' },
      { status: 500 }
    );
  }
}
