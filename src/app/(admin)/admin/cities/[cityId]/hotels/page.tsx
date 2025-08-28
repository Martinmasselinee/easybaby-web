"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotification } from "@/components/ui/notification";
import { ButtonSpinner, Spinner } from "@/components/ui/spinner";

type City = {
  id: string;
  name: string;
  slug: string;
};

type Hotel = {
  id: string;
  name: string;
  address: string;
  email: string;
  phone?: string;
  contactName?: string;
  discountCode?: {
    code: string;
    kind: string;
  };
};

export default function CityHotelsPage({
  params,
}: {
  params: { cityId: string };
}) {
  const router = useRouter();
  const [city, setCity] = useState<City | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification, NotificationsContainer } = useNotification();

  // Charger les données de la ville
  useEffect(() => {
    const fetchCityData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Charger les infos de la ville
        const cityResponse = await fetch(`/api/cities/${params.cityId}`);
        if (!cityResponse.ok) {
          throw new Error(`Erreur lors du chargement de la ville: ${cityResponse.status}`);
        }
        const cityData = await cityResponse.json();
        setCity(cityData);

        // Charger les hôtels de cette ville
        const hotelsResponse = await fetch(`/api/hotels/city/${params.cityId}`);
        if (!hotelsResponse.ok) {
          throw new Error(`Erreur lors du chargement des hôtels: ${hotelsResponse.status}`);
        }
        const hotelsData = await hotelsResponse.json();
        setHotels(hotelsData);
      } catch (err: any) {
        console.error("Erreur lors du chargement:", err);
        setError(err.message || "Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCityData();
  }, [params.cityId]);

  // Ajouter un hôtel
  const handleAddHotel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const hotelData = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      contactName: formData.get("contactName") as string,
      cityId: params.cityId, // Ville automatiquement déterminée
    };

    setIsSubmitting(true);
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
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const newHotel = await response.json();
      setHotels(prev => [...prev, newHotel]);
      setIsAddDialogOpen(false);
      showNotification("success", `L'hôtel ${hotelData.name} a été créé avec succès.`);
      
      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.error("Erreur lors de la création de l'hôtel:", err);
      setError(err.message || "Une erreur est survenue lors de la création de l'hôtel.");
      showNotification("error", err.message || "Une erreur est survenue lors de la création de l'hôtel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  if (error && !city) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Erreur</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button asChild>
          <Link href="/admin/cities">Retour aux villes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <NotificationsContainer />
      
      {/* Breadcrumbs */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              href="/admin/cities"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Villes
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                {city?.name || "Ville"} - Hôtels
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Hôtels - {city?.name}
          </h1>
          <p className="text-muted-foreground">
            {hotels.length} hôtel{hotels.length > 1 ? 's' : ''} dans cette ville
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Ajouter un hôtel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Ajouter un hôtel à {city?.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddHotel} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom de l'hôtel *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Nom de l'hôtel"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="contact@hotel.com"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Adresse complète *</Label>
                <Input
                  id="address"
                  name="address"
                  required
                  placeholder="123 Rue Example, 75001 Paris"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                <div>
                  <Label htmlFor="contactName">Nom du contact</Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <ButtonSpinner /> : "Créer l'hôtel"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des hôtels */}
      {hotels.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <div className="flex flex-col items-center space-y-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0v-2a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Aucun hôtel dans cette ville
              </h3>
              <p className="text-gray-500">
                Commencez par ajouter le premier hôtel de {city?.name}.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Adresse</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Code promo</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((hotel) => (
                <tr key={hotel.id} className="border-b">
                  <td className="px-4 py-3 text-sm font-medium">{hotel.name}</td>
                  <td className="px-4 py-3 text-sm">{hotel.address}</td>
                  <td className="px-4 py-3 text-sm">
                    <div>
                      <div className="font-medium">{hotel.contactName || hotel.email}</div>
                      {hotel.contactName && (
                        <div className="text-gray-500 text-xs">{hotel.email}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {hotel.discountCode ? (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {hotel.discountCode.code}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Aucun</span>
                    )}
                  </td>
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
      )}
    </div>
  );
}
