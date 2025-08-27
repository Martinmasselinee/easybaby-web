"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

// Traductions statiques
const translations = {
  fr: {
    productsTitle: "Équipements disponibles",
    deposit: (amount: string) => `Caution : ${amount}`,
    pricePerHour: (amount: string) => `${amount}/heure`,
    pricePerDay: (amount: string) => `${amount}/jour`,
    availability: (count: number, total: number) => `Disponibilité : ${count} sur ${total}`,
    select: "Sélectionner",
    notAvailable: "Indisponible"
  },
  en: {
    productsTitle: "Available Equipment",
    deposit: (amount: string) => `Deposit: ${amount}`,
    pricePerHour: (amount: string) => `${amount}/hour`,
    pricePerDay: (amount: string) => `${amount}/day`,
    availability: (count: number, total: number) => `Availability: ${count} out of ${total}`,
    select: "Select",
    notAvailable: "Not Available"
  }
};

// Type pour les produits
type Product = {
  id: string;
  name: string;
  description: string;
  deposit: number;
  pricePerHour: number;
  pricePerDay: number;
  availability: {
    total: number;
    available: number;
    hotelsCount?: number;
  };
};

// Données de démonstration pour la V1 (utilisées comme fallback)
const demoProducts: Product[] = [
  {
    id: "poussette",
    name: "Poussette",
    description: "Poussette confortable et facile à plier",
    deposit: 15000, // 150€ en centimes
    pricePerHour: 300, // 3€ par heure en centimes
    pricePerDay: 1500, // 15€ par jour en centimes
    availability: {
      total: 5,
      available: 3,
      hotelsCount: 1,
    },
  },
  {
    id: "lit-parapluie",
    name: "Lit parapluie",
    description: "Lit parapluie confortable et sécurisé",
    deposit: 20000, // 200€ en centimes
    pricePerHour: 200, // 2€ par heure en centimes
    pricePerDay: 1000, // 10€ par jour en centimes
    availability: {
      total: 5,
      available: 4,
      hotelsCount: 1,
    },
  },
];

export default function CityProductsPage({
  params,
}: {
  params: { citySlug: string };
}) {
  const citySlug = params.citySlug;
  
  const routeParams = useParams<{ locale: string }>();
  const locale = routeParams?.locale || 'fr';
  
  // Get translations for current locale
  const t = translations[locale as keyof typeof translations] || translations.fr;

  // États pour stocker les produits et la ville
  const [products, setProducts] = useState<Product[]>([]);
  const [cityName, setCityName] = useState(citySlug === "paris" ? "Paris" : citySlug);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les produits au chargement de la page
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Récupérer les produits disponibles dans cette ville
        const response = await fetch(`/api/products/city/${citySlug}`);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Si aucun produit n'est retourné, utiliser les données de démo
        if (data.length === 0) {
          setProducts(demoProducts);
        } else {
          setProducts(data);
        }
        
        // Récupérer également les informations de la ville
        const cityResponse = await fetch(`/api/cities/${citySlug}`);
        if (cityResponse.ok) {
          const cityData = await cityResponse.json();
          setCityName(cityData.name);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des produits:", err);
        setError("Impossible de charger les produits. Utilisation des données de démo.");
        setProducts(demoProducts);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [citySlug]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{cityName}</h1>
        <p className="text-muted-foreground">{t.productsTitle}</p>
        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p>Chargement des produits...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg overflow-hidden shadow-sm"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{product.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {product.description}
              </p>
              <div className="space-y-2 mb-4">
                {/* Prix par heure et par jour */}
                <div className="flex space-x-4 mb-2">
                  <p className="text-sm font-medium">
                    {t.pricePerHour(new Intl.NumberFormat(locale, {
                      style: "currency",
                      currency: "EUR",
                    }).format(product.pricePerHour / 100))}
                  </p>
                  <p className="text-sm font-medium">
                    {t.pricePerDay(new Intl.NumberFormat(locale, {
                      style: "currency",
                      currency: "EUR",
                    }).format(product.pricePerDay / 100))}
                  </p>
                </div>
                
                <p className="text-sm">
                  {t.deposit(new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency: "EUR",
                  }).format(product.deposit / 100))}
                </p>
                <p className="text-sm">
                  {t.availability(product.availability.available, product.availability.total)}
                </p>
              </div>
              <Button
                asChild
                disabled={product.availability.available === 0}
              >
                <Link
                  href={`/${locale}/product/${product.id}?city=${citySlug}`}
                >
                  {product.availability.available > 0
                    ? t.select
                    : t.notAvailable}
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
