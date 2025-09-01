"use client";

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useBasket } from './basket-provider';

interface BasketIconProps {
  onClick: () => void;
  className?: string;
}

export function BasketIcon({ onClick, className = '' }: BasketIconProps) {
  const { getBasketItemCount } = useBasket();
  const itemCount = getBasketItemCount();

  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
      aria-label={`Basket (${itemCount} items)`}
    >
      <ShoppingCart className="h-6 w-6 text-white" />
      
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
