"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

type Hotel = {
  id: string;
  name: string;
  address: string;
  email: string;
  phone?: string;
  contactName?: string;
  city: {
    id: string;
    name: string;
  };
  discountCode?: {
    id: string;
    code: string;
    kind: "PLATFORM_70" | "HOTEL_70";
    active: boolean;
  };
  createdAt: string;
};

type InventoryItem = {
  id: string;
  quantity: number;
  active: boolean;
  product: {
    id: string;
    name: string;
    pricePerDay: number;
  };
};

type Reservation = {
  id: string;
  code: string;
  status: string;
  userEmail: string;
  startAt: string;
  endAt: string;
  priceCents: number;
  depositCents: number;
  product: {
    name: string;
  };
};

type Product = {
  id: string;
  name: string;
};

export default function HotelDetailPage() {
  const params = useParams();
  const hotelId = params.hotelId as string;
  
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHotelData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [hotelResponse, inventoryResponse, reservationsResponse, productsResponse] = await Promise.all([
        fetch(`/api/hotels/${hotelId}`),
        fetch(`/api/inventory/hotel/${hotelId}`),
        fetch(`/api/admin/reservations?hotelId=${hotelId}`),
        fetch(`/api/products`)
      ]);

      if (!hotelResponse.ok) {
        throw new Error(`Hôtel non trouvé: ${hotelResponse.status}`);
      }

      const hotelData = await hotelResponse.json();
      setHotel(hotelData);

      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json();
        setInventory(inventoryData);
      }

      if (reservationsResponse.ok) {
        const reservationsData = await reservationsResponse.json();
        setReservations(reservationsData);
      }

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setAvailableProducts(productsData);
      }

    } catch (err: any) {
      console.error("Erreur lors du chargement des données:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hotelId) {
      fetchHotelData();
    }
  }, [hotelId]);

  const handleAddStock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const stockData = {
      hotelId: hotelId,
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

      await fetchHotelData(); // Refresh data
      setIsAddStockDialogOpen(false);
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error("Erreur lors de l'ajout du stock:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscountCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const discountData = {
      code: formData.get("code") as string,
      kind: formData.get("kind") as "PLATFORM_70" | "HOTEL_70",
      active: true,
    };

    try {
      const response = await fetch(`/api/hotels/${hotelId}/discount`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(discountData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création");
      }

      await fetchHotelData(); // Refresh data
      setIsDiscountDialogOpen(false);
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error("Erreur lors de la création du code:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDiscountStatus = async () => {
    if (!hotel?.discountCode) return;

    try {
      const response = await fetch(`/api/hotels/${hotelId}/discount`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !hotel.discountCode.active }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la modification");
      }

      await fetchHotelData(); // Refresh data
    } catch (error: any) {
      console.error("Erreur:", error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const totalRevenue = reservations.reduce((sum, res) => sum + res.priceCents, 0);
  const completedReservations = reservations.filter(res => res.status === "COMPLETED");

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Détails de l'hôtel</h1>
        </div>
        <div className="flex items-center justify-center py-8">
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-2">Hôtel non trouvé</h1>
          <Button asChild variant="outline">
            <Link href="/admin/hotels">Retour aux hôtels</Link>
          </Button>
        </div>
        <div className="text-center py-8 text-red-600">
          <p>Erreur : {error || "Hôtel non trouvé"}</p>
        </div>
      </div>
    );
  }

  const productsNotInStock = availableProducts.filter(
    product => !inventory.some(item => item.product.id === product.id)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link
                  href="/admin/hotels"
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Hôtels
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    {hotel.city.name}
                  </span>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    {hotel.name}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 className="text-3xl font-bold mt-2">{hotel.name}</h1>
          <p className="text-muted-foreground">{hotel.city.name}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/hotels">Retour aux hôtels</Link>
        </Button>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "info", label: "Informations", icon: "🏨" },
            { id: "stock", label: "Stock", icon: "📦" },
            { id: "reservations", label: "Réservations", icon: "📅" },
            { id: "revenue", label: "Revenus", icon: "💰" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-6">
        {activeTab === "info" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Nom</dt>
                    <dd className="mt-1 text-sm text-gray-900">{hotel.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                    <dd className="mt-1 text-sm text-gray-900">{hotel.address}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{hotel.email}</dd>
                  </div>
                  {hotel.phone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                      <dd className="mt-1 text-sm text-gray-900">{hotel.phone}</dd>
                    </div>
                  )}
                  {hotel.contactName && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Contact</dt>
                      <dd className="mt-1 text-sm text-gray-900">{hotel.contactName}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Créé le</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(hotel.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Code de réduction</h3>
                  {!hotel.discountCode && (
                    <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">Créer un code</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Créer un code de réduction</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleDiscountCode} className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="code">Code de réduction *</Label>
                            <Input 
                              id="code" 
                              name="code" 
                              placeholder="ex: HOTEL30, EASY70..."
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="kind">Type de partage *</Label>
                            <select 
                              id="kind" 
                              name="kind" 
                              required
                              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="HOTEL_70">Hôtel 70% - EasyBaby 30%</option>
                              <option value="PLATFORM_70">EasyBaby 70% - Hôtel 30%</option>
                            </select>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="outline" disabled={isSubmitting}>
                                Annuler
                              </Button>
                            </DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                              {isSubmitting ? "Création..." : "Créer"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                
                {hotel.discountCode ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-lg font-bold">{hotel.discountCode.code}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        hotel.discountCode.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {hotel.discountCode.active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {hotel.discountCode.kind === 'HOTEL_70' 
                        ? 'Hôtel: 70% - EasyBaby: 30%' 
                        : 'EasyBaby: 70% - Hôtel: 30%'}
                    </p>
                    <Button 
                      size="sm" 
                      variant={hotel.discountCode.active ? "destructive" : "default"}
                      onClick={toggleDiscountStatus}
                    >
                      {hotel.discountCode.active ? 'Désactiver' : 'Activer'}
                    </Button>
                  </div>
                ) : (
                  <p className="text-gray-500">Aucun code de réduction configuré</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "stock" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Stock des produits</h3>
              {productsNotInStock.length > 0 && (
                <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Ajouter un produit</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter un produit au stock</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddStock} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="productId">Produit *</Label>
                        <select 
                          id="productId" 
                          name="productId" 
                          required
                          className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Sélectionner un produit</option>
                          {productsNotInStock.map((product) => (
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
                          {isSubmitting ? "Ajout..." : "Ajouter"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {inventory.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun produit en stock
                </h4>
                <p className="text-gray-600 mb-4">
                  Ajoutez des produits pour que cet hôtel puisse proposer des équipements.
                </p>
                {productsNotInStock.length > 0 ? (
                  <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>Ajouter le premier produit</Button>
                    </DialogTrigger>
                  </Dialog>
                ) : (
                  <p className="text-sm text-gray-500">
                    <Link href="/admin/products" className="text-blue-600 hover:underline">
                      Créez d'abord des produits
                    </Link> pour pouvoir les ajouter au stock.
                  </p>
                )}
              </div>
            ) : (
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium">Produit</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Quantité</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Prix/jour</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-3 text-sm font-medium">{item.product.name}</td>
                        <td className="px-4 py-3 text-sm text-center font-bold">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm">{(item.product.pricePerDay / 100).toFixed(2)}€</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.quantity === 0 
                              ? 'bg-red-100 text-red-800' 
                              : item.quantity <= 2 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {item.quantity === 0 ? 'Rupture' : item.quantity <= 2 ? 'Stock bas' : 'Disponible'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "reservations" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Réservations dans cet hôtel</h3>
            
            {reservations.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune réservation
                </h4>
                <p className="text-gray-600">
                  Les réservations avec récupération dans cet hôtel apparaîtront ici.
                </p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium">Code</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Produit</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Période</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Prix</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((reservation) => (
                      <tr key={reservation.id} className="border-b">
                        <td className="px-4 py-3 text-sm font-mono">{reservation.code}</td>
                        <td className="px-4 py-3 text-sm">{reservation.product.name}</td>
                        <td className="px-4 py-3 text-sm">{reservation.userEmail}</td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(reservation.startAt).toLocaleDateString()} - {new Date(reservation.endAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold">
                          {(reservation.priceCents / 100).toFixed(2)}€
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            reservation.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-800'
                              : reservation.status === 'ACTIVE'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {reservation.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "revenue" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Revenus générés</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="font-semibold text-gray-700 mb-2">Total des revenus</h4>
                <p className="text-3xl font-bold text-green-600">
                  {(totalRevenue / 100).toFixed(2)}€
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {reservations.length} réservation(s)
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="font-semibold text-gray-700 mb-2">Réservations terminées</h4>
                <p className="text-3xl font-bold text-blue-600">{completedReservations.length}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {((completedReservations.length / Math.max(reservations.length, 1)) * 100).toFixed(1)}% du total
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="font-semibold text-gray-700 mb-2">Part de l'hôtel</h4>
                <p className="text-3xl font-bold text-purple-600">
                  {hotel.discountCode?.kind === 'HOTEL_70' 
                    ? (totalRevenue * 0.7 / 100).toFixed(2)
                    : (totalRevenue * 0.3 / 100).toFixed(2)}€
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {hotel.discountCode?.kind === 'HOTEL_70' ? '70%' : '30%'} du CA
                </p>
              </div>
            </div>

            {reservations.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  Les statistiques de revenus apparaîtront une fois que des clients auront réservé dans cet hôtel.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
