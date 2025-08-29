'use client';

import { useState, useEffect } from 'react';
import { UniversalAdminLayout, PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/admin/universal-admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from '@/components/ui/dialog';

interface City {
  id: string;
  name: string;
  slug: string;
  _count: {
    hotels: number;
  };
}

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/cities');
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setCities(data || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des villes:', err);
      setError(err.message);
      setCities([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  if (isLoading) {
    return (
      <LoadingState 
        title="Villes"
        message="Chargement des villes..."
      />
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Villes"
        error={error}
        onRetry={fetchCities}
      />
    );
  }

  return (
    <UniversalAdminLayout>
      <PageHeader 
        title="Villes"
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>Ajouter une ville</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle ville</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom de la ville</Label>
                  <Input id="name" placeholder="Ex: Paris" />
                </div>
                <div>
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input id="slug" placeholder="Ex: paris" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button>Créer la ville</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      {cities.length === 0 ? (
        <div className="text-center py-16 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-6xl mb-4">🏙️</div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Aucune ville configurée
          </h3>
          <p className="text-blue-800 mb-6 max-w-md mx-auto">
            Commencez par créer votre première ville. C'est le point de départ pour configurer vos hôtels partenaires et leurs équipements.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Créer votre première ville</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle ville</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom de la ville</Label>
                  <Input id="name" placeholder="Ex: Paris" />
                </div>
                <div>
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input id="slug" placeholder="Ex: paris" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button>Créer la ville</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hôtels
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cities.map((city) => (
                  <tr key={city.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {city.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {city.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {city._count?.hotels || 0} hôtels
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-gray-600 hover:text-gray-900">
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </UniversalAdminLayout>
  );
}