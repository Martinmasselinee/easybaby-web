"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Traductions statiques
const translations = {
  fr: {
    title: "Réservation confirmée !",
    subtitle: "Votre réservation a été confirmée avec succès",
    reservationCode: "Code de réservation",
    nextSteps: "Prochaines étapes",
    pickupInfo: "Récupérez votre équipement à l'hôtel indiqué à la date et heure prévues",
    returnInfo: "Retournez l'équipement à l'hôtel indiqué à la date et heure prévues",
    contactInfo: "En cas de question, contactez-nous",
    backToHome: "Retour à l'accueil",
    emailSent: "Un email de confirmation vous a été envoyé"
  },
  en: {
    title: "Reservation confirmed!",
    subtitle: "Your reservation has been successfully confirmed",
    reservationCode: "Reservation code",
    nextSteps: "Next steps",
    pickupInfo: "Pick up your equipment at the indicated hotel on the scheduled date and time",
    returnInfo: "Return the equipment to the indicated hotel on the scheduled date and time",
    contactInfo: "If you have any questions, please contact us",
    backToHome: "Back to home",
    emailSent: "A confirmation email has been sent to you"
  }
};

export default function ReservationSuccessPage() {
  const routeParams = useParams<{ locale: string }>();
  const locale = routeParams?.locale || 'fr';
  const searchParams = useSearchParams();
  
  // Get translations for current locale
  const t = translations[locale as keyof typeof translations] || translations.fr;
  
  const [reservationCode, setReservationCode] = useState<string>("");
  const [reservationDetails, setReservationDetails] = useState<any>(null);

  useEffect(() => {
    // Get reservation code from URL params
    const code = searchParams.get("code");
    if (code) {
      setReservationCode(code);
      // In a real app, you would fetch reservation details here
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t.title}
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            {t.subtitle}
          </p>

          {/* Reservation Code */}
          {reservationCode && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {t.reservationCode}
              </h2>
              <p className="text-2xl font-mono text-blue-600">
                {reservationCode}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {t.emailSent}
              </p>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t.nextSteps}
            </h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                </div>
                <p className="ml-3 text-gray-700">
                  {t.pickupInfo}
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                </div>
                <p className="ml-3 text-gray-700">
                  {t.returnInfo}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <p className="text-gray-700">
              {t.contactInfo}
            </p>
            <p className="text-blue-600 font-medium mt-1">
              contact@easybaby.com
            </p>
          </div>

          {/* Back to Home Button */}
          <Button asChild className="w-full md:w-auto">
            <Link href={`/${locale}`}>
              {t.backToHome}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
