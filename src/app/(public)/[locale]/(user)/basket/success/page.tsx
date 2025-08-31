"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { useBasket } from '@/components/basket/basket-provider';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, MapPin, Package, Clock } from 'lucide-react';
import Link from 'next/link';

export default function BasketSuccessPage() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'fr';
  
  const { state, clearBasket } = useBasket();

  const translations = {
    fr: {
      title: 'Commande confirmée !',
      subtitle: 'Votre réservation a été créée avec succès',
      reservationCode: 'Code de réservation',
      codeInstructions: 'Présentez ce code à chaque hôtel pour récupérer vos équipements',
      items: 'Articles commandés',
      total: 'Total payé',
      nextSteps: 'Prochaines étapes',
      pickupInstructions: 'Rendez-vous à chaque hôtel aux dates indiquées avec votre code de réservation',
      home: 'Retour à l\'accueil',
      newOrder: 'Nouvelle commande',
    },
    en: {
      title: 'Order Confirmed!',
      subtitle: 'Your reservation has been successfully created',
      reservationCode: 'Reservation Code',
      codeInstructions: 'Present this code at each hotel to collect your equipment',
      items: 'Ordered Items',
      total: 'Total Paid',
      nextSteps: 'Next Steps',
      pickupInstructions: 'Go to each hotel on the indicated dates with your reservation code',
      home: 'Back to Home',
      newOrder: 'New Order',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.fr;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  // Generate a mock reservation code (in real implementation, this would come from the API)
  const reservationCode = 'EZB-' + Math.random().toString(36).substr(2, 4).toUpperCase();

  const handleNewOrder = () => {
    clearBasket();
  };

  if (!state.basket || state.basket.items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <h1 className="text-xl font-semibold mb-2">Order completed</h1>
          <Button asChild>
            <Link href={`/${locale}`}>
              {t.home}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-lg text-gray-600">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reservation Code */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">{t.reservationCode}</h2>
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="text-3xl font-mono font-bold text-gray-900 mb-2">
                {reservationCode}
              </div>
              <p className="text-sm text-gray-600">{t.codeInstructions}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-semibold mb-4">{t.items}</h2>
            
            <div className="space-y-4">
              {state.basket.items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium">{item.productName}</h3>
                    <span className="font-medium">{formatPrice(item.priceCents)}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{item.pickupHotelName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(item.pickupDate)} - {formatDate(item.dropDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Quantité: {item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-lg font-semibold">
                <span>{t.total}</span>
                <span>{formatPrice(state.basket.items.reduce((sum, item) => sum + item.priceCents + item.depositCents, 0))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">{t.nextSteps}</h2>
          <p className="text-gray-700">{t.pickupInstructions}</p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href={`/${locale}`}>
              {t.home}
            </Link>
          </Button>
          <Button onClick={handleNewOrder} className="bg-pink-600 hover:bg-pink-700">
            {t.newOrder}
          </Button>
        </div>
      </div>
    </div>
  );
}
