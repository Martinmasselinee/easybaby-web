"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from "@/components/ui/dialog";

type Product = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  pricePerHour: number;
  pricePerDay: number;
  deposit: number;
  _count: {
    inventory: number;
    reservations: number;
  };
  createdAt: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      console.error("Erreur lors du chargement des produits:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      imageUrl: formData.get("imageUrl") as string || undefined,
      pricePerHour: Math.round(parseFloat(formData.get("pricePerHour") as string) * 100), // Convert to cents
      pricePerDay: Math.round(parseFloat(formData.get("pricePerDay") as string) * 100), // Convert to cents
      deposit: Math.round(parseFloat(formData.get("deposit") as string) * 100), // Convert to cents
    };

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création");
      }

      await fetchProducts(); // Refresh the list
      setIsAddDialogOpen(false);
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error("Erreur lors de la création du produit:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentProduct) return;

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      imageUrl: formData.get("imageUrl") as string || undefined,
      pricePerHour: Math.round(parseFloat(formData.get("pricePerHour") as string) * 100),
      pricePerDay: Math.round(parseFloat(formData.get("pricePerDay") as string) * 100),
      deposit: Math.round(parseFloat(formData.get("deposit") as string) * 100),
    };

    try {
      const response = await fetch(`/api/products/${currentProduct.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la modification");
      }

      await fetchProducts(); // Refresh the list
      setIsEditDialogOpen(false);
      setCurrentProduct(null);
    } catch (error: any) {
      console.error("Erreur lors de la modification du produit:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le produit "${productName}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la suppression");
      }

      await fetchProducts(); // Refresh the list
    } catch (error: any) {
      console.error("Erreur lors de la suppression du produit:", error);
      alert(`Erreur: ${error.message}`);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Produits</h1>
          <p className="text-muted-foreground">Gérez votre catalogue de produits</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <p>Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Produits</h1>
          <p className="text-muted-foreground">Gérez votre catalogue de produits</p>
        </div>
        <div className="text-center py-8 text-red-600">
          <p>Erreur : {error}</p>
          <Button onClick={() => fetchProducts()} className="mt-2">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Produits</h1>
          <p className="text-muted-foreground">
            Gérez votre catalogue d'équipements pour bébé
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Ajouter un produit</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau produit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du produit *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="ex: Poussette Premium, Lit Parapluie..."
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Décrivez les caractéristiques du produit..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL de l'image</Label>
                <Input 
                  id="imageUrl" 
                  name="imageUrl" 
                  type="url"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricePerHour">Prix par heure (€) *</Label>
                  <Input 
                    id="pricePerHour" 
                    name="pricePerHour" 
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="ex: 2.50"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerDay">Prix par jour (€) *</Label>
                  <Input 
                    id="pricePerDay" 
                    name="pricePerDay" 
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="ex: 15.00"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit">Caution (€) *</Label>
                  <Input 
                    id="deposit" 
                    name="deposit" 
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="ex: 50.00"
                    required 
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 Après création :</strong> Vous pourrez ajouter ce produit 
                  au stock de vos hôtels partenaires dans la section "Stock".
                </p>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    Annuler
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Création..." : "Créer le produit"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun produit dans le catalogue
          </h3>
          <p className="text-gray-600 mb-6">
            Créez votre premier produit pour commencer à proposer des équipements à la location.
          </p>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Créer mon premier produit</Button>
            </DialogTrigger>
          </Dialog>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="w-full rounded-md border px-4 py-2 pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm">
                {product.imageUrl && (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                  )}
                  
                  <div className="space-y-1 mb-4 text-sm">
                    <p><strong>Prix/heure :</strong> {(product.pricePerHour / 100).toFixed(2)}€</p>
                    <p><strong>Prix/jour :</strong> {(product.pricePerDay / 100).toFixed(2)}€</p>
                    <p><strong>Caution :</strong> {(product.deposit / 100).toFixed(2)}€</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{product._count.inventory} hôtels</span>
                    <span>{product._count.reservations} réservations</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentProduct(product);
                        setIsEditDialogOpen(true);
                      }}
                      className="flex-1"
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      disabled={product._count.inventory > 0 || product._count.reservations > 0}
                      title={
                        product._count.inventory > 0 || product._count.reservations > 0
                          ? "Impossible de supprimer : produit utilisé"
                          : "Supprimer ce produit"
                      }
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
          </DialogHeader>
          {currentProduct && (
            <form onSubmit={handleEditProduct} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom du produit *</Label>
                <Input 
                  id="edit-name" 
                  name="name" 
                  defaultValue={currentProduct.name}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  name="description" 
                  defaultValue={currentProduct.description || ""}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-imageUrl">URL de l'image</Label>
                <Input 
                  id="edit-imageUrl" 
                  name="imageUrl" 
                  type="url"
                  defaultValue={currentProduct.imageUrl || ""}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-pricePerHour">Prix par heure (€) *</Label>
                  <Input 
                    id="edit-pricePerHour" 
                    name="pricePerHour" 
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={(currentProduct.pricePerHour / 100).toFixed(2)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-pricePerDay">Prix par jour (€) *</Label>
                  <Input 
                    id="edit-pricePerDay" 
                    name="pricePerDay" 
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={(currentProduct.pricePerDay / 100).toFixed(2)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-deposit">Caution (€) *</Label>
                  <Input 
                    id="edit-deposit" 
                    name="deposit" 
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={(currentProduct.deposit / 100).toFixed(2)}
                    required 
                  />
                </div>
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
