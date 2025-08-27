"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotification } from "@/components/ui/notification";
import { ButtonSpinner, Spinner } from "@/components/ui/spinner";

type City = {
  id: string;
  name: string;
  slug: string;
  _count?: {
    hotels: number;
  };
};

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification, NotificationsContainer } = useNotification();

  // Fonction pour charger les villes
  const fetchCities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/cities");
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      setCities(data);
    } catch (err) {
      console.error("Erreur lors du chargement des villes:", err);
      setError("Impossible de charger les villes. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les villes au chargement de la page
  useEffect(() => {
    fetchCities();
  }, []);

  // Fonction pour créer une ville
  const handleAddCity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/cities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, slug }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      // Recharger les villes après l'ajout
      fetchCities();
      setIsAddDialogOpen(false);
      showNotification("success", `La ville ${name} a été créée avec succès.`);
    } catch (err: any) {
      console.error("Erreur lors de la création de la ville:", err);
      setError(err.message || "Une erreur est survenue lors de la création de la ville.");
      showNotification("error", err.message || "Une erreur est survenue lors de la création de la ville.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour mettre à jour une ville
  const handleEditCity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentCity) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/cities/${currentCity.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, slug }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      // Recharger les villes après la mise à jour
      fetchCities();
      setIsEditDialogOpen(false);
      showNotification("success", `La ville ${name} a été mise à jour avec succès.`);
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour de la ville:", err);
      setError(err.message || "Une erreur est survenue lors de la mise à jour de la ville.");
      showNotification("error", err.message || "Une erreur est survenue lors de la mise à jour de la ville.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour supprimer une ville
  const handleDeleteCity = async () => {
    if (!currentCity) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/cities/${currentCity.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      // Recharger les villes après la suppression
      const cityName = currentCity.name;
      fetchCities();
      setIsDeleteDialogOpen(false);
      showNotification("success", `La ville ${cityName} a été supprimée avec succès.`);
    } catch (err: any) {
      console.error("Erreur lors de la suppression de la ville:", err);
      setError(err.message || "Une erreur est survenue lors de la suppression de la ville.");
      showNotification("error", err.message || "Une erreur est survenue lors de la suppression de la ville.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrer les villes selon le terme de recherche
  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    city.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <NotificationsContainer />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Villes</h1>
          <p className="text-muted-foreground">
            Gérez les villes disponibles sur la plateforme
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Ajouter une ville
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une ville</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCity} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input 
                  id="slug" 
                  name="slug" 
                  required 
                  placeholder="ex: paris"
                />
                <p className="text-xs text-muted-foreground">
                  Le slug doit être unique et ne contenir que des lettres minuscules, des chiffres et des tirets.
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Annuler</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <ButtonSpinner />}
                  Ajouter
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher une ville..."
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

        {isLoading ? (
          <div className="text-center py-8 flex flex-col items-center">
            <div className="mb-4">
              <Spinner size="lg" />
            </div>
            <p>Chargement des villes...</p>
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-muted-foreground">Aucune ville trouvée</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium">Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Slug</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Hôtels</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCities.map((city) => (
                  <tr key={city.id} className="border-b">
                    <td className="px-4 py-3 text-sm font-medium">{city.name}</td>
                    <td className="px-4 py-3 text-sm">{city.slug}</td>
                    <td className="px-4 py-3 text-sm">{city._count?.hotels || 0}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        <Dialog open={isEditDialogOpen && currentCity?.id === city.id} onOpenChange={(open) => {
                          setIsEditDialogOpen(open);
                          if (!open) setCurrentCity(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setCurrentCity(city)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Modifier la ville</DialogTitle>
                            </DialogHeader>
                            {currentCity && (
                              <form onSubmit={handleEditCity} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">Nom</Label>
                                  <Input 
                                    id="edit-name" 
                                    name="name" 
                                    defaultValue={currentCity.name} 
                                    required 
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-slug">Slug (URL)</Label>
                                  <Input 
                                    id="edit-slug" 
                                    name="slug" 
                                    defaultValue={currentCity.slug} 
                                    required 
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Le slug doit être unique et ne contenir que des lettres minuscules, des chiffres et des tirets.
                                  </p>
                                </div>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button type="button" variant="outline">Annuler</Button>
                                  </DialogClose>
                                  <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <ButtonSpinner />}
                                    Enregistrer
                                  </Button>
                                </DialogFooter>
                              </form>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog open={isDeleteDialogOpen && currentCity?.id === city.id} onOpenChange={(open) => {
                          setIsDeleteDialogOpen(open);
                          if (!open) setCurrentCity(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-800"
                              onClick={() => setCurrentCity(city)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Supprimer la ville</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              <p>Êtes-vous sûr de vouloir supprimer cette ville ?</p>
                              <p className="font-medium mt-2">{currentCity?.name}</p>
                              {(currentCity?._count?.hotels || 0) > 0 && (
                                <p className="text-red-600 mt-2">
                                  Attention : Cette ville contient {currentCity?._count?.hotels} hôtel(s). La suppression échouera si des hôtels y sont associés.
                                </p>
                              )}
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button type="button" variant="outline">Annuler</Button>
                              </DialogClose>
                              <Button 
                                variant="destructive" 
                                onClick={handleDeleteCity}
                                disabled={isSubmitting}
                              >
                                {isSubmitting && <ButtonSpinner />}
                                Supprimer
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
