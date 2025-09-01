"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";


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



export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const [productId, setProductId] = useState<string>("");

  useEffect(() => {
    params.then(({ productId }) => setProductId(productId));
  }, [params]);
  
  const routeParams = useParams<{ locale: string }>();
  const locale = routeParams?.locale || 'fr';
  
  // Get translations for current locale
  const t = translations[locale as keyof typeof translations] || translations.fr;
  const searchParams = useSearchParams();
  const citySlug = searchParams.get("city") || "";
  
  // Get pre-selected dates from search
  const arrivalDate = searchParams.get("arrival");
  const departureDate = searchParams.get("departure");

  const [pickupHotelId, setPickupHotelId] = useState<string>("");
  const [dropHotelId, setDropHotelId] = useState<string>("");
  const [pickupDate, setPickupDate] = useState<string>(arrivalDate || "");
  const [pickupTime, setPickupTime] = useState<string>("10:00");
  const [dropDate, setDropDate] = useState<string>(departureDate || "");
  const [dropTime, setDropTime] = useState<string>("14:00");
  
  // États pour la disponibilité
  const [availableHotels, setAvailableHotels] = useState<any[]>([]);
  const [isProductAvailable, setIsProductAvailable] = useState<boolean | null>(null);
  const [availableDates, setAvailableDates] = useState<{start: string, end: string}[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Charger les dates disponibles au démarrage
  useEffect(() => {
    // Si des dates sont déjà fournies, les utiliser
    if (arrivalDate && departureDate) {
      setPickupDate(arrivalDate);
      setDropDate(departureDate);
      
      // Générer les dates disponibles autour des dates sélectionnées
      const generateAvailableDates = () => {
        const dates = [];
        const arrival = new Date(arrivalDate);
        
        // Générer 7 jours avant et après la date d'arrivée
        for (let i = -7; i <= 7; i++) {
          const startDate = new Date(arrival);
          startDate.setDate(arrival.getDate() + i);
          
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 1);
          
          dates.push({
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
          });
        }
        
        return dates;
      };

      const availableDates = generateAvailableDates();
      setAvailableDates(availableDates);
    } else {
      // Générer les 14 prochains jours comme dates disponibles par défaut
      const generateDefaultDates = () => {
        const dates = [];
        const today = new Date();
        
        for (let i = 0; i < 14; i++) {
          const startDate = new Date(today);
          startDate.setDate(today.getDate() + i);
          
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 1);
          
          dates.push({
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
          });
        }
        
        return dates;
      };

      const defaultDates = generateDefaultDates();
      setAvailableDates(defaultDates);
      
      // Sélectionner la première date disponible
      if (defaultDates.length > 0) {
        setPickupDate(defaultDates[0].start);
        setDropDate(defaultDates[0].end);
      }
    }
  }, [arrivalDate, departureDate]);

  const [product, setProduct] = useState<any>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  // Load product and hotels data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setIsLoadingProduct(true);
        setProductError(null);

        // Fetch product details
        const productResponse = await fetch(`/api/products/${productId}`);
        if (!productResponse.ok) {
          throw new Error('Product not found');
        }
        const productData = await productResponse.json();
        setProduct(productData);

        // Fetch available hotels for this product in the city with date filtering
        const hotelsResponse = await fetch(`/api/hotels/availability?citySlug=${citySlug}&productId=${productId}&dateStart=${arrivalDate}&dateEnd=${departureDate}`);
        if (hotelsResponse.ok) {
          const hotelsData = await hotelsResponse.json();
          // Filter hotels that have the product available
          const availableHotels = hotelsData.filter((hotel: any) => 
            hotel.inventory && hotel.inventory.some((item: any) => 
              item.productId === productId && item.availableQuantity > 0
            )
          );
          setHotels(availableHotels);
        }
      } catch (err) {
        console.error('Error loading product data:', err);
        setProductError('Error loading product data');
      } finally {
        setIsLoadingProduct(false);
      }
    };

    if (productId && citySlug) {
      fetchProductData();
    }
  }, [productId, citySlug]);
    
  // Vérifier la disponibilité lorsqu'un hôtel est sélectionné
  const checkAvailabilityForHotel = async (hotelId: string) => {
    if (!hotelId) return;
    
    setIsCheckingAvailability(true);
    
    try {
      // Vérifier la disponibilité réelle pour cet hôtel
      const response = await fetch(`/api/hotels/availability?citySlug=${citySlug}&productId=${productId}&hotelId=${hotelId}`);
      
      if (response.ok) {
        const availabilityData = await response.json();
        console.log('Availability data:', availabilityData);
        const hotel = availabilityData.find((item: any) => item.id === hotelId);
        console.log('Found hotel:', hotel);
        const isAvailable = hotel && hotel.hasAvailableProducts;
        console.log('Is available:', isAvailable);
        
        setIsProductAvailable(isAvailable);
        
        if (isAvailable) {
          // Générer les dates disponibles autour des dates sélectionnées
          const availableDates = [];
          const baseDate = new Date(pickupDate || new Date());
          
          for (let i = -7; i <= 7; i++) {
            const startDate = new Date(baseDate);
            startDate.setDate(baseDate.getDate() + i);
            
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 1);
            
            availableDates.push({
              start: startDate.toISOString().split('T')[0],
              end: endDate.toISOString().split('T')[0]
            });
          }
          
          setAvailableDates(availableDates);
          
          // Sélectionner la première date disponible
          if (availableDates.length > 0) {
            setPickupDate(availableDates[0].start);
            setDropDate(availableDates[0].end);
          }
        }
      } else {
        setIsProductAvailable(false);
      }
    } catch (err) {
      console.error("Erreur lors de la vérification de la disponibilité:", err);
      setIsProductAvailable(false);
    } finally {
      setIsCheckingAvailability(false);
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

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t.productNotFound}</h1>
          <p className="text-gray-600 mb-4">{productError || 'Produit non trouvé'}</p>
          <Button asChild>
            <Link href={`/${locale}/products?city=${citySlug}`}>{t.back}</Link>
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
          
          {isCheckingAvailability && (
            <div className="mt-4 text-sm text-blue-600">
              Vérification des disponibilités...
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
                onChange={(e) => {
                  const hotelId = e.target.value;
                  setPickupHotelId(hotelId);
                  setDropHotelId(hotelId); // Synchroniser l'hôtel de dépôt
                  if (hotelId) {
                    checkAvailabilityForHotel(hotelId);
                  }
                }}
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
              <select
                className="w-full border rounded-md p-2"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                required
                disabled={!pickupHotelId || availableDates.length === 0}
              >
                <option value="">Sélectionnez une date</option>
                {availableDates.map((date, index) => (
                  <option key={index} value={date.start}>
                    {new Date(date.start).toLocaleDateString(locale)}
                  </option>
                ))}
              </select>
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
              <select
                className="w-full border rounded-md p-2"
                value={dropDate}
                onChange={(e) => setDropDate(e.target.value)}
                required
                disabled={!pickupDate || availableDates.length === 0}
              >
                <option value="">Sélectionnez une date</option>
                {availableDates
                  .filter(date => !pickupDate || date.start >= pickupDate)
                  .map((date, index) => (
                    <option key={index} value={date.end}>
                      {new Date(date.end).toLocaleDateString(locale)}
                    </option>
                  ))}
              </select>
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
            <Link href={`/${locale}/products?city=${citySlug}`}>
              {t.back}
            </Link>
          </Button>
          <Button type="submit" disabled={!isFormValid}>
            {t.next}
          </Button>
        </div>
      </form>
          </div>
        </div>
      </div>
    </div>
  );
}
