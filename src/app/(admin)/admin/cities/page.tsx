'use client';

import { useState, useEffect } from 'react';
import { UniversalAdminLayout, PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/admin/universal-admin-layout';

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
          <button className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors">
            Ajouter une ville
          </button>
        }
      />
      {cities.length === 0 ? (
        <EmptyState 
          icon="🏙️"
          title="Aucune ville"
          description="Créez votre première ville pour commencer à configurer votre plateforme. Les hôtels seront associés aux villes."
        />
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