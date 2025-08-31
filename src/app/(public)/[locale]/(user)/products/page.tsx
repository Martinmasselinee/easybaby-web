"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Package, Hotel, Grid3X3, List, Search, ShoppingCart } from "lucide-react";
import { useBasket } from "@/components/basket/basket-provider";

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
    error: "Erreur lors du chargement des produits",
    searchPlaceholder: "Rechercher un équipement...",
    gridView: "Vue grille",
    listView: "Vue liste",
    resultsCount: (count: number) => `${count} équipement${count !== 1 ? 's' : ''} trouvé${count !== 1 ? 's' : ''}`
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
    error: "Error loading products",
    searchPlaceholder: "Search equipment...",
    gridView: "Grid view",
    listView: "List view",
    resultsCount: (count: number) => `${count} equipment found`
  }
};

function ProductsContent() {
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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { addItemToBasket, getBasketItemCount } = useBasket();

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
        setFilteredProducts(data || []);
      } catch (err) {
        console.error("Error loading products:", err);
        setError(t.error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [citySlug, arrivalDate, departureDate, t.error]);

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

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

  // Handle adding product to basket
  const handleAddToBasket = async (product: Product, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation
    
    if (product.availability.available === 0) {
      return; // Product not available
    }

    try {
      // Get real hotel data for this product
      const hotelResponse = await fetch(`/api/hotels/availability?citySlug=${citySlug}&productId=${product.id}`);
      if (!hotelResponse.ok) {
        throw new Error('Failed to fetch hotel data');
      }
      
      const hotels = await hotelResponse.json();
      const availableHotels = hotels.filter((hotel: any) => hotel.hasAvailableProducts);
      
      if (availableHotels.length === 0) {
        throw new Error('No available hotels for this product');
      }

      // Use the first available hotel
      const selectedHotel = availableHotels[0];
      
      // Use the search dates or default to tomorrow
      const pickupDate = arrivalDate ? new Date(arrivalDate) : new Date();
      pickupDate.setDate(pickupDate.getDate() + 1);
      
      const dropDate = departureDate ? new Date(departureDate) : new Date();
      dropDate.setDate(dropDate.getDate() + 2);

      await addItemToBasket({
        productId: product.id,
        productName: product.name,
        pickupHotelId: selectedHotel.id,
        pickupHotelName: selectedHotel.name,
        dropHotelId: selectedHotel.id,
        dropHotelName: selectedHotel.name,
        pickupDate: pickupDate,
        dropDate: dropDate,
        quantity: 1,
        priceCents: product.pricePerDay,
        depositCents: product.deposit,
      });

      // Show success message or notification
      console.log("Product added to basket!");
    } catch (error) {
      console.error("Error adding product to basket:", error);
      // Show error message
    }
  };

  // Go back to search
  const handleBackToSearch = () => {
    router.push(`/${locale}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
    <div className="min-h-screen bg-white">
      {/* Sticky Search Summary */}
      <div className="sticky top-16 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <div className="py-4">
            <div className="flex items-center gap-4">
              {/* Left side - Back button */}
              <Button onClick={handleBackToSearch} variant="default" size="sm" className="bg-black hover:bg-gray-800">
                <ArrowLeft className="h-4 w-4 text-white" />
              </Button>

              {/* Center - Search Criteria */}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-pink-600" />
                  <span className="font-medium">{cityName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-pink-600" />
                  <span>{formatDate(arrivalDate)} - {formatDate(departureDate)}</span>
                </div>
                <div className="text-gray-500">
                  {t.resultsCount(filteredProducts.length)}
                </div>
              </div>

              {/* Right side - Search Bar and Toggle */}
              <div className="flex items-center space-x-4">
                {/* Search Bar */}
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                {/* View Toggle */}
                <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 px-3"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          {/* Header */}
          <div className="py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-gray-600">{t.subtitle}</p>
            </div>
          </div>

          {/* Content */}
          <div className="pb-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? "Aucun résultat trouvé" : t.noProducts}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm ? "Essayez de modifier vos critères de recherche." : t.noProductsDescription}
              </p>
              <Button onClick={handleBackToSearch} variant="outline">
                {t.tryOtherDates}
              </Button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 ${
                    product.availability.available === 0 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'cursor-pointer hover:scale-[1.02] hover:border-blue-300'
                  } ${viewMode === 'list' ? 'flex items-center p-6' : 'p-6'}`}
                  onClick={() => handleProductSelect(product)}
                >
                  {viewMode === 'list' ? (
                    // List View
                    <>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {product.name.toLowerCase().replace(/\b\w/g, (l, i) => i === 0 ? l.toUpperCase() : l)}
                        </h3>
                        {product.description && (
                          <p className="text-base text-gray-600 mb-3 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <span>{t.pricePerHour((product.pricePerHour / 100).toFixed(2) + "€")}</span>
                          <span>{t.pricePerDay((product.pricePerDay / 100).toFixed(2) + "€")}</span>
                          <span>{t.deposit((product.deposit / 100).toFixed(2) + "€")}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Hotel className="h-4 w-4" />
                          <span>{t.availableIn(product.availability.hotelsCount)}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.availability.available > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.availability.available > 0 
                            ? `${product.availability.available} disponible${product.availability.available !== 1 ? 's' : ''}`
                            : t.notAvailable
                          }
                        </div>
                        <Button
                          className={`${
                            product.availability.available === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-pink-600 hover:bg-pink-700'
                          }`}
                          disabled={product.availability.available === 0}
                        >
                          {product.availability.available > 0 ? t.select : t.notAvailable}
                        </Button>
                      </div>
                    </>
                  ) : (
                    // Grid View
                    <>
                      <div className="relative -mx-6 -mt-6 mb-4">
                        {/* Product Image Placeholder */}
                        <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center">
                          <Package className="h-12 w-12 text-pink-600" />
                        </div>
                        
                        {/* Availability Badge */}
                        <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${
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

                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {product.name.toLowerCase().replace(/\b\w/g, (l, i) => i === 0 ? l.toUpperCase() : l)}
                      </h3>
                      
                      {product.description && (
                        <p className="text-base text-gray-600 mb-4 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* Pricing */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">{t.pricePerHour((product.pricePerHour / 100).toFixed(2) + "€")}</span>
                          <span className="text-lg font-bold text-pink-600">{t.pricePerDay((product.pricePerDay / 100).toFixed(2) + "€")}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {t.deposit((product.deposit / 100).toFixed(2) + "€")}
                        </div>
                      </div>

                      {/* Availability Info */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Hotel className="h-4 w-4" />
                          <span>{t.availableIn(product.availability.hotelsCount)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button
                          className={`flex-1 ${
                            product.availability.available === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-pink-600 hover:bg-pink-700'
                          }`}
                          disabled={product.availability.available === 0}
                        >
                          {product.availability.available > 0 ? t.select : t.notAvailable}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-3"
                          onClick={(e) => handleAddToBasket(product, e)}
                          disabled={product.availability.available === 0}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
