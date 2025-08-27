import { NextRequest, NextResponse } from 'next/server';
import { getReservationById, updateReservationStatus } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const reservation = await getReservationById(id);
    
    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservation' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Validation basique
    if (!body.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }
    
    // Vérifier que le statut est valide
    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'DAMAGED', 'CANCELLED'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    // Mettre à jour le statut de la réservation
    const reservation = await updateReservationStatus(id, body.status);
    
    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error updating reservation status:', error);
    
    // Gérer l'erreur d'entité non trouvée
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update reservation status' },
      { status: 500 }
    );
  }
}
