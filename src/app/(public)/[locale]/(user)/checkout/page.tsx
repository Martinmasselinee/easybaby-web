"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

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
    pricingType: {
      hourly: "Hourly pricing",
      daily: "Daily pricing"
    }
  }
};

// Données de démonstration pour la V1
const demoProducts = {
  "poussette": {
    id: "poussette",
    name: "Poussette",
    description: "Poussette confortable et facile à plier",
    deposit: 15000, // 150€ en centimes
    pricePerHour: 300, // 3€ par heure en centimes
    pricePerDay: 1500, // 15€ par jour en centimes
  },
  "lit-parapluie": {
    id: "lit-parapluie",
    name: "Lit parapluie",
    description: "Lit parapluie confortable et sécurisé",
    deposit: 20000, // 200€ en centimes
    pricePerHour: 200, // 2€ par heure en centimes
    pricePerDay: 1000, // 10€ par jour en centimes
  },
};

const demoHotels = {
  "hotel-demo-paris": {
    id: "hotel-demo-paris",
    name: "Hôtel Demo Paris",
    address: "123 Avenue des Champs-Élysées, 75008 Paris",
  },
};

export default function CheckoutPage() {
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

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentDeposit, setConsentDeposit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const product = demoProducts[productId as keyof typeof demoProducts];
  const pickupHotel = demoHotels[pickupHotelId as keyof typeof demoHotels];
  const dropHotel = demoHotels[dropHotelId as keyof typeof demoHotels];

  const pickupDateTime = new Date(pickupDate);
  const dropDateTime = new Date(dropDate);

  const isFormValid = email && phone && consentTerms && consentDeposit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    
    // Dans une vraie application, nous enverrions une requête à l'API pour créer une réservation
    // et initialiser le paiement Stripe
    try {
      // Simuler un appel API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Rediriger vers la page de confirmation avec un code de réservation fictif
      window.location.href = `/${locale}/reservation/DEMO123456`;
    } catch (error) {
      console.error("Erreur lors du paiement", error);
      setIsSubmitting(false);
    }
  };

  if (!product || !pickupHotel || !dropHotel) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">{t.missingInfo}</h1>
        <Button asChild>
          <Link href={`/${locale}/city`}>{t.back}</Link>
        </Button>
      </div>
    );
  }

  return (
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
              <div className="flex justify-between font-bold">
                <span>{t.total}</span>
                <span>
                  {new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency: "EUR",
                  }).format(rentalPrice / 100)}
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
              <p className="text-sm text-muted-foreground mt-1">
                {t.depositNotice}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t.email}*
                </label>
                <input
                  type="email"
                  className="w-full border rounded-md p-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t.code}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 border rounded-md p-2"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                  />
                  <Button type="button" variant="outline">
                    {t.applyCode}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="consent-deposit"
                  className="mt-1"
                  checked={consentDeposit}
                  onChange={(e) => setConsentDeposit(e.target.checked)}
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
                  onChange={(e) => setConsentTerms(e.target.checked)}
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
                {isSubmitting ? "..." : t.checkout}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
