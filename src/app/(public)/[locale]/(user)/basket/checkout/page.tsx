"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, MapPin, Package, Clock, CreditCard, Trash2 } from "lucide-react";
import { useBasket } from "@/components/basket/basket-provider";
import { loadStripe } from '@stripe/stripe-js';

// Traductions statiques
const translations = {
  fr: {
    missingInfo: "Informations manquantes",
    back: "Retour aux produits",
    summary: "Récapitulatif",
    pickup: "Retrait",
    dropoff: "Retour",
    rentalPrice: "Prix de location",
    rentalDuration: {
      hours: (hours: number) => hours <= 1 ? "1 heure" : `${hours} heures`,
      days: (days: number) => days <= 1 ? "1 jour" : `${days} jours`
    },
    total: "Total",
    deposit: "Caution",
    depositNotice: "Caution : prélèvement de 0€ maintenant. En cas de non-retour ou dommage, nous pourrons débiter la caution.",
    email: "Email",
    phone: "Téléphone",
    code: "Code de réduction",
    applyCode: "Appliquer",
    consent: "Je comprends que le prix de location sera prélevé maintenant et qu'en cas de non-retour ou d'article endommagé, EasyBaby pourra débiter ma carte à hauteur de la caution indiquée.",
    terms: "J'accepte les conditions générales d'utilisation",
    checkout: "Payer",
    processing: "Traitement en cours...",
    pricingType: {
      hourly: "Tarification horaire",
      daily: "Tarification journalière"
    },
    remove: "Supprimer",
    empty: "Votre panier est vide",
    quantity: "Quantité",
    required: "Champ requis",
    invalidEmail: "Email invalide"
  },
  en: {
    missingInfo: "Missing information",
    back: "Back to products",
    summary: "Summary",
    pickup: "Pickup",
    dropoff: "Return",
    rentalPrice: "Rental price",
    rentalDuration: {
      hours: (hours: number) => hours <= 1 ? "1 hour" : `${hours} hours`,
      days: (days: number) => days <= 1 ? "1 day" : `${days} days`
    },
    total: "Total",
    deposit: "Deposit",
    depositNotice: "Deposit: €0 charged now. In case of non-return or damage, we may charge the deposit.",
    email: "Email",
    phone: "Phone",
    code: "Discount code",
    applyCode: "Apply",
    consent: "I understand that the rental price will be charged now and in case of non-return or damaged item, EasyBaby may charge my card up to the indicated deposit amount.",
    terms: "I agree to the terms and conditions",
    checkout: "Checkout",
    processing: "Processing...",
    pricingType: {
      hourly: "Hourly pricing",
      daily: "Daily pricing"
    },
    remove: "Remove",
    empty: "Your basket is empty",
    quantity: "Quantity",
    required: "Required field",
    invalidEmail: "Invalid email"
  }
};

// Composant qui utilise useSearchParams, enveloppé dans Suspense
function BasketCheckoutContent() {
  const routeParams = useParams<{ locale: string }>();
  const locale = routeParams?.locale || 'fr';
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get translations for current locale
  const t = translations[locale as keyof typeof translations] || translations.fr;
  
  const { state, getBasketTotal, removeBasketItem } = useBasket();
  
  // Form state
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountValid, setDiscountValid] = useState(false);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [consentDeposit, setConsentDeposit] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Payment state
  const [paymentStep, setPaymentStep] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [setupIntentSecret, setSetupIntentSecret] = useState<string | null>(null);

  const { price, deposit } = getBasketTotal();

  // Calculate final price with discount
  const finalPrice = discountValid ? Math.round(price * 100 * 0.9) : price * 100;

  // Check if basket is empty
  if (!state.basket || state.basket.items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.empty}</h2>
          <p className="text-gray-600 mb-6">Ajoutez des produits pour continuer</p>
          <Button asChild>
            <Link href={`/${locale}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.back}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Reset errors when form changes
  const resetErrors = () => {
    setError(null);
    setDiscountError(null);
  };

  // Apply discount code
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    try {
      setDiscountLoading(true);
      setDiscountError(null);

      // Validate discount code against backend
      const response = await fetch(`/api/hotels/${state.basket!.items[0].pickupHotelId}/discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode }),
      });

      if (response.ok) {
        setDiscountValid(true);
        setDiscountError(null);
      } else {
        setDiscountValid(false);
        setDiscountError('Code invalide');
      }
    } catch (err) {
      setDiscountError('Erreur lors de la validation du code');
    } finally {
      setDiscountLoading(false);
    }
  };

  // Handle item removal
  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeBasketItem(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError(t.required);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t.invalidEmail);
      return;
    }

    if (!consentDeposit || !consentTerms) {
      setError("Veuillez accepter les conditions");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const checkoutResponse = await fetch(`/api/basket/${state.basket!.id}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userEmail: email, 
          userPhone: phone,
          cityId: state.basket!.items[0].pickupHotelId // Use first item's hotel city
        }),
      });

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la commande');
      }

      const checkoutData = await checkoutResponse.json();

      // Initialize Stripe
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Confirm payment
      const { error } = await stripe.confirmPayment({
        clientSecret: checkoutData.clientSecret,
        confirmParams: { 
          return_url: `${window.location.origin}/${locale}/basket/success` 
        },
      });

      if (error) {
        throw new Error(error.message || 'Erreur de paiement');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setError(error.message || 'Erreur lors du paiement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Go back to products page with search params
  const handleBackToProducts = () => {
    if (state.basket && state.basket.items.length > 0) {
      const firstItem = state.basket.items[0];
      // Extract city from hotel name (assuming format "Hotel Name - City")
      const cityName = firstItem.pickupHotelName.includes(' - ') 
        ? firstItem.pickupHotelName.split(' - ')[1] 
        : firstItem.pickupHotelName;
      
      const params = new URLSearchParams({
        city: cityName,
        arrival: firstItem.pickupDate.toISOString().split('T')[0],
        departure: firstItem.dropDate.toISOString().split('T')[0]
      });
      router.push(`/${locale}/products?${params.toString()}`);
    } else {
      router.push(`/${locale}`);
    }
  };

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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={handleBackToProducts}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.back}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{t.summary}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Summary */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{t.summary}</h2>
              
              <div className="space-y-4">
                {state.basket?.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {item.productName}
                        </h3>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{t.rentalPrice}</span>
                      <span className="font-medium">{formatPrice(item.priceCents)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.total}</span>
                  <span className="font-semibold">{formatPrice(finalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.deposit}</span>
                  <span className="font-semibold">{formatPrice(deposit * 100)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Informations de contact</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">{t.email} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        resetErrors();
                      }}
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
                </div>
              </div>

              {/* Discount Code */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">{t.code}</h2>
                
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Entrez votre code"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleApplyDiscount}
                    disabled={discountLoading || !discountCode.trim()}
                    variant="outline"
                  >
                    {discountLoading ? "..." : t.applyCode}
                  </Button>
                </div>
                
                {discountError && (
                  <p className="text-red-600 text-sm mt-2">{discountError}</p>
                )}
                
                {discountValid && (
                  <p className="text-green-600 text-sm mt-2">Code appliqué !</p>
                )}
              </div>

              {/* Consent */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Consentement</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="consentDeposit"
                      checked={consentDeposit}
                      onChange={(e) => setConsentDeposit(e.target.checked)}
                      className="mt-1"
                    />
                    <Label htmlFor="consentDeposit" className="text-sm">
                      {t.consent}
                    </Label>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="consentTerms"
                      checked={consentTerms}
                      onChange={(e) => setConsentTerms(e.target.checked)}
                      className="mt-1"
                    />
                    <Label htmlFor="consentTerms" className="text-sm">
                      {t.terms}
                    </Label>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !consentDeposit || !consentTerms}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t.processing}
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    {t.checkout}
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BasketCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <BasketCheckoutContent />
    </Suspense>
  );
}
