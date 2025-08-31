"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, MapPin, Calendar, ArrowRight } from "lucide-react";

// Type for cities
type City = {
  id: string;
  slug: string;
  name: string;
  hotelsCount: number;
  productsCount: number;
};

// Translations
const translations = {
  fr: {
    title: "Location d'équipements pour bébé",
    subtitle: "Trouvez tout ce dont vous avez besoin pour votre séjour à l'hôtel",
    destination: "Destination",
    destinationPlaceholder: "Rechercher une destination",
    arrival: "Arrivée",
    arrivalPlaceholder: "Quand ?",
    departure: "Départ", 
    departurePlaceholder: "Quand ?",
    search: "Rechercher",
    loading: "Chargement...",
    noCities: "Aucune ville disponible",
    error: "Erreur lors du chargement des villes"
  },
  en: {
    title: "Baby Equipment Rental",
    subtitle: "Find everything you need for your hotel stay",
    destination: "Destination",
    destinationPlaceholder: "Search for a destination",
    arrival: "Arrival",
    arrivalPlaceholder: "When?",
    departure: "Departure",
    departurePlaceholder: "When?",
    search: "Search",
    loading: "Loading...",
    noCities: "No cities available",
    error: "Error loading cities"
  }
};

export default function HomePage() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'fr';
  const router = useRouter();
  
  const t = translations[locale as keyof typeof translations] || translations.fr;

  // Form state
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [arrivalDate, setArrivalDate] = useState<string>("");
  const [departureDate, setDepartureDate] = useState<string>("");
  
  // Cities data
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Load cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/cities/counts');
        
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const data = await response.json();
        setCities(data || []);
        setFilteredCities(data || []);
      } catch (err) {
        console.error("Error loading cities:", err);
        setError(t.error);
        setCities([]);
        setFilteredCities([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCities();
  }, [t.error]);

  // Filter cities based on input
  const handleCityInputChange = (value: string) => {
    setSelectedCity(value);
    
    if (value.trim() === "") {
      setFilteredCities(cities);
      setShowCityDropdown(false);
      return;
    }

    const filtered = cities.filter(city => 
      city.name.toLowerCase().includes(value.toLowerCase()) ||
      city.slug.toLowerCase().includes(value.toLowerCase())
    );
    
    setFilteredCities(filtered);
    setShowCityDropdown(true);
  };

  // Select a city
  const handleCitySelect = (city: City) => {
    setSelectedCity(city.name);
    setShowCityDropdown(false);
  };

  // Handle form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCity || !arrivalDate || !departureDate) {
      return;
    }

    // Find the selected city
    const city = cities.find(c => c.name === selectedCity);
    if (!city) {
      return;
    }

    // Validate dates
    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);
    
    if (arrival >= departure) {
      alert("La date de départ doit être après la date d'arrivée");
      return;
    }

    // Navigate to products page with search parameters
    const searchParams = new URLSearchParams({
      city: city.slug,
      arrival: arrivalDate,
      departure: departureDate
    });
    
    router.push(`/${locale}/products?${searchParams.toString()}`);
  };

  // Set default dates (tomorrow and day after tomorrow)
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    setArrivalDate(tomorrow.toISOString().split('T')[0]);
    setDepartureDate(dayAfterTomorrow.toISOString().split('T')[0]);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-3">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Destination */}
              <div className="relative">
                <Label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.destination}
                </Label>
                <div className="relative">
                  <Input
                    id="destination"
                    type="text"
                    value={selectedCity}
                    onChange={(e) => handleCityInputChange(e.target.value)}
                    placeholder={t.destinationPlaceholder}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  
                  {/* City Dropdown */}
                  {showCityDropdown && filteredCities.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredCities.map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => handleCitySelect(city)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                        >
                          <div className="font-medium text-gray-900">{city.name}</div>
                          <div className="text-sm text-gray-500">
                            {city.hotelsCount} hôtel{city.hotelsCount !== 1 ? 's' : ''} • {city.productsCount} produit{city.productsCount !== 1 ? 's' : ''}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Arrival Date */}
              <div>
                <Label htmlFor="arrival" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.arrival}
                </Label>
                <div className="relative">
                  <Input
                    id="arrival"
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Departure Date */}
              <div>
                <Label htmlFor="departure" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.departure}
                </Label>
                <div className="relative">
                  <Input
                    id="departure"
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    min={arrivalDate || new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Search Button */}
              <div>
                <Button
                  type="submit"
                  disabled={!selectedCity || !arrivalDate || !departureDate || isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <Search className="h-5 w-5" />
                  <span>{t.search}</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center mt-8">
            <p className="text-gray-600">{t.loading}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center mt-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && cities.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-600">{t.noCities}</p>
          </div>
        )}
      </div>
    </div>
  );
}
