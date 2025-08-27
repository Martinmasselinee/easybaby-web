"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

// Données de démonstration pour la V1
const demoReservations = {
  "res1": {
    id: "res1",
    code: "DEMO123456",
    status: "CONFIRMED",
    product: {
      id: "poussette",
      name: "Poussette",
      deposit: 15000, // 150€ en centimes
      pricePerDay: 1500, // 15€ par jour en centimes
      pricePerHour: 300, // 3€ par heure en centimes
    },
    user: {
      email: "client@example.com",
      phone: "+33612345678",
    },
    pickup: {
      hotel: {
        id: "hotel-demo-paris",
        name: "Hôtel Demo Paris",
        address: "123 Avenue des Champs-Élysées, 75008 Paris",
      },
      date: new Date("2023-07-15T10:00:00"),
    },
    dropoff: {
      hotel: {
        id: "hotel-demo-paris",
        name: "Hôtel Demo Paris",
        address: "123 Avenue des Champs-Élysées, 75008 Paris",
      },
      date: new Date("2023-07-20T14:00:00"),
    },
    city: "Paris",
    rentalDays: 5,
    rentalHours: 0,
    pricingType: "DAILY",
    rentalPrice: 7500, // 5 jours * 15€ = 75€ en centimes
    createdAt: new Date("2023-07-10T14:30:00"),
  },
  "res2": {
    id: "res2",
    code: "DEMO789012",
    status: "PENDING",
    product: {
      id: "lit-parapluie",
      name: "Lit parapluie",
      deposit: 20000, // 200€ en centimes
      pricePerDay: 1000, // 10€ par jour en centimes
      pricePerHour: 200, // 2€ par heure en centimes
    },
    user: {
      email: "autre@example.com",
      phone: "+33687654321",
    },
    pickup: {
      hotel: {
        id: "hotel-demo-paris",
        name: "Hôtel Demo Paris",
        address: "123 Avenue des Champs-Élysées, 75008 Paris",
      },
      date: new Date("2023-07-18T11:00:00"),
    },
    dropoff: {
      hotel: {
        id: "hotel-demo-paris",
        name: "Hôtel Demo Paris",
        address: "123 Avenue des Champs-Élysées, 75008 Paris",
      },
      date: new Date("2023-07-22T16:00:00"),
    },
    city: "Paris",
    rentalDays: 4,
    rentalHours: 0,
    pricingType: "DAILY",
    rentalPrice: 4000, // 4 jours * 10€ = 40€ en centimes
    createdAt: new Date("2023-07-12T09:15:00"),
  },
};

export default function ReservationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isDamagedDialogOpen, setIsDamagedDialogOpen] = useState(false);
  const [isNoShowDialogOpen, setIsNoShowDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [reservation, setReservation] = useState(demoReservations[params.id as keyof typeof demoReservations]);

  if (!reservation) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Réservation non trouvée</h1>
        <Button onClick={() => router.push('/admin/reservations')}>
          Retour aux réservations
        </Button>
      </div>
    );
  }

  // Fonction pour traduire le statut
  const getStatusTranslation = (status: string) => {
    switch(status) {
      case "CONFIRMED": return "Confirmée";
      case "PENDING": return "En attente";
      case "COMPLETED": return "Terminée";
      case "NO_SHOW": return "Non présenté";
      case "DAMAGED": return "Endommagé";
      case "CANCELLED": return "Annulée";
      default: return status;
    }
  };

  // Fonction pour obtenir la couleur du badge de statut
  const getStatusColor = (status: string) => {
    switch(status) {
      case "CONFIRMED": return "bg-green-100 text-green-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "COMPLETED": return "bg-blue-100 text-blue-800";
      case "NO_SHOW": return "bg-orange-100 text-orange-800";
      case "DAMAGED": return "bg-red-100 text-red-800";
      case "CANCELLED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const updateReservationStatus = async (newStatus: string) => {
    setIsUpdating(true);
    
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour l'état local
      setReservation({
        ...reservation,
        status: newStatus
      });
      
      // Fermer tous les dialogues
      setIsConfirmDialogOpen(false);
      setIsCancelDialogOpen(false);
      setIsCompleteDialogOpen(false);
      setIsDamagedDialogOpen(false);
      setIsNoShowDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const sendConfirmationEmail = async () => {
    setIsUpdating(true);
    
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEmailDialogOpen(false);
      alert("Email de confirmation envoyé avec succès");
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Réservation {reservation.code}</h1>
          <p className="text-muted-foreground">
            Créée le {new Intl.DateTimeFormat("fr", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(reservation.createdAt))}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/reservations')}>
            Retour
          </Button>
          <Button onClick={() => setIsEmailDialogOpen(true)}>
            Renvoyer l'email
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations principales */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Informations</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Statut</span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(reservation.status)}`}>
                {getStatusTranslation(reservation.status)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Produit</span>
              <span>{reservation.product.name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Ville</span>
              <span>{reservation.city}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Prix de location</span>
              <span>{(reservation.rentalPrice / 100).toFixed(2)} €</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Caution</span>
              <span>{(reservation.product.deposit / 100).toFixed(2)} €</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Type de tarification</span>
              <span>{reservation.pricingType === "DAILY" ? "Journalier" : "Horaire"}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Durée</span>
              <span>
                {reservation.pricingType === "DAILY" 
                  ? `${reservation.rentalDays} jour${reservation.rentalDays > 1 ? 's' : ''}` 
                  : `${reservation.rentalHours} heure${reservation.rentalHours > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
        </div>
        
        {/* Informations client */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Client</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Email</span>
              <span>{reservation.user.email}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Téléphone</span>
              <span>{reservation.user.phone}</span>
            </div>
          </div>
        </div>
        
        {/* Informations de retrait */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Retrait</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Date et heure</span>
              <span>
                {new Intl.DateTimeFormat("fr", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(reservation.pickup.date))}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Hôtel</span>
              <span>{reservation.pickup.hotel.name}</span>
            </div>
            
            <div className="mt-2">
              <span className="text-sm text-muted-foreground">{reservation.pickup.hotel.address}</span>
            </div>
          </div>
        </div>
        
        {/* Informations de retour */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Retour</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Date et heure</span>
              <span>
                {new Intl.DateTimeFormat("fr", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(reservation.dropoff.date))}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Hôtel</span>
              <span>{reservation.dropoff.hotel.name}</span>
            </div>
            
            <div className="mt-2">
              <span className="text-sm text-muted-foreground">{reservation.dropoff.hotel.address}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Actions de gestion */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        
        <div className="flex flex-wrap gap-3">
          {reservation.status === "PENDING" && (
            <Button onClick={() => setIsConfirmDialogOpen(true)}>
              Confirmer la réservation
            </Button>
          )}
          
          {(reservation.status === "PENDING" || reservation.status === "CONFIRMED") && (
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(true)}>
              Annuler la réservation
            </Button>
          )}
          
          {reservation.status === "CONFIRMED" && (
            <>
              <Button onClick={() => setIsCompleteDialogOpen(true)}>
                Marquer comme terminée
              </Button>
              
              <Button variant="outline" onClick={() => setIsNoShowDialogOpen(true)}>
                Marquer comme non présenté
              </Button>
              
              <Button variant="outline" onClick={() => setIsDamagedDialogOpen(true)}>
                Signaler un dommage
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Dialogue de confirmation */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la réservation</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Êtes-vous sûr de vouloir confirmer cette réservation ? Un email de confirmation sera envoyé au client.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button 
              onClick={() => updateReservationStatus("CONFIRMED")}
              disabled={isUpdating}
            >
              {isUpdating ? "..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue d'annulation */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler la réservation</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Êtes-vous sûr de vouloir annuler cette réservation ? Un email d'annulation sera envoyé au client.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Retour</Button>
            </DialogClose>
            <Button 
              variant="destructive"
              onClick={() => updateReservationStatus("CANCELLED")}
              disabled={isUpdating}
            >
              {isUpdating ? "..." : "Annuler la réservation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de complétion */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marquer comme terminée</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Confirmez-vous que le produit a été retourné en bon état ?
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button 
              onClick={() => updateReservationStatus("COMPLETED")}
              disabled={isUpdating}
            >
              {isUpdating ? "..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de non-présentation */}
      <Dialog open={isNoShowDialogOpen} onOpenChange={setIsNoShowDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marquer comme non présenté</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Confirmez-vous que le client ne s'est pas présenté pour récupérer le produit ?
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button 
              onClick={() => updateReservationStatus("NO_SHOW")}
              disabled={isUpdating}
            >
              {isUpdating ? "..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de dommage */}
      <Dialog open={isDamagedDialogOpen} onOpenChange={setIsDamagedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signaler un dommage</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Confirmez-vous que le produit a été retourné endommagé ? La caution sera débitée.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button 
              variant="destructive"
              onClick={() => updateReservationStatus("DAMAGED")}
              disabled={isUpdating}
            >
              {isUpdating ? "..." : "Confirmer le dommage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue d'envoi d'email */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renvoyer l'email de confirmation</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Voulez-vous renvoyer l'email de confirmation avec le code de réservation à {reservation.user.email} ?
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button 
              onClick={sendConfirmationEmail}
              disabled={isUpdating}
            >
              {isUpdating ? "..." : "Envoyer l'email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
