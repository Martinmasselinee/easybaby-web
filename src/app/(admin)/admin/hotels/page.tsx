"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type Hotel = {
  id: string;
  name: string;
  address: string;
  email: string;
  phone?: string;
  contactName?: string;
  city: {
    id: string;
    name: string;
  };
};

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Charger les hôtels depuis l'API
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch("/api/hotels");
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        setHotels(data);
      } catch (err: any) {
        console.error("Erreur lors du chargement des hôtels:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const filteredHotels = hotels.filter((hotel) =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hôtels</h1>
          <p className="text-muted-foreground">
            Gérez les hôtels partenaires
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/hotels/new">Ajouter un hôtel</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner />
          <span className="ml-2">Chargement des hôtels...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">
          <p>Erreur : {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-2">
            Réessayer
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Rechercher un hôtel..."
                className="w-full rounded-md border px-4 py-2 pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="border rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium">Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Ville</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHotels.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      {hotels.length === 0 ? "Aucun hôtel trouvé. Créez votre premier hôtel !" : "Aucun hôtel ne correspond à votre recherche."}
                    </td>
                  </tr>
                ) : (
                  filteredHotels.map((hotel) => (
                    <tr key={hotel.id} className="border-b">
                      <td className="px-4 py-3 text-sm font-medium">{hotel.name}</td>
                      <td className="px-4 py-3 text-sm">{hotel.city.name}</td>
                      <td className="px-4 py-3 text-sm">{hotel.email}</td>
                      <td className="px-4 py-3 text-sm">{hotel.contactName || 'Non défini'}</td>
                      <td className="px-4 py-3 text-sm">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/hotels/${hotel.id}`}>
                            Gérer
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}