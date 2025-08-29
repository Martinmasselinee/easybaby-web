"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UniversalAdminLayout, PageHeader, LoadingState, ErrorState } from '@/components/admin/universal-admin-layout';
import { PrerequisiteEmptyState, GrayEmptyState, TableWrapper, TABLE_STYLES } from '@/components/admin/reusable-empty-states';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, MapPin } from 'lucide-react';
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
      <LoadingState 
        title="Hôtels"
        subtitle="Gérez les hôtels partenaires qui proposeront vos équipements"
        message="Chargement des hôtels..."
      />
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Hôtels"
        subtitle="Gérez les hôtels partenaires qui proposeront vos équipements"
        error={error}
        onRetry={fetchHotels}
      />
    );
  }

  return (
    <UniversalAdminLayout>
      <PageHeader 
        title="Hôtels"
        subtitle="Gérez les hôtels partenaires qui proposeront vos équipements"
        actions={
          <div className="flex space-x-3">
            <Button asChild variant="outline">
              <Link href="/admin/cities">
                <MapPin className="h-4 w-4 mr-2" />
                Ajouter une ville
              </Link>
            </Button>
            {cities.length > 0 ? (
              <Button onClick={() => setIsAddDialogOpen(true)}>Ajouter un hôtel</Button>
            ) : (
              <Button disabled title="Créez d'abord une ville">
                Ajouter un hôtel
              </Button>
            )}
          </div>
        }
      />

      {cities.length === 0 ? (
        <PrerequisiteEmptyState
          icon="🏙️"
          title="Aucune ville disponible"
          description="Vous devez d'abord créer au moins une ville avant de pouvoir ajouter des hôtels partenaires."
          buttonText="Créer une ville"
          buttonHref="/admin/cities"
        />
      ) : filteredHotels.length === 0 ? (
        <GrayEmptyState
          icon="🏨"
          title="Aucun hôtel"
          description="Créez votre premier hôtel partenaire pour commencer à proposer vos équipements bébé."
        >
          <Button onClick={() => setIsAddDialogOpen(true)}>
            Ajouter votre premier hôtel
          </Button>
        </GrayEmptyState>
      ) : (
        <>
          <div className="mb-4">
            <Input
              placeholder="Rechercher par nom d'hôtel, ville ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          <TableWrapper>
            <table className={TABLE_STYLES.table}>
              <thead className={TABLE_STYLES.thead}>
                <tr>
                  <th className={TABLE_STYLES.th}>Nom</th>
                  <th className={TABLE_STYLES.th}>Ville</th>
                  <th className={TABLE_STYLES.th}>Email</th>
                  <th className={TABLE_STYLES.th}>Stock</th>
                  <th className={TABLE_STYLES.th}>Réservations</th>
                  <th className={TABLE_STYLES.th}>Actions</th>
                </tr>
              </thead>
              <tbody className={TABLE_STYLES.tbody}>
                {filteredHotels.map((hotel) => (
                  <tr key={hotel.id} className={TABLE_STYLES.tr}>
                    <td className={TABLE_STYLES.td}>{hotel.name}</td>
                    <td className={TABLE_STYLES.tdSecondary}>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {hotel.city.name}
                      </div>
                    </td>
                    <td className={TABLE_STYLES.tdSecondary}>{hotel.email}</td>
                    <td className={TABLE_STYLES.tdSecondary}>
                      {hotel._count?.inventory || 0} produits
                    </td>
                    <td className={TABLE_STYLES.tdSecondary}>
                      {hotel._count?.pickupReservations || 0} réservations
                    </td>
                    <td className={TABLE_STYLES.actions}>
                      <div className="flex justify-end space-x-2">
                        <Link href={`/admin/hotels/${hotel.id}`}>
                          <Button variant="outline" size="sm" className="border-gray-200">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrapper>
        </>
      )}
      
      {/* Dialog pour création hôtel */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
              <Label htmlFor="address">Adresse *</Label>
              <Input 
                id="address" 
                name="address" 
                placeholder="ex: 123 Rue de la Paix, 75001 Paris"
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  placeholder="ex: contact@hotelplaza.com"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  placeholder="ex: +33 1 23 45 67 89"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName">Nom du contact</Label>
              <Input 
                id="contactName" 
                name="contactName" 
                placeholder="ex: Jean Dupont"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Annuler</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Création...' : 'Créer l\'hôtel'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </UniversalAdminLayout>
  );
}