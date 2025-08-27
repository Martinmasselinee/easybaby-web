"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

// Traductions statiques
const translations = {
  fr: {
    reservationTitle: "Votre réservation",
    reservationCode: (code: string) => `Code : ${code}`,
    reservationStatus: (status: string) => `Statut : ${status}`,
    statusConfirmed: "Confirmée",
    statusPending: "En attente",
    statusCompleted: "Terminée",
    statusNoShow: "Non présenté",
    statusDamaged: "Endommagé",
    statusCancelled: "Annulée",
    pickup: "Retrait",
    dropoff: "Retour",
    rentalPrice: "Prix de location",
    rentalDuration: (days: number) => days <= 1 ? "1 jour" : `${days} jours`,
    total: "Total",
    deposit: (amount: string) => `Caution : ${amount}`,
    depositNotice: "Caution : prélèvement de 0€ maintenant. En cas de non-retour ou dommage, nous pourrons débiter la caution.",
    email: "Email",
    reservationCodeTitle: "Code de réservation",
    codeInstructions: "Présentez ce code à l'hôtel pour récupérer votre équipement",
    copyCode: "Copier le code",
    codeCopied: "Code copié !",
    hotelDiscountTitle: "Code de réduction hôtel",
    hotelDiscountCode: "EASYBABY10",
    hotelDiscountInstructions: "Utilisez ce code lors de votre réservation d'hôtel pour bénéficier d'une réduction de 10%",
    copyHotelCode: "Copier le code",
    hotelCodeCopied: "Code copié !",
    back: "Retour",
    notFound: "Réservation non trouvée"
  },
  en: {
    reservationTitle: "Your Reservation",
    reservationCode: (code: string) => `Code: ${code}`,
    reservationStatus: (status: string) => `Status: ${status}`,
    statusConfirmed: "Confirmed",
    statusPending: "Pending",
    statusCompleted: "Completed",
    statusNoShow: "No Show",
    statusDamaged: "Damaged",
    statusCancelled: "Cancelled",
    pickup: "Pickup",
    dropoff: "Return",
    rentalPrice: "Rental price",
    rentalDuration: (days: number) => days <= 1 ? "1 day" : `${days} days`,
    total: "Total",
    deposit: (amount: string) => `Deposit: ${amount}`,
    depositNotice: "Deposit: €0 charged now. In case of non-return or damage, we may charge the deposit.",
    email: "Email",
    reservationCodeTitle: "Reservation Code",
    codeInstructions: "Present this code at the hotel to pick up your equipment",
    copyCode: "Copy code",
    codeCopied: "Code copied!",
    hotelDiscountTitle: "Hotel Discount Code",
    hotelDiscountCode: "EASYBABY10",
    hotelDiscountInstructions: "Use this code when booking your hotel to get a 10% discount",
    copyHotelCode: "Copy code",
    hotelCodeCopied: "Code copied!",
    back: "Back",
    notFound: "Reservation not found"
  }
};

// Données de démonstration pour la V1
const demoReservation = {
  code: "DEMO123456",
  status: "CONFIRMED",
  product: {
    name: "Poussette",
    deposit: 15000, // 150€ en centimes
    pricePerDay: 1500, // 15€ par jour en centimes
  },
  pickup: {
    hotel: "Hôtel Demo Paris",
    date: new Date("2023-07-15T10:00:00"),
    hotelDiscountCode: "HOTELDEMO10",
  },
  dropoff: {
    hotel: "Hôtel Demo Paris",
    date: new Date("2023-07-20T14:00:00"),
  },
  user: {
    email: "client@example.com",
    phone: "+33612345678",
  },
  rentalDays: 5,
  rentalPrice: 7500, // 5 jours * 15€ = 75€ en centimes
  discountApplied: false,
  originalPrice: 7500, // Prix avant réduction
  revenueShare: "PLATFORM_70", // ou "HOTEL_70" si un code de réduction a été utilisé
};

// Données de démonstration avec code de réduction appliqué
const demoReservationWithDiscount = {
  ...demoReservation,
  code: "DEMO123456-DISC",
  discountApplied: true,
  originalPrice: 7500,
  rentalPrice: 6750, // 7500 - 10% = 6750
  revenueShare: "HOTEL_70", // Partage inversé en faveur de l'hôtel
};

export default function ReservationPage({
  params,
}: {
  params: { code: string };
}) {
  const code = params.code;
  
  const routeParams = useParams<{ locale: string }>();
  const locale = routeParams?.locale || 'fr';
  
  // Get translations for current locale
  const t = translations[locale as keyof typeof translations] || translations.fr;

  // États pour la copie dans le presse-papier
  const [reservationCodeCopied, setReservationCodeCopied] = useState(false);
  const [hotelCodeCopied, setHotelCodeCopied] = useState(false);

  // Dans une vraie application, nous chargerions les données de la réservation ici
  // Pour la démo, on utilise une version différente selon le code
  const reservation = code.includes("-DISC") ? demoReservationWithDiscount : demoReservation;
  
  // Fonction pour copier du texte dans le presse-papier
  const copyToClipboard = (text: string, setCopied: (copied: boolean) => void) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error("Erreur lors de la copie:", err);
      }
    );
  };

  if (!reservation) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">{t.notFound}</h1>
        <Button asChild>
          <Link href={`/${locale}/city`}>{t.back}</Link>
        </Button>
      </div>
    );
  }

  // Fonction pour obtenir le statut traduit
  const getStatusTranslation = (status: string) => {
    switch(status) {
      case "CONFIRMED": return t.statusConfirmed;
      case "PENDING": return t.statusPending;
      case "COMPLETED": return t.statusCompleted;
      case "NO_SHOW": return t.statusNoShow;
      case "DAMAGED": return t.statusDamaged;
      case "CANCELLED": return t.statusCancelled;
      default: return status;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t.reservationTitle}</h1>
        <p className="text-muted-foreground">
          {t.reservationCode(reservation.code)}
        </p>
        <p className="text-muted-foreground">
          {t.reservationStatus(getStatusTranslation(reservation.status))}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">{reservation.product.name}</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t.pickup}</span>
                <span>
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(reservation.pickup.date)}
                </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  {reservation.pickup.hotel}
                </span>
              </div>
              
              <div className="flex justify-between mt-4">
                <span>{t.dropoff}</span>
                <span>
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(reservation.dropoff.date)}
                </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  {reservation.dropoff.hotel}
                </span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t space-y-2">
              {/* Prix de location */}
              <div className="flex justify-between">
                <span>{t.rentalPrice}</span>
                <span>
                  {new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency: "EUR",
                  }).format(reservation.rentalPrice / 100)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {t.rentalDuration(reservation.rentalDays)}
              </div>
              
              {/* Ligne de séparation */}
              <div className="border-t my-2"></div>
              
              {/* Total */}
              {reservation.discountApplied && (
                <div className="flex justify-between text-sm">
                  <span>Prix original</span>
                  <span className="line-through text-gray-500">
                    {new Intl.NumberFormat(locale, {
                      style: "currency",
                      currency: "EUR",
                    }).format(reservation.originalPrice / 100)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold">
                <span>{reservation.discountApplied ? "Total avec réduction" : t.total}</span>
                <span>
                  {new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency: "EUR",
                  }).format(reservation.rentalPrice / 100)}
                </span>
              </div>
              {reservation.discountApplied && (
                <div className="text-xs text-green-600">
                  Code de réduction appliqué
                </div>
              )}
              
              {/* Caution */}
              <div className="flex justify-between text-sm mt-4 pt-2 border-t">
                <span>{t.deposit}</span>
                <span>
                  {new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency: "EUR",
                  }).format(reservation.product.deposit / 100)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t.depositNotice}
              </p>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">{t.email}</h2>
            <p>{reservation.user.email}</p>
            <p className="mt-2">{reservation.user.phone}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-4">{t.reservationCodeTitle}</h2>
            <div className="bg-gray-100 w-64 mx-auto flex items-center justify-center p-8 rounded-md">
              <p className="text-3xl font-bold tracking-wider">{reservation.code}</p>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {t.codeInstructions}
            </p>
            <Button 
              className="mt-4"
              onClick={() => copyToClipboard(reservation.code, setReservationCodeCopied)}
            >
              {reservationCodeCopied ? t.codeCopied : t.copyCode}
            </Button>
          </div>
          
          {/* Code de réduction hôtel */}
          <div className="border rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-4">{t.hotelDiscountTitle}</h2>
            <div className="bg-blue-50 border border-blue-200 w-64 mx-auto flex items-center justify-center p-6 rounded-md">
              <p className="text-2xl font-bold tracking-wider text-blue-700">
                {reservation.pickup.hotelDiscountCode || t.hotelDiscountCode}
              </p>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {t.hotelDiscountInstructions}
            </p>
            <p className="mt-2 text-xs text-blue-600">
              Pour l'hôtel: {reservation.pickup.hotel}
            </p>
            <Button 
              className="mt-4"
              variant="outline"
              onClick={() => copyToClipboard(reservation.pickup.hotelDiscountCode || t.hotelDiscountCode, setHotelCodeCopied)}
            >
              {hotelCodeCopied ? t.hotelCodeCopied : t.copyHotelCode}
            </Button>
          </div>
          
          <div className="flex justify-center">
            <Button asChild>
              <Link href={`/${locale}/city`}>{t.back}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
