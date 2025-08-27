"use client";

import React from "react";
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

// Données de démonstration pour la V1
const demoProducts = [
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

  // Dans une vraie application, nous chargerions les données de la ville et des produits ici
  const cityName = citySlug === "paris" ? "Paris" : citySlug;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{cityName}</h1>
        <p className="text-muted-foreground">{t.productsTitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {demoProducts.map((product) => (
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
    </div>
  );
}
