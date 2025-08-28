"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

// Données de démonstration pour la V1
const demoProducts = [
  {
    id: "1",
    name: "Poussette",
    description: "Poussette légère et confortable pour bébé",
    imageUrl: "/placeholder-product.svg",
    basePrice: 0,
    deposit: 15000,
    pricePerHour: 500,
    pricePerDay: 2000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Lit parapluie",
    description: "Lit pliant facile à transporter",
    imageUrl: "/placeholder-product.svg",
    basePrice: 0,
    deposit: 20000,
    pricePerHour: 400,
    pricePerDay: 1500,
    createdAt: new Date().toISOString(),
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState(demoProducts);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newProduct = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      imageUrl: "/placeholder-product.svg",
      basePrice: 0,
      deposit: parseInt(formData.get("deposit") as string) * 100,
      pricePerHour: parseInt(formData.get("pricePerHour") as string) * 100,
      pricePerDay: parseInt(formData.get("pricePerDay") as string) * 100,
      createdAt: new Date().toISOString(),
    };
    
    setProducts([...products, newProduct]);
    setIsAddDialogOpen(false);
  };

  const handleEditProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updatedProducts = products.map(product => {
      if (product.id === currentProduct.id) {
        return {
          ...product,
          name: formData.get("name") as string,
          description: formData.get("description") as string,
          deposit: parseInt(formData.get("deposit") as string) * 100,
          pricePerHour: parseInt(formData.get("pricePerHour") as string) * 100,
          pricePerDay: parseInt(formData.get("pricePerDay") as string) * 100,
        };
      }
      return product;
    });
    
    setProducts(updatedProducts);
    setIsEditDialogOpen(false);
  };

  const handleDeleteProduct = () => {
    const updatedProducts = products.filter(product => product.id !== currentProduct.id);
    setProducts(updatedProducts);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Produits</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Ajouter un produit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un produit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit">Caution (€)</Label>
                <Input id="deposit" name="deposit" type="number" min="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerHour">Prix par heure (€)</Label>
                <Input id="pricePerHour" name="pricePerHour" type="number" min="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerDay">Prix par jour (€)</Label>
                <Input id="pricePerDay" name="pricePerDay" type="number" min="0" required />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Annuler</Button>
                </DialogClose>
                <Button type="submit">Ajouter</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Caution
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix/Heure
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix/Jour
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full" src={product.imageUrl} alt={product.name} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{(product.deposit / 100).toFixed(2)} €</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{(product.pricePerHour / 100).toFixed(2)} €</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{(product.pricePerDay / 100).toFixed(2)} €</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Dialog open={isEditDialogOpen && currentProduct?.id === product.id} onOpenChange={(open) => {
                    setIsEditDialogOpen(open);
                    if (!open) setCurrentProduct(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setCurrentProduct(product)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Modifier le produit</DialogTitle>
                      </DialogHeader>
                      {currentProduct && (
                        <form onSubmit={handleEditProduct} className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Nom</Label>
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
                              defaultValue={currentProduct.description} 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-deposit">Caution (€)</Label>
                            <Input 
                              id="edit-deposit" 
                              name="deposit" 
                              type="number" 
                              min="0" 
                              defaultValue={(currentProduct.deposit / 100).toString()} 
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-pricePerHour">Prix par heure (€)</Label>
                            <Input 
                              id="edit-pricePerHour" 
                              name="pricePerHour" 
                              type="number" 
                              min="0" 
                              defaultValue={(currentProduct.pricePerHour / 100).toString()} 
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-pricePerDay">Prix par jour (€)</Label>
                            <Input 
                              id="edit-pricePerDay" 
                              name="pricePerDay" 
                              type="number" 
                              min="0" 
                              defaultValue={(currentProduct.pricePerDay / 100).toString()} 
                              required 
                            />
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="outline">Annuler</Button>
                            </DialogClose>
                            <Button type="submit">Enregistrer</Button>
                          </DialogFooter>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={isDeleteDialogOpen && currentProduct?.id === product.id} onOpenChange={(open) => {
                    setIsDeleteDialogOpen(open);
                    if (!open) setCurrentProduct(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-800"
                        onClick={() => setCurrentProduct(product)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Supprimer le produit</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p>Êtes-vous sûr de vouloir supprimer ce produit ?</p>
                        <p className="font-medium mt-2">{currentProduct?.name}</p>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button 
                          variant="destructive" 
                          onClick={handleDeleteProduct}
                        >
                          Supprimer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}