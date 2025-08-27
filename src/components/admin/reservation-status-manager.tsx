"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

// Types pour les statuts de réservation
type ReservationStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "NO_SHOW" | "DAMAGED" | "CANCELLED";

// Traductions et informations sur les statuts
const statusInfo = {
  PENDING: {
    label: "En attente",
    description: "La réservation est en attente de confirmation.",
    color: "bg-yellow-100 text-yellow-800",
  },
  CONFIRMED: {
    label: "Confirmée",
    description: "La réservation est confirmée et en attente de retrait.",
    color: "bg-green-100 text-green-800",
  },
  COMPLETED: {
    label: "Terminée",
    description: "La réservation est terminée, l'équipement a été retourné.",
    color: "bg-blue-100 text-blue-800",
  },
  NO_SHOW: {
    label: "Non présenté",
    description: "Le client ne s'est pas présenté pour récupérer l'équipement.",
    color: "bg-orange-100 text-orange-800",
  },
  DAMAGED: {
    label: "Endommagé",
    description: "L'équipement a été retourné endommagé.",
    color: "bg-red-100 text-red-800",
  },
  CANCELLED: {
    label: "Annulée",
    description: "La réservation a été annulée.",
    color: "bg-gray-100 text-gray-800",
  },
};

// Transitions de statut autorisées
const allowedTransitions: Record<ReservationStatus, ReservationStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "NO_SHOW", "DAMAGED", "CANCELLED"],
  COMPLETED: ["DAMAGED"],
  NO_SHOW: ["CONFIRMED", "CANCELLED"],
  DAMAGED: ["COMPLETED"],
  CANCELLED: ["CONFIRMED"],
};

interface ReservationStatusManagerProps {
  reservationId: string;
  currentStatus: ReservationStatus;
  onStatusChange?: (newStatus: ReservationStatus) => void;
}

export function ReservationStatusManager({
  reservationId,
  currentStatus,
  onStatusChange,
}: ReservationStatusManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ReservationStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filtrer les statuts autorisés pour la transition
  const allowedStatuses = allowedTransitions[currentStatus] || [];

  const handleStatusChange = async () => {
    if (!selectedStatus) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Appel API pour mettre à jour le statut de la réservation
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: selectedStatus,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Erreur HTTP: ${response.status}`);
      }

      setSuccess(`Statut mis à jour avec succès: ${statusInfo[selectedStatus].label}`);
      
      // Notifier le parent du changement de statut
      if (onStatusChange) {
        onStatusChange(selectedStatus);
      }

      // Fermer la boîte de dialogue après un court délai
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut:", err);
      setError(err.message || "Une erreur est survenue lors de la mise à jour du statut");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Réinitialiser les états lorsque la boîte de dialogue s'ouvre
      setSelectedStatus(null);
      setError(null);
      setSuccess(null);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            statusInfo[currentStatus].color
          }`}
        >
          {statusInfo[currentStatus].label}
        </span>
        
        {allowedStatuses.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsOpen(true)}
          >
            Modifier
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le statut de la réservation</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <p className="text-sm mb-2">Statut actuel:</p>
              <div
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  statusInfo[currentStatus].color
                }`}
              >
                {statusInfo[currentStatus].label}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {statusInfo[currentStatus].description}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm mb-2">Nouveau statut:</p>
              <div className="grid grid-cols-2 gap-2">
                {allowedStatuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`p-2 border rounded-md text-left ${
                      selectedStatus === status
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedStatus(status)}
                  >
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mb-1 ${
                        statusInfo[status].color
                      }`}
                    >
                      {statusInfo[status].label}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {statusInfo[status].description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
                {success}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <Button 
              onClick={handleStatusChange}
              disabled={isSubmitting || !selectedStatus}
            >
              {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
