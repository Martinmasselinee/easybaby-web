"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type DashboardStats = {
  cities: number;
  hotels: number;
  products: number;
  reservations: number;
  revenue: number;
  revenueEasyBaby: number;
  revenueHotels: number;
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

    // Récupérer les statistiques
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          // Si l'API n'existe pas encore ou retourne une erreur, utiliser des stats vides
          setStats({
            cities: 0,
            hotels: 0,
            products: 0,
            reservations: 0,
            revenue: 0,
            revenueEasyBaby: 0,
            revenueHotels: 0
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
        // Stats vides en cas d'erreur
        setStats({
          cities: 0,
          hotels: 0,
          products: 0,
          reservations: 0,
          revenue: 0,
          revenueEasyBaby: 0,
          revenueHotels: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // État de démarrage : tout est vide
  const isEmpty = stats && stats.cities === 0 && stats.hotels === 0 && stats.products === 0;

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>
        <div className="flex items-center justify-center py-8">
          <p>Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
        {adminData && (
          <p className="text-muted-foreground">
            Bienvenue, {adminData.email}
          </p>
        )}
      </div>

      {isEmpty ? (
        // État vide : première utilisation
        <div className="text-center py-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Bienvenue dans EasyBaby Admin ! 🎉
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Votre plateforme est vide et prête à être configurée. 
            Suivez ces étapes pour créer votre première configuration et recevoir vos premières réservations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-3xl mb-4">🏙️</div>
              <h3 className="font-semibold mb-2">1. Créer une ville</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ajoutez votre première ville où les hôtels pourront proposer vos services
              </p>
              <Button asChild size="sm" className="w-full">
                <Link href="/admin/cities">Créer une ville</Link>
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border opacity-60">
              <div className="text-3xl mb-4">🏨</div>
              <h3 className="font-semibold mb-2">2. Ajouter un hôtel</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configurez votre premier hôtel partenaire avec ses informations
              </p>
              <Button disabled size="sm" className="w-full">
                Après étape 1
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border opacity-60">
              <div className="text-3xl mb-4">📦</div>
              <h3 className="font-semibold mb-2">3. Créer des produits</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ajoutez les équipements bébé disponibles à la location
              </p>
              <Button disabled size="sm" className="w-full">
                Après étape 2
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border opacity-60">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="font-semibold mb-2">4. Gérer le stock</h3>
              <p className="text-sm text-gray-600 mb-4">
                Assignez les produits aux hôtels et gérez les quantités
              </p>
              <Button disabled size="sm" className="w-full">
                Après étape 3
              </Button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-2xl mx-auto">
            <p className="text-sm text-blue-800">
              💡 <strong>Conseil :</strong> Une fois ces étapes terminées, 
              vos clients pourront réserver des équipements sur votre site user !
            </p>
          </div>
        </div>
      ) : (
        // État avec données : tableau de bord opérationnel
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-700 mb-2">Revenus totaux</h3>
              <p className="text-3xl font-bold text-green-600">{(stats!.revenue / 100).toFixed(2)}€</p>
              <p className="text-sm text-gray-500 mt-1">Tous paiements confondus</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-700 mb-2">Part EasyBaby</h3>
              <p className="text-3xl font-bold text-blue-600">{(stats!.revenueEasyBaby / 100).toFixed(2)}€</p>
              <p className="text-sm text-gray-500 mt-1">Commission plateforme</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-700 mb-2">Part Hôtels</h3>
              <p className="text-3xl font-bold text-purple-600">{(stats!.revenueHotels / 100).toFixed(2)}€</p>
              <p className="text-sm text-gray-500 mt-1">Revenus partenaires</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-700 mb-2">Réservations</h3>
              <p className="text-3xl font-bold text-orange-600">{stats!.reservations}</p>
              <p className="text-sm text-gray-500 mt-1">Total réservations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/admin/cities" className="bg-white p-6 rounded-lg shadow-sm border hover:bg-gray-50 block">
              <h3 className="font-semibold text-gray-700 mb-2">Villes</h3>
              <p className="text-2xl font-bold text-indigo-600">{stats!.cities}</p>
              <p className="text-sm text-gray-500 mt-1">Villes configurées</p>
              <p className="text-xs text-blue-600 mt-2">Gérer →</p>
            </Link>
            
            <Link href="/admin/hotels" className="bg-white p-6 rounded-lg shadow-sm border hover:bg-gray-50 block">
              <h3 className="font-semibold text-gray-700 mb-2">Hôtels</h3>
              <p className="text-2xl font-bold text-green-600">{stats!.hotels}</p>
              <p className="text-sm text-gray-500 mt-1">Hôtels partenaires</p>
              <p className="text-xs text-blue-600 mt-2">Gérer →</p>
            </Link>
            
            <Link href="/admin/products" className="bg-white p-6 rounded-lg shadow-sm border hover:bg-gray-50 block">
              <h3 className="font-semibold text-gray-700 mb-2">Produits</h3>
              <p className="text-2xl font-bold text-pink-600">{stats!.products}</p>
              <p className="text-sm text-gray-500 mt-1">Produits disponibles</p>
              <p className="text-xs text-blue-600 mt-2">Gérer →</p>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/admin/reservations" className="bg-white p-6 rounded-lg shadow-sm border hover:bg-gray-50 block">
              <h3 className="font-semibold text-gray-700 mb-2">Dernières réservations</h3>
              <p className="text-sm text-gray-600">Gérer toutes les réservations et voir les détails</p>
              <p className="text-xs text-blue-600 mt-2">Voir toutes →</p>
            </Link>
            
            <Link href="/admin/stock" className="bg-white p-6 rounded-lg shadow-sm border hover:bg-gray-50 block">
              <h3 className="font-semibold text-gray-700 mb-2">Gestion du stock</h3>
              <p className="text-sm text-gray-600">Suivre les disponibilités par hôtel</p>
              <p className="text-xs text-blue-600 mt-2">Gérer stock →</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
