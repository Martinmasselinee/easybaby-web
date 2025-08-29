'use client';

import { useState, useEffect } from 'react';
import { UniversalAdminLayout, PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/admin/universal-admin-layout';
import { NoHotelsEmptyState, GrayEmptyState, TableWrapper } from '@/components/admin/reusable-empty-states';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from '@/components/ui/dialog';
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          hotels.length > 0 ? (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>Ajouter un produit</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau produit</DialogTitle>
                </DialogHeader>
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom du produit</Label>
                    <Input id="name" placeholder="Ex: Poussette City Mini" />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Description détaillée du produit..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pricePerHour">Prix/heure (€)</Label>
                      <Input id="pricePerHour" type="number" placeholder="5.00" step="0.01" />
                    </div>
                    <div>
                      <Label htmlFor="pricePerDay">Prix/jour (€)</Label>
                      <Input id="pricePerDay" type="number" placeholder="25.00" step="0.01" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="deposit">Caution (€)</Label>
                    <Input id="deposit" type="number" placeholder="50.00" step="0.01" />
                  </div>
                </form>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <Button>Créer le produit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Button disabled title="Créez d'abord un hôtel">
              Ajouter un produit
            </Button>
          )
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Ajouter votre premier produit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau produit</DialogTitle>
              </DialogHeader>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom du produit</Label>
                  <Input id="name" placeholder="Ex: Poussette City Mini" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Description détaillée du produit..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pricePerHour">Prix/heure (€)</Label>
                    <Input id="pricePerHour" type="number" placeholder="5.00" step="0.01" />
                  </div>
                  <div>
                    <Label htmlFor="pricePerDay">Prix/jour (€)</Label>
                    <Input id="pricePerDay" type="number" placeholder="25.00" step="0.01" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="deposit">Caution (€)</Label>
                  <Input id="deposit" type="number" placeholder="50.00" step="0.01" />
                </div>
              </form>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button>Créer le produit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </GrayEmptyState>
      ) : (
        <TableWrapper>
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
        </TableWrapper>
      )}
    </UniversalAdminLayout>
  );
}