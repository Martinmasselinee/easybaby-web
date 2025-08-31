"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBasket } from '@/components/basket/basket-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calendar, MapPin, Package, Clock, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

export default function BasketCheckoutPage() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'fr';
  const router = useRouter();
  
  const { state, getBasketTotal } = useBasket();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const { price, deposit } = getBasketTotal();

  const translations = {
    fr: {
      title: 'Finaliser la commande',
      back: 'Retour au panier',
      contact: 'Informations de contact',
      email: 'Email',
      phone: 'Téléphone (optionnel)',
      review: 'Récapitulatif de la commande',
      total: 'Total',
      deposit: 'Caution',
      checkout: 'Procéder au paiement',
      empty: 'Votre panier est vide',
      pickup: 'Retrait',
      dropoff: 'Retour',
      quantity: 'Quantité',
      required: 'Champ requis',
      invalidEmail: 'Email invalide',
    },
    en: {
      title: 'Complete Order',
      back: 'Back to basket',
      contact: 'Contact Information',
      email: 'Email',
      phone: 'Phone (optional)',
      review: 'Order Summary',
      total: 'Total',
      deposit: 'Deposit',
      checkout: 'Proceed to Payment',
      empty: 'Your basket is empty',
      pickup: 'Pickup',
      dropoff: 'Return',
      quantity: 'Quantity',
      required: 'Required field',
      invalidEmail: 'Invalid email',
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

  const validateForm = () => {
    if (!email.trim()) {
      setError(t.required);
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t.invalidEmail);
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!state.basket || state.basket.items.length === 0) {
      setError('Basket is empty');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (!state.basket?.id) {
        throw new Error('No basket found');
      }

      // Get city ID from first item (simplified - in real app you'd get actual city ID)
      const firstItem = state.basket.items[0];
      if (!firstItem) {
        throw new Error('No items in basket');
      }

      // Create checkout session
      const checkoutResponse = await fetch(`/api/basket/${state.basket.id}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: email,
          userPhone: phone,
          cityId: firstItem.pickupHotelId, // Simplified - should get actual city ID
        }),
      });

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json();
        throw new Error(errorData.error || 'Checkout failed');
      }

      const checkoutData = await checkoutResponse.json();
      
      // Redirect to Stripe payment
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.confirmPayment({
        clientSecret: checkoutData.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/${locale}/basket/success`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if basket is empty
  useEffect(() => {
    if (!state.basket || state.basket.items.length === 0) {
      router.push(`/${locale}/products`);
    }
  }, [state.basket, router, locale]);

  if (!state.basket || state.basket.items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h1 className="text-xl font-semibold mb-2">{t.empty}</h1>
          <Button asChild>
            <Link href={`/${locale}/products`}>
              {t.back}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${locale}/basket`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.back}
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{t.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">{t.contact}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">{t.phone}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {t.checkout}
                    </div>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-semibold mb-4">{t.review}</h2>
            
            <div className="border rounded-lg p-4 space-y-4">
              {state.basket.items.map((item) => (
                <div key={item.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
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
                      <span>{t.quantity}: {item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.total}</span>
                  <span className="font-medium">{formatPrice(price * 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.deposit}</span>
                  <span className="font-medium">{formatPrice(deposit * 100)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total à payer</span>
                  <span>{formatPrice((price + deposit) * 100)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
