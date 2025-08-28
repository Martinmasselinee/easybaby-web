import { NextRequest, NextResponse } from 'next/server';
import { getHotelById, updateHotel, deleteHotel } from '@/lib/db';
import { withErrorHandling } from '@/lib/api-middleware';

async function handleGet(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const hotel = await getHotelById(id);
  
  if (!hotel) {
    return NextResponse.json(
      { error: 'Hotel not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(hotel);
}

export const GET = withErrorHandling(handleGet);

async function handlePut(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
}

export const PUT = withErrorHandling(handlePut);

async function handleDelete(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Supprimer l'hôtel
  await deleteHotel(id);
  
  return new NextResponse(null, { status: 204 });
}

export const DELETE = withErrorHandling(handleDelete);
