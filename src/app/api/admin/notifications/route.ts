import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Pour l'instant, retourner un array vide
    // TODO: Implémenter un vrai système de notifications
    const notifications = [];
    
    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('Erreur GET /api/admin/notifications:', error);
    return NextResponse.json([]);
  }
}
