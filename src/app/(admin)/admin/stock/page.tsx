"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

type Hotel = {
  id: string;
  name: string;
  city: {
    name: string;
  };
};

type Product = {
  id: string;
  name: string;
  pricePerHour: number;
  pricePerDay: number;
  deposit: number;
};

type InventoryItem = {
  id: string;
  hotelId: string;
  hotel: {
    name: string;
    city: {
      name: string;
    };
  };
  productId: string;
  product: {
    name: string;
    pricePerHour: number;
    pricePerDay: number;
    deposit: number;
  };
  quantity: number;
};

export default function StockPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterHotelId, setFilterHotelId] = useState<string>("");
  const [filterProductId, setFilterProductId] = useState<string>("");

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Charger les hôtels
        const hotelsResponse = await fetch("/api/hotels");
        if (!hotelsResponse.ok) {
          throw new Error(`Erreur HTTP: ${hotelsResponse.status}`);
        }
        const hotelsData = await hotelsResponse.json();
        setHotels(hotelsData);
        
        // Charger les produits
        const productsResponse = await fetch("/api/products");
        if (!productsResponse.ok) {
          throw new Error(`Erreur HTTP: ${productsResponse.status}`);
        }
        const productsData = await productsResponse.json();
        setProducts(productsData);
        
        // TODO: Charger l'inventaire
        // Pour l'instant, utiliser des données de démo
        setInventory([
          {
            id: "inv1",
            hotelId: "hotel-demo-paris",
            hotel: {
              name: "Hôtel Demo Paris",
              city: {
                name: "Paris"
              }
            },
            productId: "1",
            product: {
              name: "Poussette",
              pricePerHour: 300,
              pricePerDay: 1500,
              deposit: 15000
            },
            quantity: 5
          },
          {
            id: "inv2",
            hotelId: "hotel-demo-paris",
            hotel: {
              name: "Hôtel Demo Paris",
              city: {
                name: "Paris"
              }
            },
            productId: "2",
            product: {
              name: "Lit parapluie",
              pricePerHour: 200,
              pricePerDay: 1000,
              deposit: 20000
            },
            quantity: 5
          }
        ]);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les données. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Gérer l'ajout d'un élément d'inventaire
  const handleAddInventoryItem = async () => {
    if (!selectedHotelId || !selectedProductId || quantity < 1) {
      setError("Veuillez sélectionner un hôtel, un produit et une quantité valide.");
      return;
    }
    
    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hotelId: selectedHotelId,
          productId: selectedProductId,
          quantity,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }
      
      const newInventoryItem = await response.json();
      
      // Mettre à jour l'inventaire
      setInventory(prev => {
        // Vérifier si l'élément existe déjà
        const existingIndex = prev.findIndex(item => 
          item.hotelId === newInventoryItem.hotelId && 
          item.productId === newInventoryItem.productId
        );
        
        if (existingIndex >= 0) {
          // Mettre à jour l'élément existant
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newInventoryItem.quantity
          };
          return updated;
        } else {
          // Ajouter le nouvel élément
          const hotel = hotels.find(h => h.id === newInventoryItem.hotelId);
          const product = products.find(p => p.id === newInventoryItem.productId);
          
          if (hotel && product) {
            return [...prev, {
              ...newInventoryItem,
              hotel: {
                name: hotel.name,
                city: hotel.city
              },
              product: {
                name: product.name,
                pricePerHour: product.pricePerHour,
                pricePerDay: product.pricePerDay,
                deposit: product.deposit
              }
            }];
          }
          return prev;
        }
      });
      
      // Réinitialiser le formulaire
      setSelectedHotelId("");
      setSelectedProductId("");
      setQuantity(1);
      setIsAddDialogOpen(false);
      
      // Afficher un message de succès
      alert("Produit ajouté au stock avec succès.");
    } catch (err) {
      console.error("Erreur lors de l'ajout du produit au stock:", err);
      setError(err.message || "Une erreur est survenue lors de l'ajout du produit au stock.");
    }
  };
  
  // Filtrer l'inventaire
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hotel.city.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesHotel = filterHotelId ? item.hotelId === filterHotelId : true;
    const matchesProduct = filterProductId ? item.productId === filterProductId : true;
    
    return matchesSearch && matchesHotel && matchesProduct;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Stock</h1>
          <p className="text-muted-foreground">
            Gérez le stock des produits par hôtel
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Ajouter au stock
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un produit au stock</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="hotel">Hôtel</Label>
                <select
                  id="hotel"
                  className="w-full border rounded-md p-2"
                  value={selectedHotelId}
                  onChange={(e) => setSelectedHotelId(e.target.value)}
                  required
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
                <Label htmlFor="product">Produit</Label>
                <select
                  id="product"
                  className="w-full border rounded-md p-2"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required
                >
                  <option value="">Sélectionner un produit</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({(product.pricePerDay / 100).toFixed(2)} €/jour)
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantité</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Annuler</Button>
              </DialogClose>
              <Button onClick={handleAddInventoryItem}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full rounded-md border px-4 py-2 pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div>
            <select
              className="w-full rounded-md border px-4 py-2"
              value={filterHotelId}
              onChange={(e) => setFilterHotelId(e.target.value)}
            >
              <option value="">Tous les hôtels</option>
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="w-full rounded-md border px-4 py-2"
              value={filterProductId}
              onChange={(e) => setFilterProductId(e.target.value)}
            >
              <option value="">Tous les produits</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p>Chargement du stock...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-muted-foreground">Aucun produit en stock</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium">Hôtel</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Ville</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Produit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Prix/Heure</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Prix/Jour</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Caution</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Quantité</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-3 text-sm">
                      <Link 
                        href={`/admin/hotels/${item.hotelId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {item.hotel.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">{item.hotel.city.name}</td>
                    <td className="px-4 py-3 text-sm font-medium">{item.product.name}</td>
                    <td className="px-4 py-3 text-sm">{(item.product.pricePerHour / 100).toFixed(2)} €</td>
                    <td className="px-4 py-3 text-sm">{(item.product.pricePerDay / 100).toFixed(2)} €</td>
                    <td className="px-4 py-3 text-sm">{(item.product.deposit / 100).toFixed(2)} €</td>
                    <td className="px-4 py-3 text-sm">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm">
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}