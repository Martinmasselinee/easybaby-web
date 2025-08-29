"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PublicLayout, PublicPageHeader, PublicLoadingState, PublicEmptyState } from '@/components/layouts/public-layout';
import { Button } from "@/components/ui/button";

// Type pour les villes
type City = {
  id: string;
  slug: string;
  name: string;
  hotelsCount: number;
  productsCount: number;
};

// Plus de données de démonstration - app 100% fonctionnelle

// Traductions statiques
const translations = {
  fr: {
    citiesTitle: "Choisissez une ville",
    tagline: "Location d'équipements pour bébé dans votre hôtel",
    availableHotels: (count: number) => 
      count === 0 ? "Aucun hôtel partenaire" : 
      count === 1 ? "1 hôtel partenaire" : 
      `${count} hôtels partenaires`,
    availableProducts: (count: number) => 
      count === 0 ? "Aucun produit disponible" : 
      count === 1 ? "1 produit disponible" : 
      `${count} produits disponibles`,
    next: "Suivant"
  },
  en: {
    citiesTitle: "Choose a city",
    tagline: "Baby equipment rental in your hotel",
    availableHotels: (count: number) => 
      count === 0 ? "No partner hotels" : 
      count === 1 ? "1 partner hotel" : 
      `${count} partner hotels`,
    availableProducts: (count: number) => 
      count === 0 ? "No available products" : 
      count === 1 ? "1 available product" : 
      `${count} available products`,
    next: "Next"
  }
};

export default function CitiesPage() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'fr';
  
  // Get translations for current locale
  const t = translations[locale as keyof typeof translations] || translations.fr;

  // État pour stocker les villes
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les villes au chargement de la page
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/cities/counts');
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Plus de fallback - app 100% data-driven
        setCities(data || []);
      } catch (err) {
        console.error("Erreur lors du chargement des villes:", err);
        setError("Impossible de charger les villes depuis l'API.");
        setCities([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCities();
  }, []);

  return (
    <PublicLayout>
      <PublicPageHeader 
        title={t.citiesTitle}
        subtitle={t.tagline}
      />
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {isLoading ? (
        <PublicLoadingState message="Chargement des villes..." />
      ) : cities.length === 0 ? (
        <PublicEmptyState
          icon="🏙️"
          title="Aucune ville disponible"
          description="L'administrateur doit d'abord créer des villes avec des hôtels et produits. Accédez à l'interface admin pour configurer les destinations."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
          <div
            key={city.id}
            className="border rounded-lg overflow-hidden shadow-sm"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{city.name}</h2>
              <div className="space-y-1 mb-4">
                <p className="text-sm text-muted-foreground">
                  {t.availableHotels(city.hotelsCount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.availableProducts(city.productsCount)}
                </p>
              </div>
              <Button asChild>
                <Link href={`/${locale}/city/${city.slug}`}>
                  {t.next}
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
      )}
    </PublicLayout>
  );
}
