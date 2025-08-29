'use client';

import { useState, useEffect } from 'react';
import { UniversalAdminLayout, PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/admin/universal-admin-layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface InventoryItem {
  id: string;
  quantity: number;
  active: boolean;
  hotel: {
    name: string;
    city: {
      name: string;
    };
  };
  product: {
    name: string;
  };
}

interface Product {
  id: string;
  name: string;
}

interface Hotel {
  id: string;
  name: string;
}

export default function StockPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [inventoryResponse, productsResponse, hotelsResponse] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/products'),
        fetch('/api/hotels')
      ]);
      
      if (!inventoryResponse.ok || !productsResponse.ok || !hotelsResponse.ok) {
        throw new Error(`Erreur HTTP: ${inventoryResponse.status}`);
      }
      
      const [inventoryData, productsData, hotelsData] = await Promise.all([
        inventoryResponse.json(),
        productsResponse.json(),
        hotelsResponse.json()
      ]);
      
      setInventory(inventoryData || []);
      setProducts(productsData || []);
      setHotels(hotelsData || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement:', err);
      setError(err.message);
      setInventory([]);
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
        title="Stock & Inventaire"
        message="Chargement du stock..."
      />
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Stock & Inventaire"
        error={error}
        onRetry={fetchData}
      />
    );
  }

  return (
    <UniversalAdminLayout>
      <PageHeader 
        title="Stock & Inventaire"
        subtitle="Gérez le stock des produits par hôtel"
        actions={
          (products.length > 0 && hotels.length > 0) ? (
            <Button>Ajouter du stock</Button>
          ) : null
        }
      />

      {products.length === 0 ? (
        <div className="text-center py-16 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            Aucun produit disponible
          </h3>
          <p className="text-yellow-800 mb-6 max-w-md mx-auto">
            Vous devez d'abord créer des produits avant de pouvoir gérer le stock dans vos hôtels.
          </p>
          <Button asChild>
            <Link href="/admin/products">Créer des produits</Link>
          </Button>
        </div>
      ) : hotels.length === 0 ? (
        <div className="text-center py-16 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-6xl mb-4">🏨</div>
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            Aucun hôtel disponible
          </h3>
          <p className="text-yellow-800 mb-6 max-w-md mx-auto">
            Vous devez d'abord créer des hôtels pour pouvoir y assigner du stock de produits.
          </p>
          <Button asChild>
            <Link href="/admin/hotels">Créer des hôtels</Link>
          </Button>
        </div>
      ) : inventory.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun stock configuré
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Assignez vos produits aux hôtels pour définir les quantités disponibles à la location.
          </p>
          <Button>Configurer le premier stock</Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hôtel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ville
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.hotel.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.hotel.city.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.active ? 'Actif' : 'Inactif'}
                      </span>
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