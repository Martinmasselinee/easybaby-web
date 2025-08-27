"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AvailabilityChecker } from "@/components/ui/availability-checker";

// Traductions statiques
const translations = {
  fr: {
    productNotFound: "Produit non trouvé",
    back: "Retour",
    deposit: (amount: string) => `Caution : ${amount}`,
    price: (amount: string) => `Prix : ${amount}`,
    pricePerDay: (amount: string) => `Prix par jour : ${amount}`,
    pricePerHour: (amount: string) => `Prix par heure : ${amount}`,
    pickup: "Retrait",
    dropoff: "Retour",
    hotel: "Hôtel",
    selectHotel: "Sélectionnez un hôtel",
    date: "Date",
    time: "Heure",
    next: "Suivant",
    rentalDuration: {
      hours: (hours: number) => hours <= 1 ? "1 heure" : `${hours} heures`,
      days: (days: number) => days <= 1 ? "1 jour" : `${days} jours`
    },
    pricingType: {
      hourly: "Tarification horaire",
      daily: "Tarification journalière"
    }
  },
  en: {
    productNotFound: "Product not found",
    back: "Back",
    deposit: (amount: string) => `Deposit: ${amount}`,
    price: (amount: string) => `Price: ${amount}`,
    pricePerDay: (amount: string) => `Price per day: ${amount}`,
    pricePerHour: (amount: string) => `Price per hour: ${amount}`,
    pickup: "Pickup",
    dropoff: "Return",
    hotel: "Hotel",
    selectHotel: "Select a hotel",
    date: "Date",
    time: "Time",
    next: "Next",
    rentalDuration: {
      hours: (hours: number) => hours <= 1 ? "1 hour" : `${hours} hours`,
      days: (days: number) => days <= 1 ? "1 day" : `${days} days`
    },
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
  "paris": [
    {
      id: "hotel-demo-paris",
      name: "Hôtel Demo Paris",
      address: "123 Avenue des Champs-Élysées, 75008 Paris",
    },
  ],
};

export default function ProductDetailPage({
  params,
}: {
  params: { productId: string };
}) {
  const productId = params.productId;
  
  const routeParams = useParams<{ locale: string }>();
  const locale = routeParams?.locale || 'fr';
  
  // Get translations for current locale
  const t = translations[locale as keyof typeof translations] || translations.fr;
  const searchParams = useSearchParams();
  const citySlug = searchParams.get("city") || "paris";

  const [pickupHotelId, setPickupHotelId] = useState<string>("");
  const [dropHotelId, setDropHotelId] = useState<string>("");
  const [pickupDate, setPickupDate] = useState<string>("");
  const [pickupTime, setPickupTime] = useState<string>("10:00");
  const [dropDate, setDropDate] = useState<string>("");
  const [dropTime, setDropTime] = useState<string>("14:00");
  
  // États pour la disponibilité
  const [availableHotels, setAvailableHotels] = useState<any[]>([]);
  const [isProductAvailable, setIsProductAvailable] = useState<boolean | null>(null);
  const [showAvailabilityChecker, setShowAvailabilityChecker] = useState(false);

  const product = demoProducts[productId as keyof typeof demoProducts];
  const hotels = availableHotels.length > 0 
    ? availableHotels.map(hotel => ({
        id: hotel.hotelId,
        name: hotel.hotelName,
      }))
    : demoHotels[citySlug as keyof typeof demoHotels] || [];
    
  // Gérer le changement de disponibilité
  const handleAvailabilityChange = (isAvailable: boolean, hotels: any[]) => {
    setIsProductAvailable(isAvailable);
    setAvailableHotels(hotels);
    
    // Si des hôtels sont disponibles, présélectionner le premier
    if (hotels.length > 0) {
      setPickupHotelId(hotels[0].hotelId);
      setDropHotelId(hotels[0].hotelId);
    } else {
      setPickupHotelId("");
      setDropHotelId("");
    }
  };

  // Calcul de la durée de location et du prix total
  const calculateRentalDuration = () => {
    if (!pickupDate || !dropDate || !pickupTime || !dropTime) {
      return {
        hours: 1,
        days: 1,
        pricingType: "DAILY" as const,
        price: product ? product.pricePerDay : 0
      };
    }
    
    const pickupDateTime = new Date(`${pickupDate}T${pickupTime}:00`);
    const dropDateTime = new Date(`${dropDate}T${dropTime}:00`);
    
    // Différence en millisecondes
    const diffTime = Math.abs(dropDateTime.getTime() - pickupDateTime.getTime());
    
    // Convertir en heures et jours
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Si moins de 24 heures, utiliser la tarification horaire
    const isPricingHourly = diffHours < 24;
    const pricingType = isPricingHourly ? "HOURLY" : "DAILY";
    
    // Calculer le prix en fonction du type de tarification
    const price = product ? (
      isPricingHourly 
        ? product.pricePerHour * diffHours 
        : product.pricePerDay * diffDays
    ) : 0;
    
    return {
      hours: diffHours || 1, // Minimum 1 heure
      days: diffDays || 1,   // Minimum 1 jour
      pricingType,
      price
    };
  };

  const rentalDuration = calculateRentalDuration();
  const rentalPrice = rentalDuration.price;

  const isFormValid =
    pickupHotelId &&
    dropHotelId &&
    pickupDate &&
    pickupTime &&
    dropDate &&
    dropTime &&
    (isProductAvailable === null || isProductAvailable === true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dans une vraie application, nous vérifierions la disponibilité ici
    // et redirigerions vers la page de paiement
    if (isFormValid) {
      const params = new URLSearchParams({
        product: productId,
        city: citySlug,
        pickupHotel: pickupHotelId,
        dropHotel: dropHotelId,
        pickupDate: `${pickupDate}T${pickupTime}:00`,
        dropDate: `${dropDate}T${dropTime}:00`,
        rentalHours: rentalDuration.hours.toString(),
        rentalDays: rentalDuration.days.toString(),
        pricingType: rentalDuration.pricingType,
        rentalPrice: rentalPrice.toString(),
        depositAmount: product.deposit.toString()
      });
      window.location.href = `/${locale}/checkout?${params.toString()}`;
    }
  };

  if (!product) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">{t.productNotFound}</h1>
        <Button asChild>
          <Link href={`/${locale}/city/${citySlug}`}>{t.back}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-muted-foreground">{product.description}</p>
        <div className="mt-4 space-y-1">
          <div className="flex space-x-4">
            <p className="font-medium">
              {t.pricePerHour(new Intl.NumberFormat(locale, {
                style: "currency",
                currency: "EUR",
              }).format(product.pricePerHour / 100))}
            </p>
            <p className="font-medium">
              {t.pricePerDay(new Intl.NumberFormat(locale, {
                style: "currency",
                currency: "EUR",
              }).format(product.pricePerDay / 100))}
            </p>
          </div>
          
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setShowAvailabilityChecker(!showAvailabilityChecker)}
          >
            {showAvailabilityChecker ? "Masquer la disponibilité" : "Vérifier la disponibilité"}
          </Button>
          
          {showAvailabilityChecker && (
            <div className="mt-4">
              <AvailabilityChecker 
                productId={productId}
                cityId={citySlug}
                locale={locale}
                onAvailabilityChange={handleAvailabilityChange}
              />
            </div>
          )}
          
          {pickupDate && dropDate && pickupTime && dropTime && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-600">
                {t.pricingType[rentalDuration.pricingType.toLowerCase() as 'hourly' | 'daily']}
              </p>
              <p className="text-sm text-muted-foreground">
                {rentalDuration.pricingType === "HOURLY" 
                  ? t.rentalDuration.hours(rentalDuration.hours)
                  : t.rentalDuration.days(rentalDuration.days)
                }
              </p>
              <p className="font-medium text-lg mt-1">
                {t.price(new Intl.NumberFormat(locale, {
                  style: "currency",
                  currency: "EUR",
                }).format(rentalPrice / 100))}
              </p>
            </div>
          )}
          
          <p className="mt-2 text-sm">
            {t.deposit(new Intl.NumberFormat(locale, {
              style: "currency",
              currency: "EUR",
            }).format(product.deposit / 100))}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pickup Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{t.pickup}</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t.hotel}
              </label>
              <select
                className="w-full border rounded-md p-2"
                value={pickupHotelId}
                onChange={(e) => setPickupHotelId(e.target.value)}
                required
              >
                <option value="">{t.selectHotel}</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t.date}
              </label>
              <input
                type="date"
                className="w-full border rounded-md p-2"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t.time}
              </label>
              <input
                type="time"
                className="w-full border rounded-md p-2"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Dropoff Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{t.dropoff}</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t.hotel}
              </label>
              <select
                className="w-full border rounded-md p-2"
                value={dropHotelId}
                onChange={(e) => setDropHotelId(e.target.value)}
                required
              >
                <option value="">{t.selectHotel}</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t.date}
              </label>
              <input
                type="date"
                className="w-full border rounded-md p-2"
                value={dropDate}
                onChange={(e) => setDropDate(e.target.value)}
                min={pickupDate || new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {t.time}
              </label>
              <input
                type="time"
                className="w-full border rounded-md p-2"
                value={dropTime}
                onChange={(e) => setDropTime(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" asChild>
            <Link href={`/${locale}/city/${citySlug}`}>
              {t.back}
            </Link>
          </Button>
          <Button type="submit" disabled={!isFormValid}>
            {t.next}
          </Button>
        </div>
      </form>
    </div>
  );
}
