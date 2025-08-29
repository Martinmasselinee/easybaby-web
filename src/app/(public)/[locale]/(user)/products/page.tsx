"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Package, Hotel } from "lucide-react";

// Type for products with availability
type Product = {
  id: string;
  name: string;
  description: string;
  pricePerHour: number;
  pricePerDay: number;
  deposit: number;
  availability: {
    total: number;
    available: number;
    hotelsCount: number;
  };
};

// Translations
const translations = {
  fr: {
    title: "Équipements disponibles",
    subtitle: "Sélectionnez l'équipement que vous souhaitez louer",
    backToSearch: "Retour à la recherche",
    noProducts: "Aucun produit disponible",
    noProductsDescription: "Aucun équipement n'est disponible pour les dates sélectionnées dans cette ville.",
    tryOtherDates: "Essayer d'autres dates",
    pricePerHour: (amount: string) => `${amount}/heure`,
    pricePerDay: (amount: string) => `${amount}/jour`,
    deposit: (amount: string) => `Caution : ${amount}`,
    availableIn: (count: number) => `Disponible dans ${count} hôtel${count !== 1 ? 's' : ''}`,
    select: "Sélectionner",
    notAvailable: "Indisponible",
    loading: "Chargement des produits...",
    error: "Erreur lors du chargement des produits"
  },
  en: {
    title: "Available Equipment",
    subtitle: "Select the equipment you want to rent",
    backToSearch: "Back to search",
    noProducts: "No products available",
    noProductsDescription: "No equipment is available for the selected dates in this city.",
    tryOtherDates: "Try other dates",
    pricePerHour: (amount: string) => `${amount}/hour`,
    pricePerDay: (amount: string) => `${amount}/day`,
    deposit: (amount: string) => `Deposit: ${amount}`,
    availableIn: (count: number) => `Available in ${count} hotel${count !== 1 ? 's' : ''}`,
    select: "Select",
    notAvailable: "Not available",
    loading: "Loading products...",
    error: "Error loading products"
  }
};

export default function ProductsPage() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'fr';
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const t = translations[locale as keyof typeof translations] || translations.fr;

  // Get search parameters
  const citySlug = searchParams.get("city") || "";
  const arrivalDate = searchParams.get("arrival") || "";
  const departureDate = searchParams.get("departure") || "";

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string>("");

  // Load products for the selected dates
  useEffect(() => {
    const fetchProducts = async () => {
      if (!citySlug || !arrivalDate || !departureDate) {
        setError("Paramètres de recherche manquants");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // First, get the city name
        const cityResponse = await fetch(`/api/cities/${citySlug}`);
        if (cityResponse.ok) {
          const cityData = await cityResponse.json();
          setCityName(cityData.name);
        }

        // Get products with availability for the selected dates
        const productsResponse = await fetch(`/api/products/city/${citySlug}/availability?arrival=${arrivalDate}&departure=${departureDate}`);
        
        if (!productsResponse.ok) {
          throw new Error(`HTTP Error: ${productsResponse.status}`);
        }
        
        const data = await productsResponse.json();
        setProducts(data || []);
      } catch (err) {
        console.error("Error loading products:", err);
        setError(t.error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [citySlug, arrivalDate, departureDate, t.error]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    if (product.availability.available === 0) {
      return; // Product not available
    }

    // Navigate to product details with pre-selected dates
    const params = new URLSearchParams({
      city: citySlug,
      arrival: arrivalDate,
      departure: departureDate
    });
    
    router.push(`/${locale}/product/${product.id}?${params.toString()}`);
  };

  // Go back to search
  const handleBackToSearch = () => {
    router.push(`/${locale}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleBackToSearch} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToSearch}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button onClick={handleBackToSearch} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToSearch}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
                <p className="text-gray-600">{t.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Search Summary */}
          <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{cityName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(arrivalDate)} - {formatDate(departureDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t.noProducts}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {t.noProductsDescription}
            </p>
            <Button onClick={handleBackToSearch} variant="outline">
              {t.tryOtherDates}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-lg border overflow-hidden shadow-sm transition-all hover:shadow-md ${
                  product.availability.available === 0 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'cursor-pointer hover:border-blue-300'
                }`}
                onClick={() => handleProductSelect(product)}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-4">
                      {product.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      {t.pricePerHour((product.pricePerHour / 100).toFixed(2) + "€")}
                    </p>
                    <p className="text-sm">
                      {t.pricePerDay((product.pricePerDay / 100).toFixed(2) + "€")}
                    </p>
                    <p className="text-sm">
                      {t.deposit((product.deposit / 100).toFixed(2) + "€")}
                    </p>
                  </div>

                  {/* Availability Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Hotel className="h-4 w-4" />
                      <span>{t.availableIn(product.availability.hotelsCount)}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      product.availability.available > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.availability.available > 0 
                        ? `${product.availability.available} disponible${product.availability.available !== 1 ? 's' : ''}`
                        : t.notAvailable
                      }
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    className={`w-full ${
                      product.availability.available === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={product.availability.available === 0}
                  >
                    {product.availability.available > 0 ? t.select : t.notAvailable}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
