"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UniversalAdminLayout, PageHeader, LoadingState, ErrorState, EmptyState } from "@/components/admin/universal-admin-layout";
import { Button } from "@/components/ui/button";

type DashboardStats = {
  reservationsCount: number;
  hotelsCount: number;
  productsCount: number;
  citiesCount: number;
  totalRevenueCents: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    // Récupérer les données de session admin
    try {
      const adminSession = localStorage.getItem("admin_session");
      if (adminSession) {
        const session = JSON.parse(adminSession);
        setAdminData({
          email: session.email,
          role: session.role
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la session admin", error);
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/dashboard/stats');
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          // Stats vides en cas d'erreur
          setStats({
            reservationsCount: 0,
            hotelsCount: 0,
            productsCount: 0,
            citiesCount: 0,
            totalRevenueCents: 0,
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des stats:", error);
        // Stats vides en cas d'erreur
        setStats({
          reservationsCount: 0,
          hotelsCount: 0,
          productsCount: 0,
          citiesCount: 0,
          totalRevenueCents: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // État de démarrage : tout est vide
  const isEmpty = stats && stats.citiesCount === 0 && stats.hotelsCount === 0 && stats.productsCount === 0;

  if (isLoading) {
    return (
      <LoadingState 
        title="Tableau de bord"
        subtitle={`Bienvenue, ${adminData?.email || 'admin@easybaby.io'}`}
        message="Chargement des statistiques..."
      />
    );
  }

  if (isEmpty) {
  return (
      <UniversalAdminLayout>
        <PageHeader 
          title="Tableau de bord"
          subtitle={`Bienvenue, ${adminData?.email || 'admin@easybaby.io'}`}
        />
        
        <div className="text-center py-12 mb-8">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bienvenue dans EasyBaby Admin !</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Votre plateforme est vide et prête à être configurée. Suivez ces étapes pour créer votre première configuration et recevoir vos premières réservations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Étape 1 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <div className="text-4xl mb-4">🏙️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Créer une ville</h3>
            <p className="text-gray-600 text-sm mb-4">
              Ajoutez votre première ville où les hôtels pourront proposer vos services
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/cities">Créer une ville</Link>
            </Button>
          </div>
          
          {/* Étape 2 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <div className="text-4xl mb-4">🏨</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Ajouter un hôtel</h3>
            <p className="text-gray-600 text-sm mb-4">
              Configurez votre premier hôtel partenaire avec ses informations
            </p>
            <Button disabled className="w-full">
              Après étape 1
            </Button>
          </div>
          
          {/* Étape 3 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Créer des produits</h3>
            <p className="text-gray-600 text-sm mb-4">
              Ajoutez les équipements bébé disponibles à la location
            </p>
            <Button disabled className="w-full">
              Après étape 2
            </Button>
          </div>
          
          {/* Étape 4 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Gérer le stock</h3>
            <p className="text-gray-600 text-sm mb-4">
              Assignez les produits aux hôtels et gérez les quantités
            </p>
            <Button disabled className="w-full">
              Après étape 3
            </Button>
          </div>
        </div>
            
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-700">
            💡 <strong>Conseil :</strong> Une fois ces étapes terminées, vos clients pourront réserver des équipements sur votre site user !
          </p>
        </div>
      </UniversalAdminLayout>
    );
  }

  // Affichage des stats quand il y a des données
  return (
    <UniversalAdminLayout>
      <PageHeader 
        title="Tableau de bord"
        subtitle={`Bienvenue, ${adminData?.email || 'admin@easybaby.io'}`}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Villes</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.citiesCount}</p>
            </div>
            <div className="text-3xl">🏙️</div>
          </div>
            </div>
            
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Hôtels</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.hotelsCount}</p>
            </div>
            <div className="text-3xl">🏨</div>
          </div>
            </div>
            
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Produits</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.productsCount}</p>
            </div>
            <div className="text-3xl">📦</div>
          </div>
            </div>
            
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Réservations</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.reservationsCount}</p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </div>
      </div>

      {stats?.totalRevenueCents ? (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenus</h3>
          <div className="text-3xl font-bold text-green-600">
            {(stats.totalRevenueCents / 100).toFixed(2)}€
          </div>
          <p className="text-sm text-gray-600 mt-2">Revenus totaux générés</p>
        </div>
      ) : null}
    </UniversalAdminLayout>
  );
}