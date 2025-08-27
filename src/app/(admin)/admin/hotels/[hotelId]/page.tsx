"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  inventory?: InventoryItem[];
};

type InventoryItem = {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    pricePerHour: number;
    pricePerDay: number;
    deposit: number;
  };
  quantity: number;
  inUse?: number;
  available?: number;
};

type Reservation = {
  id: string;
  code: string;
  status: string;
  product: {
    name: string;
  };
  userEmail: string;
  startAt: string;
  endAt: string;
};

export default function AdminHotelDetailPage({
  params,
}: {
  params: { hotelId: string };
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "info" | "stock" | "reservations" | "revenue"
  >("info");
  
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    contactName: "",
  });
  
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountKind, setDiscountKind] = useState<"PLATFORM_70" | "HOTEL_70">("HOTEL_70");
  
  // Charger les données de l'hôtel
  useEffect(() => {
    const fetchHotelData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/hotels/${params.hotelId}`);
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        setHotel(data);
        setFormData({
          name: data.name,
          address: data.address,
          email: data.email,
          phone: data.phone || "",
          contactName: data.contactName || "",
        });
        
        if (data.discountCode) {
          setDiscountCode(data.discountCode.code);
          setDiscountKind(data.discountCode.kind);
        }
        
        // Charger l'inventaire
        const inventoryResponse = await fetch(`/api/inventory/hotel/${params.hotelId}`);
        if (inventoryResponse.ok) {
          const inventoryData = await inventoryResponse.json();
          setInventory(inventoryData);
        }
        
        // TODO: Charger les réservations
        // Pour l'instant, utiliser des données de démo
        setReservations([
          {
            id: "res1",
            code: "DEMO123456",
            status: "CONFIRMED",
            product: { name: "Poussette" },
            userEmail: "client@example.com",
            startAt: "2023-07-15T10:00:00",
            endAt: "2023-07-20T14:00:00",
          },
          {
            id: "res2",
            code: "DEMO789012",
            status: "PENDING",
            product: { name: "Lit parapluie" },
            userEmail: "autre@example.com",
            startAt: "2023-07-18T11:00:00",
            endAt: "2023-07-22T16:00:00",
          },
        ]);
        
      } catch (err) {
        console.error("Erreur lors du chargement des données de l'hôtel:", err);
        setError("Impossible de charger les données de l'hôtel. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHotelData();
  }, [params.hotelId]);
  
  // Gérer la mise à jour des informations de l'hôtel
  const handleUpdateHotel = async () => {
    try {
      const response = await fetch(`/api/hotels/${params.hotelId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }
      
      const updatedHotel = await response.json();
      setHotel(updatedHotel);
      setIsEditMode(false);
      
      // Afficher un message de succès
      alert("Les informations de l'hôtel ont été mises à jour avec succès.");
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'hôtel:", err);
      setError(err.message || "Une erreur est survenue lors de la mise à jour de l'hôtel.");
    }
  };
  
  // Gérer la mise à jour du code de réduction
  const handleUpdateDiscountCode = async () => {
    try {
      const response = await fetch(`/api/hotels/${params.hotelId}/discount`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: discountCode,
          kind: discountKind,
          active: true,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }
      
      const updatedDiscountCode = await response.json();
      setHotel(prev => prev ? {
        ...prev,
        discountCode: updatedDiscountCode,
      } : null);
      setIsDiscountDialogOpen(false);
      
      // Afficher un message de succès
      alert("Le code de réduction a été mis à jour avec succès.");
    } catch (err) {
      console.error("Erreur lors de la mise à jour du code de réduction:", err);
      setError(err.message || "Une erreur est survenue lors de la mise à jour du code de réduction.");
    }
  };
  
  // Gérer le changement des champs du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p>Chargement des données de l'hôtel...</p>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">
          {error || "Hôtel non trouvé"}
        </h1>
        <Button asChild>
          <Link href="/admin/hotels">Retour</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
          <p className="text-muted-foreground">{hotel.city.name}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/hotels">Retour</Link>
        </Button>
      </div>

      <div className="border-b">
        <div className="flex space-x-8">
          <button
            className={`px-4 py-2 border-b-2 ${
              activeTab === "info"
                ? "border-primary text-primary font-medium"
                : "border-transparent"
            }`}
            onClick={() => setActiveTab("info")}
          >
            Informations
          </button>
          <button
            className={`px-4 py-2 border-b-2 ${
              activeTab === "stock"
                ? "border-primary text-primary font-medium"
                : "border-transparent"
            }`}
            onClick={() => setActiveTab("stock")}
          >
            Stock
          </button>
          <button
            className={`px-4 py-2 border-b-2 ${
              activeTab === "reservations"
                ? "border-primary text-primary font-medium"
                : "border-transparent"
            }`}
            onClick={() => setActiveTab("reservations")}
          >
            Réservations
          </button>
          <button
            className={`px-4 py-2 border-b-2 ${
              activeTab === "revenue"
                ? "border-primary text-primary font-medium"
                : "border-transparent"
            }`}
            onClick={() => setActiveTab("revenue")}
          >
            Revenus
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === "info" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom</label>
                  <Input
                    type="text"
                    name="name"
                    value={isEditMode ? formData.name : hotel.name}
                    onChange={handleInputChange}
                    readOnly={!isEditMode}
                    className={isEditMode ? "" : "bg-gray-50"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Adresse</label>
                  <Input
                    type="text"
                    name="address"
                    value={isEditMode ? formData.address : hotel.address}
                    onChange={handleInputChange}
                    readOnly={!isEditMode}
                    className={isEditMode ? "" : "bg-gray-50"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ville</label>
                  <Input
                    type="text"
                    value={hotel.city.name}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={isEditMode ? formData.email : hotel.email}
                    onChange={handleInputChange}
                    readOnly={!isEditMode}
                    className={isEditMode ? "" : "bg-gray-50"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Téléphone</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={isEditMode ? formData.phone : hotel.phone || ""}
                    onChange={handleInputChange}
                    readOnly={!isEditMode}
                    className={isEditMode ? "" : "bg-gray-50"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact</label>
                  <Input
                    type="text"
                    name="contactName"
                    value={isEditMode ? formData.contactName : hotel.contactName || ""}
                    onChange={handleInputChange}
                    readOnly={!isEditMode}
                    className={isEditMode ? "" : "bg-gray-50"}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code de réduction</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  className="flex-1 bg-gray-50"
                  value={hotel.discountCode?.code || "Non défini"}
                  readOnly
                />
                <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Modifier</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Modifier le code de réduction</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="discount-code">Code de réduction</Label>
                        <Input 
                          id="discount-code" 
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          placeholder="ex: HOTEL123"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount-type">Type de répartition</Label>
                        <select 
                          id="discount-type"
                          className="w-full border rounded-md p-2"
                          value={discountKind}
                          onChange={(e) => setDiscountKind(e.target.value as "PLATFORM_70" | "HOTEL_70")}
                        >
                          <option value="HOTEL_70">70% hôtel / 30% plateforme</option>
                          <option value="PLATFORM_70">30% hôtel / 70% plateforme</option>
                        </select>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Annuler</Button>
                      </DialogClose>
                      <Button onClick={handleUpdateDiscountCode}>Enregistrer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {discountKind === "HOTEL_70" 
                  ? "Ce code permet à l'hôtel de bénéficier d'une répartition des revenus 70/30 en sa faveur."
                  : "Ce code applique une répartition des revenus 30/70 en faveur de la plateforme."}
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              {isEditMode ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditMode(false)}>Annuler</Button>
                  <Button onClick={handleUpdateHotel}>Enregistrer</Button>
                </>
              ) : (
                <Button onClick={() => setIsEditMode(true)}>Modifier</Button>
              )}
            </div>
          </div>
        )}

        {activeTab === "stock" && (
          <div className="space-y-6">
            {inventory.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground">Aucun produit en stock</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium">Produit</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Quantité</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Prix/Heure</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Prix/Jour</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Caution</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-3 text-sm font-medium">{item.product.name}</td>
                        <td className="px-4 py-3 text-sm">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm">{(item.product.pricePerHour / 100).toFixed(2)} €</td>
                        <td className="px-4 py-3 text-sm">{(item.product.pricePerDay / 100).toFixed(2)} €</td>
                        <td className="px-4 py-3 text-sm">{(item.product.deposit / 100).toFixed(2)} €</td>
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
            <div className="flex justify-end">
              <Button>Ajouter un produit</Button>
            </div>
          </div>
        )}

        {activeTab === "reservations" && (
          <div className="space-y-6">
            {reservations.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground">Aucune réservation trouvée</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium">Code</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Produit</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Retrait</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Retour</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((reservation) => (
                      <tr key={reservation.id} className="border-b">
                        <td className="px-4 py-3 text-sm">{reservation.code}</td>
                        <td className="px-4 py-3 text-sm">{reservation.product.name}</td>
                        <td className="px-4 py-3 text-sm">{reservation.userEmail}</td>
                        <td className="px-4 py-3 text-sm">
                          {new Intl.DateTimeFormat("fr", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(reservation.startAt))}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Intl.DateTimeFormat("fr", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(reservation.endAt))}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              reservation.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                              reservation.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                              reservation.status === "COMPLETED" ? "bg-blue-100 text-blue-800" :
                              reservation.status === "NO_SHOW" ? "bg-orange-100 text-orange-800" :
                              reservation.status === "DAMAGED" ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {reservation.status === "CONFIRMED" ? "Confirmée" : 
                             reservation.status === "PENDING" ? "En attente" :
                             reservation.status === "COMPLETED" ? "Terminée" :
                             reservation.status === "NO_SHOW" ? "Non présenté" :
                             reservation.status === "DAMAGED" ? "Endommagé" :
                             "Annulée"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/reservations/${reservation.id}`}>
                              Voir
                            </Link>
                          </Button>
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
            <div className="flex items-center gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Période</label>
                <select className="border rounded-md p-2">
                  <option>Juillet 2023</option>
                  <option>Juin 2023</option>
                </select>
              </div>
              <Button variant="outline">Exporter CSV</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-lg border bg-card p-6">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Revenu total</h3>
                  <div className="text-3xl font-bold">0 €</div>
                  <p className="text-xs text-muted-foreground">Pilote gratuit</p>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Part plateforme</h3>
                  <div className="text-3xl font-bold">0 €</div>
                  <p className="text-xs text-muted-foreground">30% ou 70%</p>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Part hôtel</h3>
                  <div className="text-3xl font-bold">0 €</div>
                  <p className="text-xs text-muted-foreground">70% ou 30%</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium">Réservation</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Produit</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Revenu</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Part hôtel</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Part plateforme</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Code utilisé</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-3 text-sm">DEMO123456</td>
                    <td className="px-4 py-3 text-sm">Poussette</td>
                    <td className="px-4 py-3 text-sm">0 €</td>
                    <td className="px-4 py-3 text-sm">0 €</td>
                    <td className="px-4 py-3 text-sm">0 €</td>
                    <td className="px-4 py-3 text-sm">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}