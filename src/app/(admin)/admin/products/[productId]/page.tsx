'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { UniversalAdminLayout, PageHeader, LoadingState, ErrorState } from '@/components/admin/universal-admin-layout';
import { TableWrapper, TABLE_STYLES } from '@/components/admin/reusable-empty-states';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description?: string;
  pricePerHour: number;
  pricePerDay: number;
  deposit: number;
  inventory: Array<{
    id: string;
    quantity: number;
    active: boolean;
    hotel: {
      id: string;
      name: string;
      city: {
        name: string;
      };
    };
  }>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    pricePerHour: '',
    pricePerDay: '',
    deposit: ''
  });

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/products/${productId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const productData = await response.json();
      setProduct(productData);
      
      // Set edit form data
      setEditFormData({
        name: productData.name,
        description: productData.description || '',
        pricePerHour: (productData.pricePerHour / 100).toString(),
        pricePerDay: (productData.pricePerDay / 100).toString(),
        deposit: (productData.deposit / 100).toString()
      });
      
    } catch (err: any) {
      console.error('Erreur lors du chargement:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsEditing(true);
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editFormData.name.trim(),
          description: editFormData.description.trim(),
          pricePerHour: Math.round(parseFloat(editFormData.pricePerHour) * 100),
          pricePerDay: Math.round(parseFloat(editFormData.pricePerDay) * 100),
          deposit: Math.round(parseFloat(editFormData.deposit) * 100)
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification');
      }

      setIsEditDialogOpen(false);
      fetchProduct(); // Refresh data
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      // Redirect to products page
      window.location.href = '/admin/products';
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingState 
        title="Produit"
        message="Chargement du produit..."
      />
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Produit"
        error={error}
        onRetry={fetchProduct}
      />
    );
  }

  if (!product) {
    return (
      <ErrorState 
        title="Produit"
        error="Produit non trouvé"
        onRetry={fetchProduct}
      />
    );
  }

  const totalStock = product.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
  const activeStock = product.inventory.filter(inv => inv.active).reduce((sum, inv) => sum + inv.quantity, 0);
  
  // Aggregate inventory by hotel (combine multiple rows for same hotel)
  const aggregatedInventory = product.inventory.reduce((acc, inv) => {
    const hotelId = inv.hotel.id;
    if (acc[hotelId]) {
      acc[hotelId].quantity += inv.quantity;
      acc[hotelId].active = acc[hotelId].active || inv.active; // Active if any row is active
    } else {
      acc[hotelId] = {
        hotelId: inv.hotel.id,
        hotelName: inv.hotel.name,
        cityName: inv.hotel.city.name,
        quantity: inv.quantity,
        active: inv.active
      };
    }
    return acc;
  }, {} as Record<string, { hotelId: string; hotelName: string; cityName: string; quantity: number; active: boolean; }>);
  
  const aggregatedInventoryArray = Object.values(aggregatedInventory);

  return (
    <UniversalAdminLayout>
      <PageHeader 
        title={product.name}
        subtitle="Gestion du produit et de son inventaire"
        actions={
          <div className="flex space-x-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-gray-200">
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Modifier le produit</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditProduct} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom du produit</Label>
                    <Input 
                      id="name" 
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pricePerHour">Prix/heure (€)</Label>
                      <Input 
                        id="pricePerHour" 
                        type="number" 
                        step="0.01"
                        value={editFormData.pricePerHour}
                        onChange={(e) => setEditFormData({ ...editFormData, pricePerHour: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pricePerDay">Prix/jour (€)</Label>
                      <Input 
                        id="pricePerDay" 
                        type="number" 
                        step="0.01"
                        value={editFormData.pricePerDay}
                        onChange={(e) => setEditFormData({ ...editFormData, pricePerDay: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="deposit">Caution (€)</Label>
                    <Input 
                      id="deposit" 
                      type="number" 
                      step="0.01"
                      value={editFormData.deposit}
                      onChange={(e) => setEditFormData({ ...editFormData, deposit: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                      disabled={isEditing}
                      className="border-gray-200"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={isEditing}
                      className="bg-gray-900 hover:bg-gray-800 text-white border-0"
                    >
                      {isEditing ? 'Modification...' : 'Modifier'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmer la suppression</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-gray-600">
                    Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
                  </p>
                  {totalStock > 0 && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-700">
                        ⚠️ Ce produit a {totalStock} unités en stock dans {product.inventory.length} hôtel(s). 
                        La suppression supprimera également tout l'inventaire.
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={isDeleting}
                    className="border-gray-200"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleDeleteProduct}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white border-0"
                  >
                    {isDeleting ? 'Suppression...' : 'Supprimer'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Product Details */}
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Détails du produit</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Prix/Heure</dt>
              <dd className="text-sm text-gray-900">{(product.pricePerHour / 100).toFixed(2)}€</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Prix/Jour</dt>
              <dd className="text-sm text-gray-900">{(product.pricePerDay / 100).toFixed(2)}€</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Caution</dt>
              <dd className="text-sm text-gray-900">{(product.deposit / 100).toFixed(2)}€</dd>
            </div>
            {product.description && (
              <div className="sm:col-span-3">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</dt>
                <dd className="text-sm text-gray-900 mt-1">{product.description}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Stock Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="h-4 w-4 bg-gray-800 mr-2" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Total</p>
                <p className="text-xl font-semibold text-gray-900">{totalStock}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="h-4 w-4 bg-gray-400 mr-2" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Actif</p>
                <p className="text-xl font-semibold text-gray-900">{activeStock}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="h-4 w-4 bg-gray-600 mr-2" />
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Hôtels</p>
                <p className="text-xl font-semibold text-gray-900">{product.inventory.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        {aggregatedInventoryArray.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Stock par hôtel</h3>
            <TableWrapper>
              <table className={TABLE_STYLES.table}>
                <thead className={TABLE_STYLES.thead}>
                  <tr>
                    <th className={TABLE_STYLES.th}>Hôtel</th>
                    <th className={TABLE_STYLES.th}>Ville</th>
                    <th className={TABLE_STYLES.th}>Stock Total</th>
                    <th className={TABLE_STYLES.th}>Statut</th>
                    <th className={TABLE_STYLES.th}>Actions</th>
                  </tr>
                </thead>
                <tbody className={TABLE_STYLES.tbody}>
                  {aggregatedInventoryArray.map((inv) => (
                    <tr key={inv.hotelId} className={TABLE_STYLES.tr}>
                      <td className={TABLE_STYLES.td}>
                        {inv.hotelName}
                      </td>
                      <td className={TABLE_STYLES.tdSecondary}>
                        {inv.cityName}
                      </td>
                      <td className={TABLE_STYLES.tdSecondary}>
                        {inv.quantity} unités
                      </td>
                      <td className={TABLE_STYLES.tdSecondary}>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          inv.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {inv.active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className={TABLE_STYLES.actions}>
                        <div className="flex justify-end space-x-2">
                          <Link href={`/admin/hotels/${inv.hotelId}`}>
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
          </div>
        )}
      </div>
    </UniversalAdminLayout>
  );
}
