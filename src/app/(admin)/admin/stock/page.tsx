"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

type InventoryItem = {
  id: string;
  hotelId: string;
  productId: string;
  quantity: number;
  active: boolean;
  hotel: {
    id: string;
    name: string;
    city: {
      name: string;
    };
  };
  product: {
    id: string;
    name: string;
    pricePerDay: number;
  };
};

type Hotel = {
  id: string;
  name: string;
  city: { name: string };
};

type Product = {
  id: string;
  name: string;
};

export default function StockPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<string>("all");

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/inventory");
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      setInventory(data);
    } catch (err: any) {
      console.error("Erreur lors du chargement du stock:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHotelsAndProducts = async () => {
    try {
      const [hotelsResponse, productsResponse] = await Promise.all([
        fetch("/api/hotels"),
        fetch("/api/products")
      ]);
      
      if (hotelsResponse.ok) {
        const hotelsData = await hotelsResponse.json();
        setHotels(hotelsData);
      }
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchHotelsAndProducts();
  }, []);

  const handleAddStock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const stockData = {
      hotelId: formData.get("hotelId") as string,
      productId: formData.get("productId") as string,
      quantity: parseInt(formData.get("quantity") as string),
    };

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stockData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'ajout");
      }

      await fetchInventory(); // Refresh the list
      setIsAddDialogOpen(false);
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error("Erreur lors de l'ajout du stock:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentItem) return;

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const quantity = parseInt(formData.get("quantity") as string);

    try {
      const response = await fetch(`/api/inventory/${currentItem.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la modification");
      }

      await fetchInventory(); // Refresh the list
      setIsEditDialogOpen(false);
      setCurrentItem(null);
    } catch (error: any) {
      console.error("Erreur lors de la modification du stock:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStock = async (itemId: string, hotelName: string, productName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le stock de "${productName}" de l'hôtel "${hotelName}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/inventory/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la suppression");
      }

      await fetchInventory(); // Refresh the list
    } catch (error: any) {
      console.error("Erreur lors de la suppression du stock:", error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const filteredInventory = selectedHotel === "all" 
    ? inventory 
    : inventory.filter(item => item.hotelId === selectedHotel);

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Rupture", color: "bg-red-100 text-red-800" };
    if (quantity <= 2) return { label: "Stock bas", color: "bg-yellow-100 text-yellow-800" };
    if (quantity <= 5) return { label: "Stock normal", color: "bg-green-100 text-green-800" };
    return { label: "Stock élevé", color: "bg-blue-100 text-blue-800" };
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Stock & Inventaire</h1>
          <p className="text-muted-foreground">Gérez le stock des produits par hôtel</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <p>Chargement du stock...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Stock & Inventaire</h1>
          <p className="text-muted-foreground">Gérez le stock des produits par hôtel</p>
        </div>
        <div className="text-center py-8 text-red-600">
          <p>Erreur : {error}</p>
          <Button onClick={() => fetchInventory()} className="mt-2">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  const canAddStock = hotels.length > 0 && products.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Stock & Inventaire</h1>
          <p className="text-muted-foreground">
            Gérez la disponibilité des produits dans chaque hôtel partenaire
          </p>
        </div>
        {canAddStock ? (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Ajouter du stock</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter du stock</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddStock} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="hotelId">Hôtel *</Label>
                  <select 
                    id="hotelId" 
                    name="hotelId" 
                    required
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un hôtel</option>
                    {hotels.map((hotel) => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.name} ({hotel.city.name})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="productId">Produit *</Label>
                  <select 
                    id="productId" 
                    name="productId" 
                    required
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un produit</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantité *</Label>
                  <Input 
                    id="quantity" 
                    name="quantity" 
                    type="number"
                    min="1"
                    placeholder="ex: 5"
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
                    {isSubmitting ? "Ajout..." : "Ajouter le stock"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          <Button disabled title="Créez d'abord des hôtels et des produits">
            Ajouter du stock
          </Button>
        )}
      </div>

      {!canAddStock ? (
        <div className="text-center py-16 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            Configuration incomplète
          </h3>
          <p className="text-yellow-800 mb-6">
            Pour gérer le stock, vous devez d'abord avoir des hôtels et des produits configurés.
          </p>
          <div className="space-x-4">
            {hotels.length === 0 && (
              <Button asChild>
                <Link href="/admin/hotels">Ajouter des hôtels</Link>
              </Button>
            )}
            {products.length === 0 && (
              <Button asChild>
                <Link href="/admin/products">Créer des produits</Link>
              </Button>
            )}
          </div>
        </div>
      ) : inventory.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun stock configuré
          </h3>
          <p className="text-gray-600 mb-6">
            Commencez par ajouter des produits dans vos hôtels partenaires.
            Les clients pourront ensuite réserver ces équipements.
          </p>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Ajouter mon premier stock</Button>
            </DialogTrigger>
          </Dialog>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filtre par hôtel */}
          <div className="flex items-center gap-4">
            <Label htmlFor="hotel-filter">Filtrer par hôtel :</Label>
            <select
              id="hotel-filter"
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
              className="h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les hôtels</option>
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name} ({hotel.city.name})
                </option>
              ))}
            </select>
          </div>

          {/* Alertes stock bas */}
          {inventory.filter(item => item.quantity <= 2).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">⚠️ Alertes stock</h4>
              <div className="space-y-1">
                {inventory
                  .filter(item => item.quantity <= 2)
                  .map(item => (
                    <p key={item.id} className="text-sm text-red-800">
                      {item.product.name} à {item.hotel.name} : {item.quantity} unité(s) restante(s)
                    </p>
                  ))}
              </div>
            </div>
          )}

          <div className="border rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium">Produit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Hôtel</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Ville</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Quantité</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Prix/jour</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const status = getStockStatus(item.quantity);
                  return (
                    <tr key={item.id} className="border-b">
                      <td className="px-4 py-3 text-sm font-medium">{item.product.name}</td>
                      <td className="px-4 py-3 text-sm">{item.hotel.name}</td>
                      <td className="px-4 py-3 text-sm">{item.hotel.city.name}</td>
                      <td className="px-4 py-3 text-sm text-center font-bold">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{(item.product.pricePerDay / 100).toFixed(2)}€</td>
                      <td className="px-4 py-3 text-sm space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentItem(item);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteStock(item.id, item.hotel.name, item.product.name)}
                        >
                          Supprimer
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Résumé statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-700">Total produits</h4>
              <p className="text-2xl font-bold text-blue-600">{inventory.reduce((sum, item) => sum + item.quantity, 0)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-700">Stock normal</h4>
              <p className="text-2xl font-bold text-green-600">{inventory.filter(item => item.quantity > 2).length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-700">Stock bas</h4>
              <p className="text-2xl font-bold text-yellow-600">{inventory.filter(item => item.quantity <= 2 && item.quantity > 0).length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-700">Ruptures</h4>
              <p className="text-2xl font-bold text-red-600">{inventory.filter(item => item.quantity === 0).length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la quantité</DialogTitle>
          </DialogHeader>
          {currentItem && (
            <form onSubmit={handleUpdateStock} className="space-y-4 mt-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Produit :</strong> {currentItem.product.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Hôtel :</strong> {currentItem.hotel.name}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Nouvelle quantité *</Label>
                <Input 
                  id="edit-quantity" 
                  name="quantity" 
                  type="number"
                  min="0"
                  defaultValue={currentItem.quantity}
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
