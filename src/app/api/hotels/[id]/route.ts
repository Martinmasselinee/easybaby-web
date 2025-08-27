import { NextRequest, NextResponse } from 'next/server';
import { getHotelById, updateHotel, deleteHotel } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const hotel = await getHotelById(id);
    
    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(hotel);
  } catch (error) {
    console.error('Error fetching hotel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotel' },
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
    
    // Mettre à jour l'hôtel
    const hotel = await updateHotel(id, {
      name: body.name,
      address: body.address,
      email: body.email,
      phone: body.phone,
      contactName: body.contactName,
      cityId: body.cityId,
    });
    
    return NextResponse.json(hotel);
  } catch (error) {
    console.error('Error updating hotel:', error);
    
    // Gérer l'erreur d'entité non trouvée
    if ((error as unknown).code === 'P2025') {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }
    
    // Gérer l'erreur de clé étrangère (cityId invalide)
    if ((error as unknown).code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid cityId' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update hotel' },
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
    
    // Supprimer l'hôtel
    await deleteHotel(id);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    
    // Gérer l'erreur d'entité non trouvée
    if ((error as unknown).code === 'P2025') {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }
    
    // Gérer l'erreur de contrainte de clé étrangère
    if ((error as unknown).code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete hotel because it has related records' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete hotel' },
      { status: 500 }
    );
  }
}
