"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PrerequisiteEmptyState, GrayEmptyState } from '@/components/admin/reusable-empty-states';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from "@/components/ui/dialog";

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
  discountCode?: {
    code: string;
    kind: "PLATFORM_70" | "HOTEL_70";
    active: boolean;
  };
  _count: {
    inventory: number;
    pickupReservations: number;
  };
  createdAt: string;
};

type City = {
  id: string;
  name: string;
};

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const fetchCities = async () => {
    try {
      const response = await fetch("/api/cities");
      if (response.ok) {
        const data = await response.json();
        setCities(data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des villes:", err);
    }
  };

  useEffect(() => {
    fetchHotels();
    fetchCities();
  }, []);

  const handleAddHotel = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const hotelData = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string || undefined,
      contactName: formData.get("contactName") as string || undefined,
      cityId: formData.get("cityId") as string,
    };

    try {
      const response = await fetch("/api/hotels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hotelData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création");
      }

      await fetchHotels(); // Refresh the list
      setIsAddDialogOpen(false);
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error("Erreur lors de la création de l'hôtel:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredHotels = hotels.filter((hotel) =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hôtels</h1>
          <p className="text-muted-foreground">Gérez les hôtels partenaires</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <p>Chargement des hôtels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hôtels</h1>
          <p className="text-muted-foreground">Gérez les hôtels partenaires</p>
        </div>
        <div className="text-center py-8 text-red-600">
          <p>Erreur : {error}</p>
          <Button onClick={() => fetchHotels()} className="mt-2">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hôtels</h1>
          <p className="text-muted-foreground">
            Gérez les hôtels partenaires qui proposeront vos équipements
          </p>
        </div>
        {cities.length > 0 ? (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Ajouter un hôtel</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" aria-describedby="hotel-dialog-description">
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel hôtel</DialogTitle>
              </DialogHeader>
              <div id="hotel-dialog-description" className="sr-only">
                Formulaire pour ajouter un nouvel hôtel partenaire avec informations de contact
              </div>
              <form onSubmit={handleAddHotel} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de l'hôtel *</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="ex: Hôtel Plaza Paris"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cityId">Ville *</Label>
                    <select 
                      id="cityId" 
                      name="cityId" 
                      required
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner une ville</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse complète *</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    placeholder="ex: 123 Rue de la Paix, 75001 Paris"
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email de contact *</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email"
                      placeholder="ex: contact@hotel-plaza.com"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel"
                      placeholder="ex: +33 1 23 45 67 89"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactName">Nom du contact</Label>
                  <Input 
                    id="contactName" 
                    name="contactName" 
                    placeholder="ex: Jean Dupont, Directeur"
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Après création :</strong> Vous pourrez configurer un code de réduction 
                    personnalisé pour cet hôtel et gérer son stock de produits.
                  </p>
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                      Annuler
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Création..." : "Créer l'hôtel"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/admin/cities">Créer une ville</Link>
            </Button>
            <Button disabled title="Créez d'abord une ville">
              Ajouter un hôtel
            </Button>
          </div>
        )}
      </div>

      {cities.length === 0 ? (
        <PrerequisiteEmptyState
          icon="🏙️"
          title="Aucune ville disponible"
          description="Vous devez d'abord créer au moins une ville avant de pouvoir ajouter des hôtels."
          buttonText="Créer une ville"
          buttonHref="/admin/cities"
        />
      ) : hotels.length === 0 ? (
        <GrayEmptyState
          icon="🏨"
          title="Aucun hôtel configuré"
          description="Ajoutez votre premier hôtel partenaire pour commencer à proposer vos services."
        >
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Ajouter mon premier hôtel</Button>
            </DialogTrigger>
          </Dialog>
        </GrayEmptyState>
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
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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
                  <th className="px-4 py-3 text-left text-sm font-medium">Code Réduction</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHotels.map((hotel) => (
                  <tr key={hotel.id} className="border-b">
                    <td className="px-4 py-3 text-sm font-medium">{hotel.name}</td>
                    <td className="px-4 py-3 text-sm">{hotel.city.name}</td>
                    <td className="px-4 py-3 text-sm">{hotel.email}</td>
                    <td className="px-4 py-3 text-sm">{hotel.contactName || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {hotel.discountCode ? (
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          hotel.discountCode.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {hotel.discountCode.code} ({hotel.discountCode.kind === 'HOTEL_70' ? 'Hôtel 70%' : 'Platform 70%'})
                        </span>
                      ) : (
                        <span className="text-gray-400">Aucun</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{hotel._count.inventory} produits</td>
                    <td className="px-4 py-3 text-sm">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/hotels/${hotel.id}`}>
                          Gérer
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
