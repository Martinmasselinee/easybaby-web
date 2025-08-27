/**
 * Module de gestion du cache pour la synchronisation des données
 * 
 * Ce module fournit des fonctions pour invalider le cache après des modifications
 * afin d'assurer que les données affichées côté utilisateur sont toujours à jour.
 */

import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Tags de cache pour différentes entités
 */
export const CACHE_TAGS = {
  CITIES: 'cities',
  HOTELS: 'hotels',
  PRODUCTS: 'products',
  INVENTORY: 'inventory',
  RESERVATIONS: 'reservations',
  AVAILABILITY: 'availability',
};

/**
 * Invalide le cache pour les villes
 * @param cityId ID de la ville spécifique à invalider (optionnel)
 */
export function invalidateCitiesCache(cityId?: string) {
  revalidateTag(CACHE_TAGS.CITIES);
  
  if (cityId) {
    revalidateTag(`${CACHE_TAGS.CITIES}-${cityId}`);
  }
  
  // Invalider également les chemins de navigation
  revalidatePath('/[locale]/(user)/city');
}

/**
 * Invalide le cache pour les hôtels
 * @param hotelId ID de l'hôtel spécifique à invalider (optionnel)
 * @param cityId ID de la ville associée (optionnel)
 */
export function invalidateHotelsCache(hotelId?: string, cityId?: string) {
  revalidateTag(CACHE_TAGS.HOTELS);
  
  if (hotelId) {
    revalidateTag(`${CACHE_TAGS.HOTELS}-${hotelId}`);
  }
  
  if (cityId) {
    revalidateTag(`${CACHE_TAGS.CITIES}-${cityId}`);
    revalidatePath(`/[locale]/(user)/city/${cityId}`);
  }
}

/**
 * Invalide le cache pour les produits
 * @param productId ID du produit spécifique à invalider (optionnel)
 */
export function invalidateProductsCache(productId?: string) {
  revalidateTag(CACHE_TAGS.PRODUCTS);
  
  if (productId) {
    revalidateTag(`${CACHE_TAGS.PRODUCTS}-${productId}`);
    revalidatePath(`/[locale]/(user)/product/${productId}`);
  }
}

/**
 * Invalide le cache pour l'inventaire
 * @param hotelId ID de l'hôtel associé (optionnel)
 * @param productId ID du produit associé (optionnel)
 */
export function invalidateInventoryCache(hotelId?: string, productId?: string) {
  revalidateTag(CACHE_TAGS.INVENTORY);
  
  if (hotelId) {
    revalidateTag(`${CACHE_TAGS.HOTELS}-${hotelId}`);
    revalidateTag(`${CACHE_TAGS.INVENTORY}-hotel-${hotelId}`);
  }
  
  if (productId) {
    revalidateTag(`${CACHE_TAGS.PRODUCTS}-${productId}`);
    revalidateTag(`${CACHE_TAGS.INVENTORY}-product-${productId}`);
  }
  
  // Invalider également le cache de disponibilité
  revalidateTag(CACHE_TAGS.AVAILABILITY);
}

/**
 * Invalide le cache pour les réservations
 * @param reservationId ID de la réservation spécifique à invalider (optionnel)
 * @param hotelId ID de l'hôtel associé (optionnel)
 * @param productId ID du produit associé (optionnel)
 */
export function invalidateReservationsCache(reservationId?: string, hotelId?: string, productId?: string) {
  revalidateTag(CACHE_TAGS.RESERVATIONS);
  
  if (reservationId) {
    revalidateTag(`${CACHE_TAGS.RESERVATIONS}-${reservationId}`);
    revalidatePath(`/[locale]/(user)/reservation/${reservationId}`);
  }
  
  if (hotelId) {
    revalidateTag(`${CACHE_TAGS.HOTELS}-${hotelId}`);
  }
  
  if (productId) {
    revalidateTag(`${CACHE_TAGS.PRODUCTS}-${productId}`);
  }
  
  // Invalider également le cache de disponibilité
  revalidateTag(CACHE_TAGS.AVAILABILITY);
}

/**
 * Invalide le cache pour la disponibilité
 * @param hotelId ID de l'hôtel associé (optionnel)
 * @param productId ID du produit associé (optionnel)
 */
export function invalidateAvailabilityCache(hotelId?: string, productId?: string) {
  revalidateTag(CACHE_TAGS.AVAILABILITY);
  
  if (hotelId) {
    revalidateTag(`${CACHE_TAGS.AVAILABILITY}-hotel-${hotelId}`);
  }
  
  if (productId) {
    revalidateTag(`${CACHE_TAGS.AVAILABILITY}-product-${productId}`);
  }
}
