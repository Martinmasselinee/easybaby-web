'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UniversalAdminLayout, PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/admin/universal-admin-layout';
import { NoCitiesEmptyState, TableWrapper } from '@/components/admin/reusable-empty-states';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, ArrowLeft } from 'lucide-react';
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '' });

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

  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création');
      }

      // Succès - fermer dialog et rafraîchir
      setIsAddDialogOpen(false);
      setFormData({ name: '', slug: '' });
      await fetchCities(); // Recharger la liste

    } catch (err: any) {
      console.error('Erreur création ville:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateDialog = () => {
    setFormData({ name: '', slug: '' });
    setIsAddDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    const newFormData = { ...formData, name };
    // Auto-générer le slug si il est vide ou correspondait au nom précédent
    if (!formData.slug || formData.slug === generateSlug(formData.name)) {
      newFormData.slug = generateSlug(name);
    }
    setFormData(newFormData);
  };

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
          <div className="flex space-x-3">
            <Button asChild variant="outline">
              <Link href="/admin/hotels">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux hôtels
              </Link>
            </Button>
            <Button onClick={openCreateDialog}>Ajouter une ville</Button>
          </div>
        }
      />
      {cities.length === 0 ? (
        <NoCitiesEmptyState onCreateClick={openCreateDialog} />
      ) : (
        <TableWrapper>
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
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" className="border-gray-200">
                          <Edit className="h-4 w-4" />
                              </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </TableWrapper>
      )}
      
      {/* Dialog global pour création ville */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent aria-describedby="city-dialog-description-global">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle ville</DialogTitle>
          </DialogHeader>
          <div id="city-dialog-description-global" className="sr-only">
            Formulaire pour créer une nouvelle ville avec nom et slug URL
          </div>
          <form onSubmit={handleCreateCity} className="space-y-4">
            <div>
              <Label htmlFor="name-global">Nom de la ville</Label>
              <Input 
                id="name-global" 
                placeholder="Ex: Paris" 
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
      </div>
            <div>
              <Label htmlFor="slug-global">Slug (URL)</Label>
              <Input 
                id="slug-global" 
                placeholder="Ex: paris" 
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
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
                {isSubmitting ? 'Création...' : 'Créer la ville'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </UniversalAdminLayout>
  );
}