"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Types pour les données de revenus
type RevenueData = {
  period: string;
  totalRevenue: number;
  platformRevenue: number;
  hotelRevenue: number;
  reservationsCount: number;
  reservations: ReservationRevenue[];
};

type ReservationRevenue = {
  id: string;
  code: string;
  productName: string;
  hotelName: string;
  totalAmount: number;
  platformAmount: number;
  hotelAmount: number;
  discountApplied: boolean;
  revenueShare: "PLATFORM_70" | "HOTEL_70";
};

// Données de démonstration pour la V1
const demoRevenueData: RevenueData = {
  period: "Juillet 2023",
  totalRevenue: 25000, // 250€ en centimes
  platformRevenue: 17500, // 175€ en centimes (70%)
  hotelRevenue: 7500, // 75€ en centimes (30%)
  reservationsCount: 2,
  reservations: [
    {
      id: "res1",
      code: "EZB-1234",
      productName: "Poussette",
      hotelName: "Hôtel Demo Paris",
      totalAmount: 15000, // 150€ en centimes
      platformAmount: 10500, // 105€ en centimes (70%)
      hotelAmount: 4500, // 45€ en centimes (30%)
      discountApplied: false,
      revenueShare: "PLATFORM_70",
    },
    {
      id: "res2",
      code: "EZB-5678",
      productName: "Lit parapluie",
      hotelName: "Hôtel Demo Paris",
      totalAmount: 10000, // 100€ en centimes
      platformAmount: 7000, // 70€ en centimes (70%)
      hotelAmount: 3000, // 30€ en centimes (30%)
      discountApplied: false,
      revenueShare: "PLATFORM_70",
    },
  ],
};

// Données de démonstration avec code de réduction
const demoRevenueDataWithDiscount: RevenueData = {
  period: "Août 2023",
  totalRevenue: 25000, // 250€ en centimes
  platformRevenue: 7500, // 75€ en centimes (30%)
  hotelRevenue: 17500, // 175€ en centimes (70%)
  reservationsCount: 2,
  reservations: [
    {
      id: "res3",
      code: "EZB-9012",
      productName: "Poussette",
      hotelName: "Hôtel Demo Paris",
      totalAmount: 15000, // 150€ en centimes
      platformAmount: 4500, // 45€ en centimes (30%)
      hotelAmount: 10500, // 105€ en centimes (70%)
      discountApplied: true,
      revenueShare: "HOTEL_70",
    },
    {
      id: "res4",
      code: "EZB-3456",
      productName: "Lit parapluie",
      hotelName: "Hôtel Demo Paris",
      totalAmount: 10000, // 100€ en centimes
      platformAmount: 3000, // 30€ en centimes (30%)
      hotelAmount: 7000, // 70€ en centimes (70%)
      discountApplied: true,
      revenueShare: "HOTEL_70",
    },
  ],
};

export default function RevenueDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Juillet 2023");
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simuler le chargement des données de revenus
  useEffect(() => {
    const fetchRevenueData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Dans une vraie application, nous ferions un appel API ici
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Utiliser les données de démonstration en fonction de la période sélectionnée
        if (selectedPeriod === "Juillet 2023") {
          setRevenueData(demoRevenueData);
        } else if (selectedPeriod === "Août 2023") {
          setRevenueData(demoRevenueDataWithDiscount);
        } else {
          setRevenueData(null);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données de revenus:", err);
        setError("Erreur lors du chargement des données de revenus");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenueData();
  }, [selectedPeriod]);

  // Fonction pour formater les montants en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount / 100);
  };

  // Fonction pour calculer le pourcentage
  const calculatePercentage = (amount: number, total: number) => {
    if (total === 0) return "0%";
    return `${Math.round((amount / total) * 100)}%`;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Suivi des revenus</h1>
        <div className="flex items-center gap-4">
          <select
            className="border rounded-md p-2"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="Juillet 2023">Juillet 2023</option>
            <option value="Août 2023">Août 2023</option>
          </select>
          <Button variant="outline">Exporter CSV</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p>Chargement des données de revenus...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : revenueData ? (
        <>
          {/* Résumé des revenus */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Revenu total
                </h3>
                <div className="text-3xl font-bold">
                  {formatCurrency(revenueData.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {revenueData.reservationsCount} réservations
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Part plateforme
                </h3>
                <div className="text-3xl font-bold">
                  {formatCurrency(revenueData.platformRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {calculatePercentage(
                    revenueData.platformRevenue,
                    revenueData.totalRevenue
                  )}
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Part hôtels
                </h3>
                <div className="text-3xl font-bold">
                  {formatCurrency(revenueData.hotelRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {calculatePercentage(
                    revenueData.hotelRevenue,
                    revenueData.totalRevenue
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Graphique des revenus */}
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Répartition des revenus</h2>
            <div className="h-12 bg-gray-200 rounded-md overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{
                  width: `${
                    (revenueData.platformRevenue / revenueData.totalRevenue) * 100
                  }%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm">
                  Plateforme ({calculatePercentage(
                    revenueData.platformRevenue,
                    revenueData.totalRevenue
                  )})
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-200 rounded-full mr-2"></div>
                <span className="text-sm">
                  Hôtels ({calculatePercentage(
                    revenueData.hotelRevenue,
                    revenueData.totalRevenue
                  )})
                </span>
              </div>
            </div>
          </div>

          {/* Détail des réservations */}
          <div className="border rounded-lg">
            <h2 className="text-xl font-bold p-6 pb-4">Détail des réservations</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium">Code</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Produit</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Hôtel</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Part plateforme</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Part hôtel</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Code promo</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.reservations.map((reservation) => (
                    <tr key={reservation.id} className="border-b">
                      <td className="px-4 py-3 text-sm">
                        <Link href={`/admin/reservations/${reservation.id}`} className="text-blue-600 hover:underline">
                          {reservation.code}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm">{reservation.productName}</td>
                      <td className="px-4 py-3 text-sm">{reservation.hotelName}</td>
                      <td className="px-4 py-3 text-sm">
                        {formatCurrency(reservation.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatCurrency(reservation.platformAmount)}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({calculatePercentage(
                            reservation.platformAmount,
                            reservation.totalAmount
                          )})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatCurrency(reservation.hotelAmount)}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({calculatePercentage(
                            reservation.hotelAmount,
                            reservation.totalAmount
                          )})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {reservation.discountApplied ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Appliqué
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            Non
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p>Aucune donnée disponible pour cette période</p>
        </div>
      )}
    </div>
  );
}
