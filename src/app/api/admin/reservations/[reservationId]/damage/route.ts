import { NextRequest, NextResponse } from 'next/server';
import { markReservationAsDamaged, markReservationAsStolen } from '@/lib/db';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-middleware';
import { createError, errorCodes } from '@/lib/error-handler';
import { z } from 'zod';

const damageSchema = z.object({
  type: z.enum(['DAMAGED', 'STOLEN']),
  adminNotes: z.string().optional(),
});

export const POST = withErrorHandling(async (request: NextRequest, { params }: { params: { reservationId: string } }) => {
  const body = await request.json();
  const validatedData = damageSchema.parse(body);
  
  const { reservationId } = params;
  
  if (!reservationId) {
    throw createError(errorCodes.MISSING_REQUIRED_FIELD, 'ID de réservation manquant');
  }

  try {
    let updatedReservation;
    
    if (validatedData.type === 'DAMAGED') {
      updatedReservation = await markReservationAsDamaged(reservationId, validatedData.adminNotes);
    } else {
      updatedReservation = await markReservationAsStolen(reservationId, validatedData.adminNotes);
    }

    return NextResponse.json(
      createSuccessResponse(updatedReservation, `Réservation marquée comme ${validatedData.type === 'DAMAGED' ? 'endommagée' : 'volée'}`),
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Réservation non trouvée') {
      throw createError(errorCodes.NOT_FOUND, 'Réservation non trouvée');
    }
    
    throw createError(errorCodes.DATABASE_ERROR, 'Erreur lors de la mise à jour de la réservation');
  }
});
