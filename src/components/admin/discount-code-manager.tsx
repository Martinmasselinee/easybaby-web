"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DiscountCodeManagerProps {
  hotelId: string;
  initialCode?: string;
  initialType?: "PLATFORM_70" | "HOTEL_70";
  onUpdate?: (success: boolean) => void;
}

export function DiscountCodeManager({
  hotelId,
  initialCode = "",
  initialType = "HOTEL_70",
  onUpdate,
}: DiscountCodeManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [codeType, setCodeType] = useState<"PLATFORM_70" | "HOTEL_70">(initialType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentCode, setCurrentCode] = useState(initialCode);
  const [currentType, setCurrentType] = useState(initialType);

  // Mettre à jour les états lorsque les props changent
  useEffect(() => {
    setCode(initialCode);
    setCodeType(initialType);
    setCurrentCode(initialCode);
    setCurrentType(initialType);
  }, [initialCode, initialType]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError("Le code de réduction ne peut pas être vide");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/hotels/${hotelId}/discount`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          kind: codeType,
          active: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Erreur HTTP: ${response.status}`);
      }

      const updatedCode = await response.json();
      setCurrentCode(updatedCode.code);
      setCurrentType(updatedCode.kind);
      setSuccess("Le code de réduction a été mis à jour avec succès");
      
      if (onUpdate) {
        onUpdate(true);
      }

      // Fermer la boîte de dialogue après un court délai
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du code de réduction:", err);
      setError(err.message || "Une erreur est survenue lors de la mise à jour du code");
      
      if (onUpdate) {
        onUpdate(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Réinitialiser les états lorsque la boîte de dialogue s'ouvre
      setCode(currentCode);
      setCodeType(currentType);
      setError(null);
      setSuccess(null);
    }
  };

  const getRevenueShareText = () => {
    return codeType === "HOTEL_70" 
      ? "70% pour l'hôtel / 30% pour la plateforme" 
      : "30% pour l'hôtel / 70% pour la plateforme";
  };

  const getCurrentRevenueShareText = () => {
    return currentType === "HOTEL_70" 
      ? "70% pour l'hôtel / 30% pour la plateforme" 
      : "30% pour l'hôtel / 70% pour la plateforme";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Code de réduction hôtel</h3>
          <p className="text-sm text-muted-foreground">
            Ce code permet aux clients d'obtenir une réduction et modifie la répartition des revenus.
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          {currentCode ? "Modifier" : "Ajouter"}
        </Button>
      </div>

      {currentCode ? (
        <div className="border rounded-md p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{currentCode}</p>
              <p className="text-sm text-muted-foreground">{getCurrentRevenueShareText()}</p>
            </div>
            <div className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              Actif
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-md p-4 bg-gray-50 text-center">
          <p className="text-muted-foreground">Aucun code de réduction défini</p>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentCode ? "Modifier le code de réduction" : "Ajouter un code de réduction"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="discount-code">Code de réduction</Label>
              <Input
                id="discount-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ex: HOTEL123"
              />
              <p className="text-xs text-muted-foreground">
                Ce code sera utilisé par les clients lors de la réservation.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discount-type">Type de répartition des revenus</Label>
              <select
                id="discount-type"
                className="w-full border rounded-md p-2"
                value={codeType}
                onChange={(e) => setCodeType(e.target.value as "PLATFORM_70" | "HOTEL_70")}
              >
                <option value="HOTEL_70">70% hôtel / 30% plateforme</option>
                <option value="PLATFORM_70">30% hôtel / 70% plateforme</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Détermine comment les revenus seront répartis lorsque ce code est utilisé.
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
                {success}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
