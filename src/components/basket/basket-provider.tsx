"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Types
export interface BasketItem {
  id: string;
  productId: string;
  productName: string;
  pickupHotelId: string;
  pickupHotelName: string;
  dropHotelId: string;
  dropHotelName: string;
  pickupDate: Date;
  dropDate: Date;
  quantity: number;
  priceCents: number;
  depositCents: number;
}

export interface Basket {
  id: string;
  userEmail: string;
  sessionId?: string;
  status: 'ACTIVE' | 'CONVERTED' | 'EXPIRED' | 'ABANDONED';
  items: BasketItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface BasketState {
  basket: Basket | null;
  loading: boolean;
  error: string | null;
}

type BasketAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BASKET'; payload: Basket | null }
  | { type: 'ADD_ITEM'; payload: BasketItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<BasketItem> } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_BASKET' };

// Initial state
const initialState: BasketState = {
  basket: null,
  loading: false,
  error: null,
};

// Reducer
function basketReducer(state: BasketState, action: BasketAction): BasketState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_BASKET':
      return { ...state, basket: action.payload };
    case 'ADD_ITEM':
      if (!state.basket) return state;
      return {
        ...state,
        basket: {
          ...state.basket,
          items: [...state.basket.items, action.payload],
        },
      };
    case 'UPDATE_ITEM':
      if (!state.basket) return state;
      return {
        ...state,
        basket: {
          ...state.basket,
          items: state.basket.items.map(item =>
            item.id === action.payload.id
              ? { ...item, ...action.payload.updates }
              : item
          ),
        },
      };
    case 'REMOVE_ITEM':
      if (!state.basket) return state;
      return {
        ...state,
        basket: {
          ...state.basket,
          items: state.basket.items.filter(item => item.id !== action.payload),
        },
      };
    case 'CLEAR_BASKET':
      return { ...state, basket: null };
    default:
      return state;
  }
}

// Context
interface BasketContextType {
  state: BasketState;
  createBasket: (userEmail: string, sessionId?: string) => Promise<void>;
  getBasket: (userEmail?: string, sessionId?: string) => Promise<void>;
  addItemToBasket: (item: Omit<BasketItem, 'id'>) => Promise<void>;
  updateBasketItem: (id: string, updates: Partial<BasketItem>) => Promise<void>;
  removeBasketItem: (id: string) => Promise<void>;
  clearBasket: () => void;
  getBasketItemCount: () => number;
  getItemPrice: (item: BasketItem) => number;
  getBasketTotal: () => { price: number; deposit: number };
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

// Provider component
interface BasketProviderProps {
  children: ReactNode;
}

export function BasketProvider({ children }: BasketProviderProps) {
  const [state, dispatch] = useReducer(basketReducer, initialState);

  // Load basket from localStorage on mount
  useEffect(() => {
    const savedBasket = localStorage.getItem('easybaby-basket');
    if (savedBasket) {
      try {
        const basket = JSON.parse(savedBasket);
        dispatch({ type: 'SET_BASKET', payload: basket });
      } catch (error) {
        console.error('Error loading basket from localStorage:', error);
        localStorage.removeItem('easybaby-basket');
      }
    }
  }, []);

  // Save basket to localStorage when it changes
  useEffect(() => {
    if (state.basket) {
      localStorage.setItem('easybaby-basket', JSON.stringify(state.basket));
    } else {
      localStorage.removeItem('easybaby-basket');
    }
  }, [state.basket]);

  const createBasket = async (userEmail: string, sessionId?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch('/api/basket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create basket');
      }

      const basket = await response.json();
      dispatch({ type: 'SET_BASKET', payload: basket });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getBasket = async (userEmail?: string, sessionId?: string) => {
    if (!userEmail && !sessionId) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const params = new URLSearchParams();
      if (userEmail) params.append('userEmail', userEmail);
      if (sessionId) params.append('sessionId', sessionId);

      const response = await fetch(`/api/basket?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 404) {
          dispatch({ type: 'SET_BASKET', payload: null });
          return;
        }
        throw new Error('Failed to get basket');
      }

      const basket = await response.json();
      dispatch({ type: 'SET_BASKET', payload: basket });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addItemToBasket = async (item: Omit<BasketItem, 'id'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      console.log('Adding item to basket:', item);
      console.log('Current basket state:', state.basket);

      // If no basket exists, create one first
      if (!state.basket) {
        console.log('No basket exists, creating new basket...');
        const createResponse = await fetch('/api/basket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail: 'temp@example.com' }), // Temporary email
        });

        if (!createResponse.ok) {
          throw new Error('Failed to create basket');
        }

        const newBasket = await createResponse.json();
        console.log('Created new basket:', newBasket);
        dispatch({ type: 'SET_BASKET', payload: newBasket });
      }

      // Now add the item to the basket
      const currentBasket = state.basket;
      console.log('Adding item to basket with ID:', currentBasket?.id);
      
      const response = await fetch(`/api/basket/${currentBasket!.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.productId,
          pickupHotelId: item.pickupHotelId,
          dropHotelId: item.dropHotelId,
          pickupDate: item.pickupDate.toISOString(),
          dropDate: item.dropDate.toISOString(),
          quantity: item.quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add item to basket');
      }

      const basketItem = await response.json();
      console.log('Added basket item:', basketItem);
      dispatch({ type: 'ADD_ITEM', payload: basketItem });
    } catch (error) {
      console.error('Error in addItemToBasket:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateBasketItem = async (id: string, updates: Partial<BasketItem>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const updateData: any = {};
      if (updates.pickupHotelId) updateData.pickupHotelId = updates.pickupHotelId;
      if (updates.dropHotelId) updateData.dropHotelId = updates.dropHotelId;
      if (updates.pickupDate) updateData.pickupDate = updates.pickupDate.toISOString();
      if (updates.dropDate) updateData.dropDate = updates.dropDate.toISOString();
      if (updates.quantity) updateData.quantity = updates.quantity;

      const response = await fetch(`/api/basket/${state.basket!.id}/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update basket item');
      }

      const basketItem = await response.json();
      dispatch({ type: 'UPDATE_ITEM', payload: { id, updates: basketItem } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeBasketItem = async (id: string) => {
    if (!state.basket) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch(`/api/basket/${state.basket.id}/items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove basket item');
      }

      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearBasket = () => {
    dispatch({ type: 'CLEAR_BASKET' });
  };

  const getBasketItemCount = () => {
    return state.basket?.items.length || 0;
  };

  const getItemPrice = (item: BasketItem) => {
    return item.priceCents / 100; // Convert to euros
  };

  const getBasketTotal = () => {
    if (!state.basket) return { price: 0, deposit: 0 };

    const totals = state.basket.items.reduce(
      (acc, item) => {
        acc.price += item.priceCents;
        acc.deposit += item.depositCents * item.quantity;
        return acc;
      },
      { price: 0, deposit: 0 }
    );

    return {
      price: totals.price / 100, // Convert cents to euros
      deposit: totals.deposit / 100,
    };
  };

  const value: BasketContextType = {
    state,
    createBasket,
    getBasket,
    addItemToBasket,
    updateBasketItem,
    removeBasketItem,
    clearBasket,
    getBasketItemCount,
    getItemPrice,
    getBasketTotal,
  };

  return (
    <BasketContext.Provider value={value}>
      {children}
    </BasketContext.Provider>
  );
}

// Hook to use basket context
export function useBasket() {
  const context = useContext(BasketContext);
  if (context === undefined) {
    throw new Error('useBasket must be used within a BasketProvider');
  }
  return context;
}
