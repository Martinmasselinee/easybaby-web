"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StripePaymentFormWrapper } from "@/components/checkout/stripe-payment-form";
import { ButtonSpinner } from "@/components/ui/spinner";

// Traductions statiques
const translations = {
  fr: {
    missingInfo: "Informations manquantes",
    back: "Retour",
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
    }
  },
  en: {
    missingInfo: "Missing information",
    back: "Back",
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
    }
  }
};

// Types pour les données réelles
interface Product {
  id: string;
  name: string;
  description?: string;
  deposit: number;
  pricePerHour: number;
  pricePerDay: number;
}

interface Hotel {
  id: string;
  name: string;
  address: string;
}

// Composant qui utilise useSearchParams, enveloppé dans Suspense
function CheckoutContent() {
  const routeParams = useParams<{ locale: string }>();
  const locale = routeParams?.locale || 'fr';
  const searchParams = useSearchParams();
  
  // Get translations for current locale
  const t = translations[locale as keyof typeof translations] || translations.fr;
  
  const productId = searchParams.get("product") || "";
  const citySlug = searchParams.get("city") || "";
  const pickupHotelId = searchParams.get("pickupHotel") || "";
  const dropHotelId = searchParams.get("dropHotel") || "";
  const pickupDate = searchParams.get("pickupDate") || "";
  const dropDate = searchParams.get("dropDate") || "";
  const rentalHours = parseInt(searchParams.get("rentalHours") || "1", 10);
  const rentalDays = parseInt(searchParams.get("rentalDays") || "1", 10);
  const pricingType = searchParams.get("pricingType") || "DAILY";
  const rentalPrice = parseInt(searchParams.get("rentalPrice") || "0", 10);
  const depositAmount = parseInt(searchParams.get("depositAmount") || "0", 10);

  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [pickupHotel, setPickupHotel] = useState<Hotel | null>(null);
  const [dropHotel, setDropHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [email, setEmail] = useState("m_eline@live.concordia.ca");
  const [phone, setPhone] = useState("0769033293");
  const [discountCode, setDiscountCode] = useState("");
  const [discountValid, setDiscountValid] = useState(false);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [consentDeposit, setConsentDeposit] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Payment state
  const [paymentStep, setPaymentStep] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [setupIntentSecret, setSetupIntentSecret] = useState<string | null>(null);

  // Calculate final price with discount
  const finalPrice = discountValid ? Math.round(rentalPrice * 0.9) : rentalPrice;

  // Parse dates
  const pickupDateTime = new Date(pickupDate);
  const dropDateTime = new Date(dropDate);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!productId || !pickupHotelId || !dropHotelId) {
        setError(t.missingInfo);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Load product and hotels in parallel
        const [productResponse, pickupHotelResponse, dropHotelResponse] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch(`/api/hotels/${pickupHotelId}`),
          fetch(`/api/hotels/${dropHotelId}`)
        ]);

        if (!productResponse.ok || !pickupHotelResponse.ok || !dropHotelResponse.ok) {
          throw new Error("Failed to load data");
        }

        const [productData, pickupHotelData, dropHotelData] = await Promise.all([
          productResponse.json(),
          pickupHotelResponse.json(),
          dropHotelResponse.json()
        ]);

        setProduct(productData);
        setPickupHotel(pickupHotelData);
        setDropHotel(dropHotelData);
      } catch (err: any) {
        console.error("Error loading data:", err);
        setError(err.message || "Error loading data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [productId, pickupHotelId, dropHotelId, t.missingInfo]);

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

      const response = await fetch(`/api/hotels/${pickupHotelId}/discount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: discountCode }),
      });

      if (response.ok) {
        setDiscountValid(true);
      } else {
        const errorData = await response.json();
        setDiscountError(errorData.error || "Code invalide");
        setDiscountValid(false);
      }
    } catch (error: any) {
      console.error("Erreur lors de l'application du code:", error);
      setDiscountError("Erreur lors de l'application du code");
      setDiscountValid(false);
    } finally {
      setDiscountLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !pickupHotel || !dropHotel) {
      setError("Données manquantes");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Create reservation
      const reservationResponse = await fetch('/api/public/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          pickupHotelId,
          dropHotelId,
          pickupDate: pickupDateTime.toISOString(),
          dropDate: dropDateTime.toISOString(),
          email: email,
          phone: phone,
          discountCode: discountValid ? discountCode : undefined,
          rentalPrice: finalPrice,
          depositAmount: product.deposit,
        }),
      });

      if (!reservationResponse.ok) {
        const errorData = await reservationResponse.json();
        throw new Error(errorData.error || "Erreur lors de la création de la réservation");
      }

      const reservationData = await reservationResponse.json();
      
      // Set up payment
      setClientSecret(reservationData.clientSecret);
      setSetupIntentSecret(reservationData.setupIntentSecret);
      setPaymentStep(true);
    } catch (err: any) {
      console.error("Erreur lors de la création de la réservation", err);
      setError(err.message || "Erreur lors de la création de la réservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    // Redirect to success page or show success message
    window.location.href = `/${locale}/reservation/success`;
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    setError(`Erreur de paiement: ${error}`);
  };

  // Form validation
  const isFormValid = email && phone && consentDeposit && consentTerms && !isSubmitting;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button asChild>
            <Link href={`/${locale}/city`}>{t.back}</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!product || !pickupHotel || !dropHotel) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-6">Données de réservation incomplètes</p>
          <Button asChild>
            <Link href={`/${locale}/city`}>{t.back}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t.summary}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="border rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">{product.name}</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{t.pickup}</span>
                      <span>
                        {new Intl.DateTimeFormat(locale, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(pickupDateTime)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        {pickupHotel.name}
                      </span>
                    </div>
                    
                    <div className="flex justify-between mt-4">
                      <span>{t.dropoff}</span>
                      <span>
                        {new Intl.DateTimeFormat(locale, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(dropDateTime)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        {dropHotel.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t space-y-2">
                    {/* Type de tarification */}
                    <div className="text-sm font-medium text-gray-600 mb-2">
                      {t.pricingType[pricingType.toLowerCase() as 'hourly' | 'daily']}
                    </div>
                    
                    {/* Prix de location */}
                    <div className="flex justify-between">
                      <span>{t.rentalPrice}</span>
                      <span>
                        {new Intl.NumberFormat(locale, {
                          style: "currency",
                          currency: "EUR",
                        }).format(rentalPrice / 100)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {pricingType === "HOURLY"
                        ? t.rentalDuration.hours(rentalHours)
                        : t.rentalDuration.days(rentalDays)
                      }
                    </div>
                    
                    {/* Ligne de séparation */}
                    <div className="border-t my-2"></div>
                    
                    {/* Total */}
                    {discountValid && (
                      <div className="flex justify-between text-sm">
                        <span>{t.total}</span>
                        <span className="line-through text-gray-500">
                          {new Intl.NumberFormat(locale, {
                            style: "currency",
                            currency: "EUR",
                          }).format(rentalPrice / 100)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold">
                      <span>{discountValid ? "Total avec réduction" : t.total}</span>
                      <span>
                        {new Intl.NumberFormat(locale, {
                          style: "currency",
                          currency: "EUR",
                        }).format(finalPrice / 100)}
                      </span>
                    </div>
                    
                    {/* Caution */}
                    <div className="flex justify-between text-sm mt-4 pt-2 border-t">
                      <span>{t.deposit}</span>
                      <span>
                        {new Intl.NumberFormat(locale, {
                          style: "currency",
                          currency: "EUR",
                        }).format(product.deposit / 100)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t.depositNotice}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t.email}*
                    </label>
                    <input
                      type="email"
                      className="w-full border rounded-md p-2"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        resetErrors();
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t.phone}*
                    </label>
                    <input
                      type="tel"
                      className="w-full border rounded-md p-2"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        resetErrors();
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t.code}
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        className="flex-1 border rounded-md p-2"
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value);
                          resetErrors();
                        }}
                        placeholder="Code de réduction"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyDiscount}
                        disabled={discountLoading || !discountCode.trim()}
                      >
                        {discountLoading ? <ButtonSpinner /> : discountValid ? "✓" : t.applyCode}
                      </Button>
                    </div>
                    {discountError && (
                      <p className="text-xs text-red-500 mt-1">{discountError}</p>
                    )}
                    {discountValid && (
                      <p className="text-xs text-green-600 mt-1">Code appliqué: 10% de réduction + Revenue sharing optimisé</p>
                    )}
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="consent-deposit"
                        className="mt-1"
                        checked={consentDeposit}
                        onChange={(e) => {
                          setConsentDeposit(e.target.checked);
                          resetErrors();
                        }}
                        required
                      />
                      <label htmlFor="consent-deposit" className="text-sm">
                        {t.consent}
                      </label>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="consent-terms"
                        className="mt-1"
                        checked={consentTerms}
                        onChange={(e) => {
                          setConsentTerms(e.target.checked);
                          resetErrors();
                        }}
                        required
                      />
                      <label htmlFor="consent-terms" className="text-sm">
                        {t.terms}
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" asChild>
                      <Link
                        href={`/${locale}/product/${productId}?city=${citySlug}`}
                      >
                        {t.back}
                      </Link>
                    </Button>
                    <Button type="submit" disabled={!isFormValid || isSubmitting}>
                      {isSubmitting && <ButtonSpinner />}
                      {isSubmitting ? t.processing : t.checkout}
                    </Button>
                  </div>
                  
                  {paymentStep && clientSecret && setupIntentSecret && (
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-xl font-semibold mb-4">Paiement</h3>
                      <StripePaymentFormWrapper
                        clientSecret={clientSecret}
                        setupIntentSecret={setupIntentSecret}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        depositAmount={product.deposit}
                        currency="EUR"
                        locale={locale}
                      />
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant principal qui enveloppe le contenu dans un Suspense
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}