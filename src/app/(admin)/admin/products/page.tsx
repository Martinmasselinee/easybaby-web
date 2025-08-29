'use client';

import { useState, useEffect } from 'react';
import { UniversalAdminLayout, PageHeader, LoadingState, ErrorState, PrerequisiteEmptyState, GrayEmptyState } from "@/components/admin/universal-admin-layout";
import { NoHotelsEmptyState, TableWrapper, TABLE_STYLES } from '@/components/admin/reusable-empty-states';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';
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
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    pricePerHour: '',
    pricePerDay: '',
    deposit: ''
  });

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

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormData.name.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: productFormData.name.trim(),
          description: productFormData.description.trim(),
          pricePerHour: Math.round(parseFloat(productFormData.pricePerHour || '0') * 100), // Convertir en centimes
          pricePerDay: Math.round(parseFloat(productFormData.pricePerDay || '0') * 100), // Convertir en centimes
          deposit: Math.round(parseFloat(productFormData.deposit || '0') * 100), // Convertir en centimes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création');
      }

      // Succès - fermer dialog et rafraîchir
      setIsAddDialogOpen(false);
      setProductFormData({
        name: '',
        description: '',
        pricePerHour: '',
        pricePerDay: '',
        deposit: ''
      });
      await fetchData(); // Recharger la liste

    } catch (err: any) {
      console.error('Erreur création produit:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateDialog = () => {
    setProductFormData({
      name: '',
      description: '',
      pricePerHour: '',
      pricePerDay: '',
      deposit: ''
    });
    setIsAddDialogOpen(true);
  };

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
            <Button onClick={openCreateDialog}>Ajouter un produit</Button>
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
          <Button onClick={openCreateDialog}>
            Ajouter votre premier produit
          </Button>
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
                      <div className="flex justify-end space-x-2">
                        <Link href={`/admin/products/${product.id}`}>
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
      )}
      
      {/* Dialog global pour création produit */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent aria-describedby="product-dialog-description-global">
          <DialogHeader>
            <DialogTitle>Créer un nouveau produit</DialogTitle>
          </DialogHeader>
          <div id="product-dialog-description-global" className="sr-only">
            Formulaire pour créer un nouveau produit avec nom, description, prix et caution
          </div>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <div>
              <Label htmlFor="name-global">Nom du produit</Label>
              <Input 
                id="name-global" 
                placeholder="Ex: Poussette City Mini" 
                value={productFormData.name}
                onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description-global">Description</Label>
              <Textarea 
                id="description-global" 
                placeholder="Description détaillée du produit..."
                value={productFormData.description}
                onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pricePerHour-global">Prix/heure (€)</Label>
                <Input 
                  id="pricePerHour-global" 
                  type="number" 
                  placeholder="5.00" 
                  step="0.01"
                  value={productFormData.pricePerHour}
                  onChange={(e) => setProductFormData({ ...productFormData, pricePerHour: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pricePerDay-global">Prix/jour (€)</Label>
                <Input 
                  id="pricePerDay-global" 
                  type="number" 
                  placeholder="25.00" 
                  step="0.01"
                  value={productFormData.pricePerDay}
                  onChange={(e) => setProductFormData({ ...productFormData, pricePerDay: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="deposit-global">Caution (€)</Label>
              <Input 
                id="deposit-global" 
                type="number" 
                placeholder="50.00" 
                step="0.01"
                value={productFormData.deposit}
                onChange={(e) => setProductFormData({ ...productFormData, deposit: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>Annuler</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Création...' : 'Créer le produit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </UniversalAdminLayout>
  );
}