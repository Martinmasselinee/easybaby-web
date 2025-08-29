'use client';

import { useState, useEffect } from 'react';
import { UniversalAdminLayout, PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/admin/universal-admin-layout';
import { NoHotelsEmptyState, GrayEmptyState } from '@/components/admin/reusable-empty-states';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description?: string;
  pricePerHour: number;
  pricePerDay: number;
  deposit: number;
  _count: {
    inventory: number;
  };
}

interface Hotel {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Charger produits et hôtels en parallèle
      const [productsResponse, hotelsResponse] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/hotels')
      ]);
      
      if (!productsResponse.ok || !hotelsResponse.ok) {
        throw new Error(`Erreur HTTP: ${productsResponse.status} / ${hotelsResponse.status}`);
      }
      
      const [productsData, hotelsData] = await Promise.all([
        productsResponse.json(),
        hotelsResponse.json()
      ]);
      
      setProducts(productsData || []);
      setHotels(hotelsData || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement:', err);
      setError(err.message);
      setProducts([]);
      setHotels([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <LoadingState 
        title="Produits"
        message="Chargement des produits..."
      />
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Produits"
        error={error}
        onRetry={fetchData}
      />
    );
  }

  return (
    <UniversalAdminLayout>
      <PageHeader 
        title="Produits"
        subtitle="Gérez les équipements bébé disponibles à la location"
        actions={
          <Button disabled={hotels.length === 0}>
            Ajouter un produit
          </Button>
        }
      />

      {hotels.length === 0 ? (
        <NoHotelsEmptyState />
      ) : products.length === 0 ? (
        <GrayEmptyState
          icon="📦"
          title="Aucun produit"
          description="Créez votre premier équipement bébé à proposer à la location dans vos hôtels partenaires."
        >
          <Button>Ajouter votre premier produit</Button>
        </GrayEmptyState>
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
                    Prix/Heure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix/Jour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Caution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(product.pricePerHour / 100).toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(product.pricePerDay / 100).toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(product.deposit / 100).toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product._count?.inventory || 0} unités
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