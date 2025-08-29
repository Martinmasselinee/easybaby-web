"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  AdminPageLayout, 
  LoadingState, 
  ErrorState, 
  AdminStatsCard,
  AdminCard,
  AdminEmptyState,
  PrimaryButton,
  ActionButton
} from "@/components/admin/design-system";
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
    return <LoadingState />;
  }

  if (isEmpty) {
    return (
      <AdminPageLayout
        title="Tableau de bord"
        subtitle={`Bienvenue, ${adminData?.email || 'admin@easybaby.io'}`}
      >
        <AdminEmptyState
          icon="🎉"
          title="Bienvenue dans EasyBaby Admin !"
          description="Votre plateforme est vide et prête à être configurée. Suivez ces étapes pour créer votre première configuration et recevoir vos premières réservations."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <AdminCard title="1. Créer une ville" className="text-center">
            <div className="text-4xl mb-4">🏙️</div>
            <p className="text-gray-600 text-sm mb-4">
              Ajoutez votre première ville où les hôtels pourront proposer vos services
            </p>
            <PrimaryButton variant="create" href="/admin/cities">
              Créer une ville
            </PrimaryButton>
          </AdminCard>
          
          <AdminCard title="2. Ajouter un hôtel" className="text-center">
            <div className="text-4xl mb-4">🏨</div>
            <p className="text-gray-600 text-sm mb-4">
              Configurez votre premier hôtel partenaire avec ses informations
            </p>
            <Button disabled className="w-full">
              Après étape 1
            </Button>
          </AdminCard>
          
          <AdminCard title="3. Créer des produits" className="text-center">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-gray-600 text-sm mb-4">
              Ajoutez les équipements bébé disponibles à la location
            </p>
            <Button disabled className="w-full">
              Après étape 2
            </Button>
          </AdminCard>
          
          <AdminCard title="4. Gérer le stock" className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-600 text-sm mb-4">
              Assignez les produits aux hôtels et gérez les quantités
            </p>
            <Button disabled className="w-full">
              Après étape 3
            </Button>
          </AdminCard>
        </div>
            
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center mt-6">
          <p className="text-sm text-blue-700">
            💡 <strong>Conseil :</strong> Une fois ces étapes terminées, vos clients pourront réserver des équipements sur votre site user !
          </p>
        </div>
      </AdminPageLayout>
    );
  }

  // Affichage des stats quand il y a des données
  return (
    <AdminPageLayout
      title="Tableau de bord"
      subtitle={`Bienvenue, ${adminData?.email || 'admin@easybaby.io'}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatsCard title="Villes" value={stats?.citiesCount || 0} icon="🏙️" />
        <AdminStatsCard title="Hôtels" value={stats?.hotelsCount || 0} icon="🏨" />
        <AdminStatsCard title="Produits" value={stats?.productsCount || 0} icon="📦" />
        <AdminStatsCard title="Réservations" value={stats?.reservationsCount || 0} icon="📅" />
      </div>

      {stats?.totalRevenueCents ? (
        <AdminCard title="Revenus totaux" className="mt-6">
          <div className="text-3xl font-bold text-green-600">
            {(stats.totalRevenueCents / 100).toFixed(2)}€
          </div>
          <p className="text-sm text-gray-600 mt-2">Revenus totaux générés</p>
        </AdminCard>
      ) : null}
    </AdminPageLayout>
  );
}