'use client';

import { useState, useEffect } from 'react';
import { UniversalAdminLayout, PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/admin/universal-admin-layout';
import { YellowEmptyState } from '@/components/admin/reusable-empty-states';
import { Button } from '@/components/ui/button';

interface RevenueData {
  totalRevenue: number;
  easyBabyRevenue: number;
  hotelsRevenue: number;
  totalReservations: number;
}

export default function ReportsPage() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/admin/dashboard/stats');
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setRevenueData({
        totalRevenue: data.totalRevenueCents || 0,
        easyBabyRevenue: Math.floor((data.totalRevenueCents || 0) * 0.7),
        hotelsRevenue: Math.floor((data.totalRevenueCents || 0) * 0.3),
        totalReservations: data.reservationsCount || 0,
      });
    } catch (err: any) {
      console.error('Erreur lors du chargement des rapports:', err);
      setError(err.message);
      setRevenueData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (isLoading) {
    return (
      <LoadingState 
        title="Rapports"
        message="Chargement des rapports financiers..."
      />
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Rapports"
        error={error}
        onRetry={fetchReports}
      />
    );
  }

  const isEmpty = !revenueData || revenueData.totalReservations === 0;

  return (
    <UniversalAdminLayout>
      <PageHeader 
        title="Rapports"
        subtitle="Analyse financière et statistiques de performance"
        actions={
          <Button 
            onClick={fetchReports}
            variant="outline"
          >
            Actualiser
          </Button>
        }
      />

      {isEmpty ? (
        <YellowEmptyState
          icon="📊"
          title="Aucune donnée disponible"
          description="Les rapports financiers et statistiques apparaîtront ici une fois que vous aurez des réservations confirmées et payées."
        >
          <Button onClick={fetchReports} variant="outline">
            Actualiser
          </Button>
        </YellowEmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenus */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Revenus Totaux</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(revenueData!.totalRevenue / 100).toFixed(2)}€
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          {/* EasyBaby (70%) */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">EasyBaby (70%)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(revenueData!.easyBabyRevenue / 100).toFixed(2)}€
                </p>
              </div>
              <div className="text-3xl">🏢</div>
            </div>
          </div>

          {/* Hôtels (30%) */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Hôtels (30%)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(revenueData!.hotelsRevenue / 100).toFixed(2)}€
                </p>
              </div>
              <div className="text-3xl">🏨</div>
            </div>
          </div>

          {/* Réservations */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Réservations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {revenueData!.totalReservations}
                </p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </div>
        </div>
      )}
    </UniversalAdminLayout>
  );
}