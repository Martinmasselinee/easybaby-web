"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogClose } from "@/components/ui/dialog";
import { ButtonSpinner } from "@/components/ui/spinner";

type Product = {
  id: string;
  name: string;
  description?: string;
  pricePerHour: number;
  pricePerDay: number;
  deposit: number;
};

interface AddProductToStockFormProps {
  hotelId: string;
  onSuccess: () => void;
}

export function AddProductToStockForm({ hotelId, onSuccess }: AddProductToStockFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Charger les produits disponibles
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (err: any) {
        console.error("Erreur lors du chargement des produits:", err);
        setError("Erreur lors du chargement des produits");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductId || !quantity) {
      setError("Veuillez sélectionner un produit et une quantité");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/inventory/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hotelId,
          productId: selectedProductId,
          quantity: parseInt(quantity),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      onSuccess();
      // Reset form
      setSelectedProductId("");
      setQuantity("1");
    } catch (err: any) {
      console.error("Erreur lors de l'ajout du produit:", err);
      setError(err.message || "Erreur lors de l'ajout du produit");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p>Chargement des produits...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">
          Aucun produit disponible. Vous devez d'abord créer des produits.
        </p>
        <DialogClose asChild>
          <Button variant="outline">Fermer</Button>
        </DialogClose>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-800 bg-red-100 border border-red-300 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="product">Produit *</Label>
          <select
            id="product"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner un produit</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - {(product.pricePerDay / 100).toFixed(2)}€/jour
              </option>
            ))}
          </select>
        </div>

        {selectedProductId && (
          <div className="p-4 bg-gray-50 rounded-md">
            {(() => {
              const selectedProduct = products.find(p => p.id === selectedProductId);
              if (!selectedProduct) return null;
              
              return (
                <div>
                  <h4 className="font-medium mb-2">{selectedProduct.name}</h4>
                  {selectedProduct.description && (
                    <p className="text-sm text-gray-600 mb-2">{selectedProduct.description}</p>
                  )}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Prix/heure:</span>
                      <div className="font-medium">{(selectedProduct.pricePerHour / 100).toFixed(2)}€</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Prix/jour:</span>
                      <div className="font-medium">{(selectedProduct.pricePerDay / 100).toFixed(2)}€</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Caution:</span>
                      <div className="font-medium">{(selectedProduct.deposit / 100).toFixed(2)}€</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        <div>
          <Label htmlFor="quantity">Quantité en stock *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="1"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Nombre d'unités de ce produit disponibles dans cet hôtel
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Annuler
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting || !selectedProductId}>
          {isSubmitting ? <ButtonSpinner /> : "Ajouter au stock"}
        </Button>
      </div>
    </form>
  );
}
