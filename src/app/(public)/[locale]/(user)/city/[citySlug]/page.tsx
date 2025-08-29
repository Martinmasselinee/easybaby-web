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
    notAvailable: "Indisponible",
    noProducts: "Aucun produit disponible",
    noProductsDescription: "Il n'y a actuellement aucun produit disponible dans cette ville."
  },
  en: {
    productsTitle: "Available Equipment",
    deposit: (amount: string) => `Deposit: ${amount}`,
    pricePerHour: (amount: string) => `${amount}/hour`,
    pricePerDay: (amount: string) => `${amount}/day`,
    availability: (count: number, total: number) => `Availability: ${count} out of ${total}`,
    select: "Select",
    notAvailable: "Not Available",
    noProducts: "No products available",
    noProductsDescription: "There are currently no products available in this city."
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
  availability?: {
    total: number;
    available: number;
    hotelsCount?: number;
  };
};

export default function CityProductsPage() {
  const params = useParams<{ locale: string; citySlug: string }>();
  const locale = params.locale || 'fr';
  const citySlug = params.citySlug;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const t = translations[locale as keyof typeof translations] || translations.fr;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/products/city/${citySlug}`);
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (err: any) {
        console.error("Erreur lors du chargement des produits:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (citySlug) {
      fetchProducts();
    }
  }, [citySlug]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t.productsTitle}</h1>
        </div>
        <div className="flex items-center justify-center py-8">
          <p>Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t.productsTitle}</h1>
        </div>
        <div className="text-center py-8 text-red-600">
          <p>Erreur : {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-2">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t.productsTitle}</h1>
        <p className="text-muted-foreground">
          Sélectionnez l'équipement que vous souhaitez louer
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t.noProducts}
          </h3>
          <p className="text-gray-600 mb-6">
            {t.noProductsDescription}
          </p>
          <Button asChild variant="outline">
            <Link href={`/${locale}/city`}>
              Retour aux villes
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <p className="text-sm">
                    {t.pricePerHour((product.pricePerHour / 100).toFixed(2) + "€")}
                  </p>
                  <p className="text-sm">
                    {t.pricePerDay((product.pricePerDay / 100).toFixed(2) + "€")}
                  </p>
                  <p className="text-sm">
                    {t.deposit((product.deposit / 100).toFixed(2) + "€")}
                  </p>
                  <p className="text-sm">
                    {product.availability ? t.availability(product.availability.available, product.availability.total) : t.notAvailable}
                  </p>
                </div>

                {product.availability && product.availability.available > 0 ? (
                  <Button asChild className="w-full">
                    <Link href={`/${locale}/product/${product.id}?city=${citySlug}`}>
                      {t.select}
                    </Link>
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    {t.notAvailable}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}