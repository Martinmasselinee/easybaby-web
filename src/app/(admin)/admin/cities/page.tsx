"use client";

import { useState, useEffect } from "react";
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

type City = {
  id: string;
  name: string;
  slug: string;
  _count: {
    hotels: number;
  };
  createdAt: string;
};

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/cities");
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      setCities(data);
    } catch (err: any) {
      console.error("Erreur lors du chargement des villes:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
      .replace(/\s+/g, "-") // Replace spaces with dashes
      .replace(/-+/g, "-") // Replace multiple dashes with single
      .trim();
  };

  const handleAddCity = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string || generateSlug(name);

    try {
      const response = await fetch("/api/cities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création");
      }

      await fetchCities(); // Refresh the list
      setIsAddDialogOpen(false);
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error("Erreur lors de la création de la ville:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCity = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentCity) return;

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;

    try {
      const response = await fetch(`/api/cities/${currentCity.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la modification");
      }

      await fetchCities(); // Refresh the list
      setIsEditDialogOpen(false);
      setCurrentCity(null);
    } catch (error: any) {
      console.error("Erreur lors de la modification de la ville:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCity = async (cityId: string, cityName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la ville "${cityName}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/cities/${cityId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la suppression");
      }

      await fetchCities(); // Refresh the list
    } catch (error: any) {
      console.error("Erreur lors de la suppression de la ville:", error);
      alert(`Erreur: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Villes</h1>
          <p className="text-muted-foreground">Gérez les villes disponibles</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <p>Chargement des villes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Villes</h1>
          <p className="text-muted-foreground">Gérez les villes disponibles</p>
        </div>
        <div className="text-center py-8 text-red-600">
          <p>Erreur : {error}</p>
          <Button onClick={() => fetchCities()} className="mt-2">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Villes</h1>
          <p className="text-muted-foreground">
            Gérez les villes où vos partenaires hôteliers proposent vos services
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Ajouter une ville</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle ville</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCity} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Nom de la ville</Label>
                <Input 
                  id="add-name" 
                  name="name" 
                  placeholder="ex: Paris, Lyon, Marseille..."
                  required 
                  onChange={(e) => {
                    const slugInput = document.getElementById("add-slug") as HTMLInputElement;
                    if (slugInput) {
                      slugInput.value = generateSlug(e.target.value);
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-slug">Slug URL (généré automatiquement)</Label>
                <Input 
                  id="add-slug" 
                  name="slug" 
                  placeholder="ex: paris, lyon, marseille..."
                  pattern="^[a-z0-9-]+$"
                  title="Uniquement lettres minuscules, chiffres et tirets"
                />
                <p className="text-xs text-gray-500">
                  Utilisé dans l'URL : /fr/city/[slug]
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    Annuler
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Création..." : "Créer la ville"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {cities.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune ville configurée
          </h3>
          <p className="text-gray-600 mb-6">
            Créez votre première ville pour commencer à configurer votre plateforme.
            Les clients pourront ensuite sélectionner cette ville pour réserver des équipements.
          </p>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Créer ma première ville</Button>
            </DialogTrigger>
          </Dialog>
        </div>
      ) : (
        <div className="border rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Slug</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Hôtels</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Créée le</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((city) => (
                <tr key={city.id} className="border-b">
                  <td className="px-4 py-3 text-sm font-medium">{city.name}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{city.slug}</td>
                  <td className="px-4 py-3 text-sm">{city._count.hotels}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(city.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentCity(city);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCity(city.id, city.name)}
                      disabled={city._count.hotels > 0}
                      title={city._count.hotels > 0 ? "Impossible de supprimer : des hôtels sont associés à cette ville" : "Supprimer cette ville"}
                    >
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la ville</DialogTitle>
          </DialogHeader>
          {currentCity && (
            <form onSubmit={handleEditCity} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom de la ville</Label>
                <Input 
                  id="edit-name" 
                  name="name" 
                  defaultValue={currentCity.name}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug URL</Label>
                <Input 
                  id="edit-slug" 
                  name="slug" 
                  defaultValue={currentCity.slug}
                  pattern="^[a-z0-9-]+$"
                  title="Uniquement lettres minuscules, chiffres et tirets"
                  required
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    Annuler
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Modification..." : "Modifier"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
