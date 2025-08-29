"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { UniversalAdminLayout, PageHeader, LoadingState, ErrorState } from '@/components/admin/universal-admin-layout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from "@/components/ui/dialog";

type ReservationDetail = {
  id: string;
  code: string;
  status: string;
  userEmail: string;
  userPhone?: string;
  startAt: string;
  endAt: string;
  priceCents: number;
  depositCents: number;
  isDamaged: boolean;
  damageDescription?: string;
  damageFeeCents?: number;
  stripePaymentIntentId?: string;
    product: {
    id: string;
    name: string;
    description?: string;
    pricePerDay: number;
    deposit: number;
  };
  pickupHotel: {
    id: string;
    name: string;
    address: string;
    email: string;
    phone?: string;
    city: {
      name: string;
    };
  };
  discountCode?: {
    code: string;
    kind: string;
  };
  createdAt: string;
  updatedAt: string;
};

export default function ReservationDetailPage() {
  const params = useParams();
  const reservationId = params.id as string;
  
  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDamageDialogOpen, setIsDamageDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReservation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/reservations/${reservationId}`);
      if (!response.ok) {
        throw new Error(`Réservation non trouvée: ${response.status}`);
      }

      const data = await response.json();
      setReservation(data);

    } catch (err: any) {
      console.error("Erreur lors du chargement de la réservation:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (reservationId) {
      fetchReservation();
    }
  }, [reservationId]);

  const handleDamageReport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const damageData = {
      isDamaged: true,
      damageDescription: formData.get("description") as string,
      damageFeeCents: Math.round(parseFloat(formData.get("fee") as string) * 100),
    };

    try {
      const response = await fetch(`/api/admin/reservations/${reservationId}/damage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(damageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors du signalement");
      }

      await fetchReservation(); // Refresh data
      setIsDamageDialogOpen(false);
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error("Erreur lors du signalement:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/reservations/${reservationId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors du changement de statut");
      }

      await fetchReservation(); // Refresh data
      setIsStatusDialogOpen(false);
    } catch (error: any) {
      console.error("Erreur lors du changement de statut:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'active': return 'En cours';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const calculateRevenueSplit = () => {
    if (!reservation) return { easyBaby: 0, hotel: 0 };
    
    const total = reservation.priceCents;
    const isHotel70 = reservation.discountCode?.kind === 'HOTEL_70';
    
    return {
      easyBaby: isHotel70 ? total * 0.3 : total * 0.7,
      hotel: isHotel70 ? total * 0.7 : total * 0.3
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Détails de la réservation</h1>
        </div>
        <div className="flex items-center justify-center py-8">
          <p>Chargement de la réservation...</p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-2">Réservation non trouvée</h1>
          <Button asChild variant="outline">
            <Link href="/admin/reservations">Retour aux réservations</Link>
          </Button>
        </div>
        <div className="text-center py-8 text-red-600">
          <p>Erreur : {error || "Réservation non trouvée"}</p>
        </div>
      </div>
    );
  }

  const revenueSplit = calculateRevenueSplit();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link
                  href="/admin/reservations"
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Réservations
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    {reservation.code}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          <div className="flex items-center gap-4 mt-2">
            <h1 className="text-3xl font-bold">Réservation {reservation.code}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
              {getStatusLabel(reservation.status)}
            </span>
            {reservation.isDamaged && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                ⚠️ Endommagé
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Changer statut</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Changer le statut de la réservation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p className="text-sm text-gray-600">
                  Statut actuel : <strong>{getStatusLabel(reservation.status)}</strong>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((status) => (
                    <Button
                      key={status}
                      variant={reservation.status === status ? "default" : "outline"}
                      onClick={() => handleStatusChange(status)}
                      disabled={isSubmitting || reservation.status === status}
                    >
                      {getStatusLabel(status)}
                    </Button>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {!reservation.isDamaged && (
            <Dialog open={isDamageDialogOpen} onOpenChange={setIsDamageDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">Signaler dommage</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Signaler un dommage</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleDamageReport} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description du dommage *</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      placeholder="Décrivez les dommages constatés..."
                      required 
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee">Frais de réparation/remplacement (€) *</Label>
                    <Input 
                      id="fee" 
                      name="fee" 
                      type="number"
                      step="0.01"
                      min="0"
                      max={reservation.depositCents / 100}
                      placeholder="ex: 50.00"
                      required 
                    />
                    <p className="text-xs text-gray-500">
                      Maximum : {(reservation.depositCents / 100).toFixed(2)}€ (caution déposée)
                    </p>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline" disabled={isSubmitting}>
                        Annuler
                      </Button>
                    </DialogClose>
                    <Button type="submit" variant="destructive" disabled={isSubmitting}>
                      {isSubmitting ? "Signalement..." : "Signaler et débiter"}
          </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
          
          <Button asChild variant="outline">
            <Link href="/admin/reservations">Retour</Link>
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations client */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Informations client</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{reservation.userEmail}</dd>
              </div>
              {reservation.userPhone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{reservation.userPhone}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Réservé le</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(reservation.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Dernière modification</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(reservation.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
            </div>
            
          {/* Détails produit */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Produit réservé</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-lg">{reservation.product.name}</h4>
                {reservation.product.description && (
                  <p className="text-gray-600 mt-1">{reservation.product.description}</p>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Prix/jour :</span>
                  <p className="font-medium">{(reservation.product.pricePerDay / 100).toFixed(2)}€</p>
                </div>
                <div>
                  <span className="text-gray-500">Caution :</span>
                  <p className="font-medium">{(reservation.product.deposit / 100).toFixed(2)}€</p>
                </div>
                <div>
                  <span className="text-gray-500">Du :</span>
                  <p className="font-medium">{new Date(reservation.startAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Au :</span>
                  <p className="font-medium">{new Date(reservation.endAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            </div>
            
          {/* Hôtel de récupération */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Hôtel de récupération</h3>
            <div className="space-y-3">
              <h4 className="font-medium">{reservation.pickupHotel.name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Adresse :</span>
                  <p>{reservation.pickupHotel.address}</p>
                  <p>{reservation.pickupHotel.city.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Contact :</span>
                  <p>{reservation.pickupHotel.email}</p>
                  {reservation.pickupHotel.phone && <p>{reservation.pickupHotel.phone}</p>}
            </div>
            </div>
              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/hotels/${reservation.pickupHotel.id}`}>
                    Voir les détails de l'hôtel
                  </Link>
                </Button>
            </div>
            </div>
          </div>

          {/* Dommages si applicable */}
          {reservation.isDamaged && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-red-900 mb-4">⚠️ Dommages signalés</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-red-700 font-medium">Description :</span>
                  <p className="text-red-800 mt-1">{reservation.damageDescription}</p>
                </div>
                <div>
                  <span className="text-red-700 font-medium">Frais débités :</span>
                  <p className="text-red-800 font-bold">
                    {reservation.damageFeeCents ? (reservation.damageFeeCents / 100).toFixed(2) : '0.00'}€
                  </p>
        </div>
            </div>
            </div>
          )}
        </div>
        
        {/* Sidebar financière */}
        <div className="space-y-6">
          {/* Résumé financier */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Résumé financier</h3>
            <div className="space-y-3">
            <div className="flex justify-between">
                <span>Prix de location :</span>
                <span className="font-bold">{(reservation.priceCents / 100).toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
                <span>Caution :</span>
                <span>{(reservation.depositCents / 100).toFixed(2)}€</span>
              </div>
              {reservation.isDamaged && reservation.damageFeeCents && (
                <div className="flex justify-between text-red-600">
                  <span>Frais dommages :</span>
                  <span className="font-bold">-{(reservation.damageFeeCents / 100).toFixed(2)}€</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total payé :</span>
                <span className="text-green-600">{(reservation.priceCents / 100).toFixed(2)}€</span>
            </div>
            </div>
          </div>

          {/* Partage des revenus */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Partage des revenus</h3>
            {reservation.discountCode ? (
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-gray-500">Code utilisé :</span>
                  <p className="font-mono font-bold">{reservation.discountCode.code}</p>
        </div>
                <div className="space-y-2">
            <div className="flex justify-between">
                    <span>Part EasyBaby :</span>
                    <span className="font-bold text-blue-600">
                      {(revenueSplit.easyBaby / 100).toFixed(2)}€
              </span>
            </div>
            <div className="flex justify-between">
                    <span>Part Hôtel :</span>
                    <span className="font-bold text-purple-600">
                      {(revenueSplit.hotel / 100).toFixed(2)}€
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Répartition : {reservation.discountCode.kind === 'HOTEL_70' ? 'Hôtel 70% - EasyBaby 30%' : 'EasyBaby 70% - Hôtel 30%'}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Aucun code de réduction utilisé</p>
            )}
            </div>
            
          {/* Informations techniques */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Informations techniques</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">ID Réservation :</span>
                <p className="font-mono text-xs">{reservation.id}</p>
              </div>
              {reservation.stripePaymentIntentId && (
                <div>
                  <span className="text-gray-500">Stripe Payment ID :</span>
                  <p className="font-mono text-xs">{reservation.stripePaymentIntentId}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
