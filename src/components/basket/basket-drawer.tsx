"use client";

import React, { useState } from 'react';
import { X, Trash2, Calendar, MapPin, Package, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBasket } from './basket-provider';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface BasketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BasketDrawer({ isOpen, onClose }: BasketDrawerProps) {
  const { state, removeBasketItem, getBasketTotal } = useBasket();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'fr';
  
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const handleRemoveItem = async (itemId: string) => {
    setIsRemoving(itemId);
    try {
      await removeBasketItem(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setIsRemoving(null);
    }
  };

  const { price, deposit } = getBasketTotal();

  const translations = {
    fr: {
      title: 'Mon Panier',
      empty: 'Votre panier est vide',
      total: 'Total',
      deposit: 'Caution',
      checkout: 'Commander',
      continue: 'Continuer les achats',
      remove: 'Supprimer',
      pickup: 'Retrait',
      dropoff: 'Retour',
      quantity: 'Quantité',
    },
    en: {
      title: 'My Basket',
      empty: 'Your basket is empty',
      total: 'Total',
      deposit: 'Deposit',
      checkout: 'Checkout',
      continue: 'Continue Shopping',
      remove: 'Remove',
      pickup: 'Pickup',
      dropoff: 'Return',
      quantity: 'Quantity',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.fr;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">{t.title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {state.basket?.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <Package className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">{t.empty}</p>
                <p className="text-sm mt-2">Ajoutez des produits pour commencer</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.basket?.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {item.productName}
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{item.pickupHotelName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(item.pickupDate)} - {formatDate(item.dropDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{t.quantity}: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isRemoving === item.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{t.pickup}</span>
                      <span className="font-medium">{formatPrice(item.priceCents)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.basket?.items.length > 0 && (
            <div className="border-t p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t.total}</span>
                <span className="font-medium">{formatPrice(price * 100)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t.deposit}</span>
                <span className="font-medium">{formatPrice(deposit * 100)}</span>
              </div>
              
              <div className="space-y-2">
                <Button 
                  className="w-full bg-pink-600 hover:bg-pink-700"
                  asChild
                >
                  <Link href={`/${locale}/basket/checkout`}>
                    {t.checkout}
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={onClose}
                >
                  {t.continue}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
