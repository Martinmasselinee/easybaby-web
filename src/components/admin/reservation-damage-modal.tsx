'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SimpleReservationStatus } from '@/lib/reservation-status';

interface ReservationDamageModalProps {
  reservationId: string;
  reservationCode: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: 'DAMAGED' | 'STOLEN', notes?: string) => Promise<void>;
}

export function ReservationDamageModal({
  reservationId,
  reservationCode,
  isOpen,
  onClose,
  onConfirm,
}: ReservationDamageModalProps) {
  const [damageType, setDamageType] = useState<'DAMAGED' | 'STOLEN'>('DAMAGED');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(damageType, notes);
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">
          Signaler un problème - {reservationCode}
        </h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Type de problème
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="damageType"
                value="DAMAGED"
                checked={damageType === 'DAMAGED'}
                onChange={(e) => setDamageType(e.target.value as 'DAMAGED')}
                className="mr-2"
              />
              <span>Produit endommagé</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="damageType"
                value="STOLEN"
                checked={damageType === 'STOLEN'}
                onChange={(e) => setDamageType(e.target.value as 'STOLEN')}
                className="mr-2"
              />
              <span>Produit volé</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Notes (optionnel)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="Détails sur le problème..."
          />
        </div>

        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-sm text-red-800">
            <strong>Attention :</strong> Cette action déduira automatiquement la caution 
            du client et ne peut pas être annulée facilement.
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? 'Traitement...' : 'Confirmer'}
          </Button>
        </div>
      </div>
    </div>
  );
}
