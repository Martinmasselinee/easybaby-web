"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [adminData, setAdminData] = useState<{
    email: string;
    role: string;
  } | null>(null);

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
      
      {adminData ? (
        <div className="border border-gray-200 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Bienvenue, {adminData.email}</h2>
          <p className="text-gray-600 mb-2">Rôle: {adminData.role}</p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="border border-gray-200 p-4 rounded-lg">
              <h3 className="font-semibold text-black">Réservations</h3>
              <p className="text-2xl font-bold mt-2">0</p>
              <p className="text-sm text-gray-500 mt-1">Total des réservations</p>
            </div>
            
            <div className="border border-gray-200 p-4 rounded-lg">
              <h3 className="font-semibold text-black">Revenus</h3>
              <p className="text-2xl font-bold mt-2">0 €</p>
              <p className="text-sm text-gray-500 mt-1">Revenus totaux</p>
            </div>
            
            <div className="border border-gray-200 p-4 rounded-lg">
              <h3 className="font-semibold text-black">Produits</h3>
              <p className="text-2xl font-bold mt-2">0</p>
              <p className="text-sm text-gray-500 mt-1">Produits disponibles</p>
            </div>
            
            <div className="border border-gray-200 p-4 rounded-lg">
              <h3 className="font-semibold text-black">Hôtels</h3>
              <p className="text-2xl font-bold mt-2">0</p>
              <p className="text-sm text-gray-500 mt-1">Hôtels partenaires</p>
            </div>
            
            <div className="border border-gray-200 p-4 rounded-lg">
              <h3 className="font-semibold text-black">Villes</h3>
              <p className="text-2xl font-bold mt-2">0</p>
              <p className="text-sm text-gray-500 mt-1">Villes disponibles</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 p-4 rounded-lg">
          <p className="text-gray-700">Chargement des données...</p>
        </div>
      )}
    </div>
  );
}