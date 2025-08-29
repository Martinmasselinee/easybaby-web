"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { UniversalAdminLayout, PageHeader, LoadingState, ErrorState } from '@/components/admin/universal-admin-layout';
import { TableWrapper, TABLE_STYLES } from '@/components/admin/reusable-empty-states';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Edit, Plus, Trash2, Settings } from 'lucide-react';
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
  const [isEditDiscountDialogOpen, setIsEditDiscountDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<{ id: string; name: string; currentQuantity: number } | null>(null);
  const [isManageStockDialogOpen, setIsManageStockDialogOpen] = useState(false);
  const [stockChangeAmount, setStockChangeAmount] = useState('');
  const [selectedReservationForCaution, setSelectedReservationForCaution] = useState<Reservation | null>(null);
  const [isCautionDialogOpen, setIsCautionDialogOpen] = useState(false);
  const [isDamageDialogOpen, setIsDamageDialogOpen] = useState(false);
  const [isProcessingCaution, setIsProcessingCaution] = useState(false);
  const [isDeleteHotelDialogOpen, setIsDeleteHotelDialogOpen] = useState(false);
  
  // Hotel edit states
  const [isEditHotelDialogOpen, setIsEditHotelDialogOpen] = useState(false);
  const [editHotelForm, setEditHotelForm] = useState({
    name: '',
    address: '',
    phone: '',
    contactName: '',
    contactEmail: ''
  });

  const [editDiscountForm, setEditDiscountForm] = useState({
    code: '',
    kind: 'HOTEL_70' as 'HOTEL_70' | 'PLATFORM_70'
  });

    const fetchHotelData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [hotelResponse, inventoryResponse, reservationsResponse, productsResponse] = await Promise.all([
        fetch(`/api/hotels/${hotelId}`),
        fetch(`/api/inventory/hotel/${hotelId}`),
        fetch(`/api/admin/reservations?hotelId=${hotelId}`, {
          credentials: 'include'
        }),
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

  const handleEditHotel = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/hotels/${hotelId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editHotelForm),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'hôtel");
      }

      await fetchHotelData();
      setIsEditHotelDialogOpen(false);
    } catch (error: any) {
      console.error("Erreur:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditHotelDialog = () => {
    if (hotel) {
      setEditHotelForm({
        name: hotel.name,
        address: hotel.address || '',
        phone: hotel.phone || '',
        contactName: hotel.contactName || '',
        contactEmail: hotel.contactEmail || ''
      });
      setIsEditHotelDialogOpen(true);
    }
  };

  const handleDeleteHotel = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/hotels/${hotelId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'hôtel");
      }

      // Redirect to hotels list after successful deletion
      window.location.href = '/admin/hotels';
    } catch (error: any) {
      console.error("Erreur:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleManageStock = async (action: 'increase' | 'decrease') => {
    if (!selectedProductForStock || !stockChangeAmount) return;
    
    try {
      setIsSubmitting(true);
      const quantity = parseInt(stockChangeAmount);
      
      if (action === 'increase') {
        // Add stock using the existing add stock endpoint
        const response = await fetch("/api/inventory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hotelId: hotelId,
            productId: selectedProductForStock.id,
            quantity: quantity
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de l'ajout du stock");
        }
      } else {
        // For decrease, we need to find the inventory item and update it
        const currentInventoryItem = inventory.find(item => item.product.id === selectedProductForStock.id);
        if (currentInventoryItem) {
          const newQuantity = Math.max(0, currentInventoryItem.quantity - quantity);
          
          const response = await fetch(`/api/inventory/${currentInventoryItem.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              quantity: newQuantity
            }),
          });

          if (!response.ok) {
            throw new Error("Erreur lors de la réduction du stock");
          }
        }
      }

      await fetchHotelData();
      setIsManageStockDialogOpen(false);
      setSelectedProductForStock(null);
      setStockChangeAmount('');
    } catch (error: any) {
      console.error("Erreur:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCautionProcessing = async () => {
    if (!selectedReservationForCaution) return;
    
    try {
      setIsProcessingCaution(true);
      
      // Call Stripe to charge the caution
      const response = await fetch('/api/admin/caution/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId: selectedReservationForCaution.id,
          hotelId: hotelId
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du traitement de la caution');
      }

      const result = await response.json();
      
      // Show damage dialog after successful caution charge
      setIsCautionDialogOpen(false);
      setIsDamageDialogOpen(true);
      
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsProcessingCaution(false);
    }
  };

  const handleProductDamage = async (markAsDamaged: boolean) => {
    if (!selectedReservationForCaution) return;
    
    try {
      setIsProcessingCaution(true);
      
      if (markAsDamaged) {
        // Mark product as damaged and remove from stock
        const response = await fetch('/api/admin/inventory/damage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reservationId: selectedReservationForCaution.id,
            hotelId: hotelId,
            markAsDamaged: true
          }),
        });

        if (!response.ok) {
          throw new Error('Erreur lors du marquage du produit endommagé');
        }
      }
      
      // Refresh hotel data to update stock
      await fetchHotelData();
      
      // Close dialogs and reset state
      setIsDamageDialogOpen(false);
      setSelectedReservationForCaution(null);
      
      alert(markAsDamaged 
        ? 'Produit marqué comme endommagé et retiré du stock' 
        : 'Caution traitée avec succès'
      );
      
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsProcessingCaution(false);
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

  const openEditDiscountDialog = () => {
    if (hotel?.discountCode) {
      setEditDiscountForm({
        code: hotel.discountCode.code,
        kind: hotel.discountCode.kind
      });
      setIsEditDiscountDialogOpen(true);
    }
  };

  const handleEditDiscountCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const discountData = {
      code: formData.get("code") as string,
      kind: formData.get("kind") as "PLATFORM_70" | "HOTEL_70",
    };

    try {
      const response = await fetch(`/api/hotels/${hotelId}/discount`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(discountData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la modification");
      }

      await fetchHotelData(); // Refresh data
      setIsEditDiscountDialogOpen(false);
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error("Erreur lors de la modification du code:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalRevenue = reservations.reduce((sum, res) => sum + res.priceCents, 0);
  const completedReservations = reservations.filter(res => res.status === "COMPLETED");
  
  if (isLoading) {
    return (
      <LoadingState 
        title="Détails de l'hôtel"
        message="Chargement des données de l'hôtel..."
      />
    );
  }

  if (error || !hotel) {
    return (
      <ErrorState 
        title="Hôtel non trouvé"
        error={error || "Hôtel non trouvé"}
        onRetry={fetchHotelData}
        customAction={
          <Button asChild variant="outline">
            <Link href="/admin/hotels">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux hôtels
            </Link>
        </Button>
        }
      />
    );
  }

  const productsNotInStock = availableProducts.filter(
    product => !inventory.some(item => item.product.id === product.id)
  );

  return (
    <UniversalAdminLayout>
      <PageHeader 
        title={hotel.name}
        subtitle={`${hotel.city.name} • ${hotel.email}`}
        actions={
          <div className="flex space-x-3">
            <Button asChild variant="outline">
              <Link href="/admin/hotels">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux hôtels
              </Link>
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setIsDeleteHotelDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer l'hôtel
            </Button>
          </div>
        }
      />

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
                
                                {/* Hotel Management Actions */}
                <div className="mt-6 flex space-x-3">
                  <Button variant="outline" className="flex-1" onClick={openEditHotelDialog}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier Info Hôtel
                  </Button>
              </div>
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
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={openEditDiscountDialog}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button 
                        size="sm" 
                        variant={hotel.discountCode.active ? "destructive" : "default"}
                        onClick={toggleDiscountStatus}
                      >
                        {hotel.discountCode.active ? 'Désactiver' : 'Activer'}
                      </Button>
                    </div>
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
              <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter Stock
                    </Button>
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
              <TableWrapper>
                <table className={TABLE_STYLES.table}>
                  <thead className={TABLE_STYLES.thead}>
                    <tr>
                      <th className={TABLE_STYLES.th}>Produit</th>
                      <th className={TABLE_STYLES.th}>Stock Total</th>
                      <th className={TABLE_STYLES.th}>Disponible</th>
                      <th className={TABLE_STYLES.th}>En Utilisation</th>
                      <th className={TABLE_STYLES.th}>Prix/jour</th>
                      <th className={TABLE_STYLES.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={TABLE_STYLES.tbody}>
                    {(() => {
                      // Aggregate inventory by product (combine multiple rows for same product)
                      const aggregatedInventory = inventory.reduce((acc, item) => {
                        const productId = item.product.id;
                        if (acc[productId]) {
                          acc[productId].quantity += item.quantity;
                        } else {
                          acc[productId] = {
                            id: `${item.id}-aggregated`,
                            quantity: item.quantity,
                            product: item.product
                          };
                        }
                        return acc;
                      }, {} as Record<string, { id: string; quantity: number; product: any; }>);
                      
                      return Object.values(aggregatedInventory);
                    })().map((item) => {
                      // Calculate real usage based on current active reservations
                      const today = new Date();
                      const activeReservations = reservations.filter(reservation => {
                        const startDate = new Date(reservation.startAt);
                        const endDate = new Date(reservation.endAt);
                        return reservation.product.id === item.product.id &&
                               reservation.status === 'CONFIRMED' &&
                               startDate <= today && endDate >= today;
                      });
                      
                      const inUse = activeReservations.length;
                      const available = Math.max(0, item.quantity - inUse);
                      
                      return (
                        <tr key={item.id} className={TABLE_STYLES.tr}>
                          <td className={TABLE_STYLES.td}>{item.product.name}</td>
                          <td className={TABLE_STYLES.tdSecondary}>
                            <span className="font-semibold">{item.quantity}</span>
                          </td>
                          <td className={TABLE_STYLES.tdSecondary}>
                            <span className="text-green-600 font-medium">{available}</span>
                          </td>
                          <td className={TABLE_STYLES.tdSecondary}>
                            <span className="text-orange-600 font-medium">{inUse}</span>
                          </td>
                          <td className={TABLE_STYLES.tdSecondary}>
                            {(item.product.pricePerDay / 100).toFixed(2)}€
                          </td>
                          <td className={TABLE_STYLES.actions}>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-200"
                                onClick={() => {
                                  setSelectedProductForStock({
                                    id: item.product.id,
                                    name: item.product.name,
                                    currentQuantity: item.quantity
                                  });
                                  setIsManageStockDialogOpen(true);
                                }}
                              >
                                <Settings className="h-4 w-4" />
                          </Button>
                            </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </TableWrapper>
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
            <h3 className="text-lg font-semibold">Revenus et Comptabilité</h3>
            
            {/* Revenue Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="font-semibold text-gray-700 mb-2">Réservations terminées</h4>
                <p className="text-3xl font-bold text-blue-600">{completedReservations.length}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {((completedReservations.length / Math.max(reservations.length, 1)) * 100).toFixed(1)}% du total
                </p>
              </div>

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
                <h4 className="font-semibold text-gray-700 mb-2">Part de l'hôtel en %</h4>
                <p className="text-3xl font-bold text-purple-600">
                  {(() => {
                    if (reservations.length === 0) return '0%';
                    
                    // Calculate weighted average commission based on actual reservations
                    const totalRevenue = reservations.reduce((sum, res) => sum + res.priceCents, 0);
                    const totalHotelRevenue = reservations.reduce((sum, res) => {
                      // Check if customer used hotel discount code (this would need to be in reservation data)
                      // For now, use hotel default - in real app, this should be per-reservation
                      const commission = hotel.discountCode?.kind === 'HOTEL_70' ? 0.7 : 0.3;
                      return sum + (res.priceCents * commission);
                    }, 0);
                    
                    const averageCommission = totalRevenue > 0 ? (totalHotelRevenue / totalRevenue) * 100 : 0;
                    return `${Math.round(averageCommission)}%`;
                  })()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Commission moyenne sur les ventes
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="font-semibold text-gray-700 mb-2">Part de l'hôtel à reverser</h4>
                <p className="text-3xl font-bold text-purple-600">
                  {hotel.discountCode?.kind === 'HOTEL_70' 
                    ? (totalRevenue * 0.7 / 100).toFixed(2)
                    : (totalRevenue * 0.3 / 100).toFixed(2)}€
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Montant à reverser
                </p>
              </div>
                </div>

            {/* Revenue Stream Table */}
            {reservations.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  Les détails de revenus apparaîtront une fois que des clients auront réservé dans cet hôtel.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Flux de revenus et Comptabilité</h4>
                <TableWrapper>
                  <table className={TABLE_STYLES.table}>
                    <thead className={TABLE_STYLES.thead}>
                      <tr>
                        <th className={TABLE_STYLES.th}>Client</th>
                        <th className={TABLE_STYLES.th}>Période</th>
                        <th className={TABLE_STYLES.th}>Statut</th>
                        <th className={TABLE_STYLES.th}>Commission Hôtel</th>
                        <th className={TABLE_STYLES.th}>Prix Total</th>
                        <th className={TABLE_STYLES.th}>Actions</th>
                  </tr>
                </thead>
                    <tbody className={TABLE_STYLES.tbody}>
                      {reservations.map((reservation) => {
                        const hotelCommission = hotel.discountCode?.kind === 'HOTEL_70' ? 70 : 30;
                        const hotelAmount = (reservation.priceCents * hotelCommission / 100 / 100).toFixed(2);
                        
                        return (
                          <tr key={reservation.id} className={TABLE_STYLES.tr}>
                            <td className={TABLE_STYLES.td}>
                              <div>
                                <div className="font-medium">{reservation.userEmail}</div>
                                <div className="text-gray-500 text-xs">{reservation.code}</div>
                </div>
                            </td>
                            <td className={TABLE_STYLES.tdSecondary}>
                              <div>
                                <div>Du {new Date(reservation.startAt).toLocaleDateString()}</div>
                                <div>Au {new Date(reservation.endAt).toLocaleDateString()}</div>
              </div>
                            </td>
                            <td className={TABLE_STYLES.tdSecondary}>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                reservation.status === 'COMPLETED' 
                                  ? 'bg-green-100 text-green-800'
                                  : reservation.status === 'CONFIRMED'
                                    ? 'bg-blue-100 text-blue-800'
                                    : reservation.status === 'CANCELLED'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                              }`}>
                                {reservation.status}
                              </span>
                            </td>
                            <td className={TABLE_STYLES.tdSecondary}>
                              <div>
                                <div className="font-medium">{hotelCommission}%</div>
                                <div className="text-green-600 font-medium">{hotelAmount}€</div>
            </div>
                            </td>
                            <td className={TABLE_STYLES.tdSecondary}>
                              <div className="font-medium">
                                {(reservation.priceCents / 100).toFixed(2)}€
                              </div>
                            </td>
                            <td className={TABLE_STYLES.actions}>
                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-orange-200 text-orange-600 hover:bg-orange-50"
                                  onClick={() => {
                                    setSelectedReservationForCaution(reservation);
                                    setIsCautionDialogOpen(true);
                                  }}
                                >
                                  Caution
                                </Button>
                              </div>
                            </td>
                  </tr>
                        );
                      })}
                </tbody>
              </table>
                </TableWrapper>
            </div>
            )}
          </div>
        )}
      </div>

      {/* Individual Stock Management Dialog */}
      <Dialog open={isManageStockDialogOpen} onOpenChange={setIsManageStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Gérer le stock: {selectedProductForStock?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Stock actuel</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedProductForStock?.currentQuantity} unités
              </p>
    </div>
            
            <div className="space-y-2">
              <Label htmlFor="stockChange">Quantité à modifier</Label>
              <Input
                id="stockChange"
                type="number"
                min="1"
                placeholder="ex: 5"
                value={stockChangeAmount}
                onChange={(e) => setStockChangeAmount(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                className="flex-1"
                onClick={() => handleManageStock('increase')}
                disabled={isSubmitting || !stockChangeAmount}
              >
                <Plus className="h-4 w-4 mr-2" />
                Augmenter
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleManageStock('decrease')}
                disabled={isSubmitting || !stockChangeAmount}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Diminuer
              </Button>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isSubmitting}>
                  Annuler
                </Button>
              </DialogClose>
            </DialogFooter>
              </div>
        </DialogContent>
      </Dialog>

      {/* Caution Processing Dialog */}
      <Dialog open={isCautionDialogOpen} onOpenChange={setIsCautionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Traitement de la caution</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedReservationForCaution && (
              <>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-medium text-orange-800 mb-2">
                    Réservation: {selectedReservationForCaution.code}
                  </h4>
                  <p className="text-orange-700 text-sm">
                    Client: {selectedReservationForCaution.userEmail}
                  </p>
                  <p className="text-orange-700 text-sm">
                    Produit: {selectedReservationForCaution.product.name}
                  </p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ <strong>Attention:</strong> Cette action va déclencher automatiquement le prélèvement 
                    de la caution ({(selectedReservationForCaution.depositCents / 100).toFixed(2)}€) 
                    via Stripe sur la carte du client.
                  </p>
                </div>
                
                <p className="text-gray-600 text-sm">
                  Voulez-vous procéder au prélèvement de la caution pour cette réservation ?
                </p>
              </>
            )}
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsCautionDialogOpen(false)}
                disabled={isProcessingCaution}
              >
                Annuler
              </Button>
              <Button
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                onClick={handleCautionProcessing}
                disabled={isProcessingCaution}
              >
                {isProcessingCaution ? 'Traitement...' : 'Prélever la caution'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Damage Dialog */}
      <Dialog open={isDamageDialogOpen} onOpenChange={setIsDamageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestion du produit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedReservationForCaution && (
              <>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-800 font-medium">
                    ✅ Caution prélevée avec succès !
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    {(selectedReservationForCaution.depositCents / 100).toFixed(2)}€ 
                    ont été débités sur la carte du client.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Statut du produit: {selectedReservationForCaution.product.name}
                  </h4>
                  <p className="text-blue-700 text-sm">
                    Le produit a-t-il été endommagé et doit-il être retiré du stock disponible ?
                  </p>
                </div>
              </>
            )}
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleProductDamage(false)}
                disabled={isProcessingCaution}
              >
                Produit OK
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={() => handleProductDamage(true)}
                disabled={isProcessingCaution}
              >
                {isProcessingCaution ? 'Traitement...' : 'Produit Endommagé'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Hotel Dialog */}
      <Dialog open={isEditHotelDialogOpen} onOpenChange={setIsEditHotelDialogOpen}>
        <DialogContent className="max-w-md">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Modifier les informations de l'hôtel</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-hotel-name">Nom de l'hôtel</Label>
                <Input
                  id="edit-hotel-name"
                  value={editHotelForm.name}
                  onChange={(e) => setEditHotelForm({...editHotelForm, name: e.target.value})}
                  placeholder="Nom de l'hôtel"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-hotel-address">Adresse</Label>
                <Textarea
                  id="edit-hotel-address"
                  value={editHotelForm.address}
                  onChange={(e) => setEditHotelForm({...editHotelForm, address: e.target.value})}
                  placeholder="Adresse complète"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-hotel-phone">Téléphone</Label>
                <Input
                  id="edit-hotel-phone"
                  value={editHotelForm.phone}
                  onChange={(e) => setEditHotelForm({...editHotelForm, phone: e.target.value})}
                  placeholder="Numéro de téléphone"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-hotel-contact">Nom du contact</Label>
                <Input
                  id="edit-hotel-contact"
                  value={editHotelForm.contactName}
                  onChange={(e) => setEditHotelForm({...editHotelForm, contactName: e.target.value})}
                  placeholder="Nom de la personne de contact"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-hotel-email">Email du contact</Label>
                <Input
                  id="edit-hotel-email"
                  type="email"
                  value={editHotelForm.contactEmail}
                  onChange={(e) => setEditHotelForm({...editHotelForm, contactEmail: e.target.value})}
                  placeholder="email@exemple.com"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsEditHotelDialogOpen(false)}>
                Annuler
              </Button>
              <Button className="flex-1" onClick={handleEditHotel} disabled={isSubmitting}>
                {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Discount Code Dialog */}
      <Dialog open={isEditDiscountDialogOpen} onOpenChange={setIsEditDiscountDialogOpen}>
        <DialogContent className="max-w-md">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Modifier le code de réduction</h3>
            </div>
            
            <form onSubmit={handleEditDiscountCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-discount-code">Code de réduction *</Label>
                <Input 
                  id="edit-discount-code" 
                  name="code" 
                  value={editDiscountForm.code}
                  onChange={(e) => setEditDiscountForm({...editDiscountForm, code: e.target.value})}
                  placeholder="ex: HOTEL30, EASY70..."
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-discount-kind">Type de partage *</Label>
                <select 
                  id="edit-discount-kind" 
                  name="kind" 
                  value={editDiscountForm.kind}
                  onChange={(e) => setEditDiscountForm({...editDiscountForm, kind: e.target.value as 'HOTEL_70' | 'PLATFORM_70'})}
                  required
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="HOTEL_70">Hôtel 70% - EasyBaby 30%</option>
                  <option value="PLATFORM_70">EasyBaby 70% - Hôtel 30%</option>
                </select>
              </div>
              
              <div className="flex space-x-3">
                <Button variant="outline" className="flex-1" onClick={() => setIsEditDiscountDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Modification..." : "Modifier"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </UniversalAdminLayout>
  );
}
