"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type RevenueData = {
  totalRevenue: number;
  easyBabyRevenue: number;
  hotelsRevenue: number;
  totalReservations: number;
  monthlyData: {
    month: string;
    revenue: number;
    reservations: number;
  }[];
  topProducts: {
    name: string;
    reservations: number;
    revenue: number;
  }[];
  topCities: {
    name: string;
    reservations: number;
    revenue: number;
  }[];
};

export default function ReportsPage() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  const fetchRevenueData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/reports/revenue?period=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      setRevenueData(data);
    } catch (err: any) {
      console.error("Erreur lors du chargement des rapports:", err);
      setError(err.message);
      // En cas d'erreur, utiliser des données vides
      setRevenueData({
        totalRevenue: 0,
        easyBabyRevenue: 0,
        hotelsRevenue: 0,
        totalReservations: 0,
        monthlyData: [],
        topProducts: [],
        topCities: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [selectedPeriod]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Rapports & Analytics</h1>
          <p className="text-muted-foreground">Analysez les performances de votre plateforme</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <p>Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  if (error && !revenueData) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Rapports & Analytics</h1>
          <p className="text-muted-foreground">Analysez les performances de votre plateforme</p>
        </div>
        <div className="text-center py-8 text-red-600">
          <p>Erreur : {error}</p>
          <Button onClick={() => fetchRevenueData()} className="mt-2">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  const hasData = revenueData && (
    revenueData.totalReservations > 0 || 
    revenueData.totalRevenue > 0
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Rapports & Analytics</h1>
          <p className="text-muted-foreground">
            Analysez les performances financières et opérationnelles
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toute la période</option>
            <option value="30days">30 derniers jours</option>
            <option value="7days">7 derniers jours</option>
            <option value="today">Aujourd'hui</option>
          </select>
          
          <Button variant="outline">
            Exporter CSV
          </Button>
        </div>
      </div>

      {!hasData ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune donnée disponible
          </h3>
          <p className="text-gray-600 mb-6">
            Les rapports s'afficheront une fois que vous aurez des réservations et des revenus.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Pour générer des rapports, assurez-vous d'avoir :</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Des <Link href="/admin/cities" className="text-blue-600 hover:underline">villes configurées</Link></p>
              <p>• Des <Link href="/admin/hotels" className="text-blue-600 hover:underline">hôtels partenaires</Link></p>
              <p>• Des <Link href="/admin/products" className="text-blue-600 hover:underline">produits disponibles</Link></p>
              <p>• Du <Link href="/admin/stock" className="text-blue-600 hover:underline">stock dans les hôtels</Link></p>
              <p>• Des réservations de clients</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-700 mb-2">Revenus totaux</h3>
              <p className="text-3xl font-bold text-green-600">
                {((revenueData?.totalRevenue || 0) / 100).toFixed(2)}€
              </p>
              <p className="text-sm text-gray-500 mt-1">Tous paiements Stripe</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-700 mb-2">Part EasyBaby</h3>
              <p className="text-3xl font-bold text-blue-600">
                {((revenueData?.easyBabyRevenue || 0) / 100).toFixed(2)}€
              </p>
              <p className="text-sm text-gray-500 mt-1">Commission plateforme</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-700 mb-2">Part Hôtels</h3>
              <p className="text-3xl font-bold text-purple-600">
                {((revenueData?.hotelsRevenue || 0) / 100).toFixed(2)}€
              </p>
              <p className="text-sm text-gray-500 mt-1">Revenus partenaires</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-700 mb-2">Réservations</h3>
              <p className="text-3xl font-bold text-orange-600">{revenueData?.totalReservations || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Total réservations</p>
            </div>
          </div>

          {/* Évolution mensuelle */}
          {revenueData?.monthlyData && revenueData.monthlyData.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-700 mb-4">Évolution mensuelle</h3>
              <div className="space-y-4">
                {revenueData.monthlyData.map((month, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <span className="font-medium">{month.month}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">{month.reservations} réservations</span>
                      <span className="font-bold">{(month.revenue / 100).toFixed(2)}€</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top produits */}
            {revenueData?.topProducts && revenueData.topProducts.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-700 mb-4">Produits populaires</h3>
                <div className="space-y-3">
                  {revenueData.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.reservations} réservations</p>
                      </div>
                      <p className="font-bold">{(product.revenue / 100).toFixed(2)}€</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top villes */}
            {revenueData?.topCities && revenueData.topCities.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-700 mb-4">Villes performantes</h3>
                <div className="space-y-3">
                  {revenueData.topCities.map((city, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{city.name}</p>
                        <p className="text-sm text-gray-600">{city.reservations} réservations</p>
                      </div>
                      <p className="font-bold">{(city.revenue / 100).toFixed(2)}€</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions rapides */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-4">Actions rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline">
                <Link href="/admin/reservations">
                  Voir toutes les réservations
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/hotels">
                  Gérer les hôtels partenaires
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/stock">
                  Optimiser le stock
                </Link>
              </Button>
            </div>
          </div>

          {/* Note sur les calculs */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
            <p><strong>💡 Note sur les calculs :</strong></p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Les revenus sont calculés à partir des paiements Stripe validés</li>
              <li>Le partage dépend des codes de réduction utilisés (70/30 ou 30/70)</li>
              <li>Les données sont mises à jour en temps réel</li>
              <li>Les exports incluent tous les détails pour la comptabilité</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
