"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, Package, X, Check } from 'lucide-react';

interface AddToBasketPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { 
    pickupDate: Date; 
    dropDate: Date; 
    pickupTime: string; 
    dropTime: string; 
    pickupHotelId: string; 
    dropHotelId: string; 
  }) => void;
  product: {
    id: string;
    name: string;
    pricePerDay: number;
    deposit: number;
  };
  currentPickupDate: Date;
  currentDropDate: Date;
  citySlug: string;
  locale: string;
}

export function AddToBasketPopup({
  isOpen,
  onClose,
  onConfirm,
  product,
  currentPickupDate,
  currentDropDate,
  citySlug,
  locale
}: AddToBasketPopupProps) {
  const [pickupDate, setPickupDate] = useState(currentPickupDate);
  const [dropDate, setDropDate] = useState(currentDropDate);
  const [pickupTime, setPickupTime] = useState("10:00");
  const [dropTime, setDropTime] = useState("14:00");
  const [pickupHotelId, setPickupHotelId] = useState("");
  const [dropHotelId, setDropHotelId] = useState("");
  const [hotels, setHotels] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    fr: {
      title: 'Ajouter au panier',
      confirm: 'Confirmer avec les dates actuelles',
      editDates: 'Modifier les dates',
      pickupDate: 'Date de retrait',
      dropDate: 'Date de retour',
      pickupTime: 'Heure de retrait',
      dropTime: 'Heure de retour',
      pickupHotel: 'Hôtel de retrait',
      dropHotel: 'Hôtel de retour',
      selectHotel: 'Sélectionner un hôtel',
      available: 'Disponible',
      notAvailable: 'Non disponible',
      checking: 'Vérification de la disponibilité...',
      confirmDates: 'Confirmer les nouvelles dates',
      cancel: 'Annuler',
      error: 'Erreur lors de la vérification de la disponibilité',
      invalidDates: 'La date de retour doit être après la date de retrait',
      noHotelsAvailable: 'Aucun hôtel disponible pour ces dates'
    },
    en: {
      title: 'Add to basket',
      confirm: 'Confirm with current dates',
      editDates: 'Edit dates',
      pickupDate: 'Pickup date',
      dropDate: 'Return date',
      pickupTime: 'Pickup time',
      dropTime: 'Return time',
      pickupHotel: 'Pickup hotel',
      dropHotel: 'Return hotel',
      selectHotel: 'Select a hotel',
      available: 'Available',
      notAvailable: 'Not available',
      checking: 'Checking availability...',
      confirmDates: 'Confirm new dates',
      cancel: 'Cancel',
      error: 'Error checking availability',
      invalidDates: 'Return date must be after pickup date',
      noHotelsAvailable: 'No hotels available for these dates'
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.fr;

  // Load hotels when popup opens
  useEffect(() => {
    if (isOpen) {
      loadHotels();
    }
  }, [isOpen]);

  // Load available hotels
  const loadHotels = async () => {
    try {
      const response = await fetch(`/api/hotels/availability?citySlug=${citySlug}&productId=${product.id}&dateStart=${currentPickupDate.toISOString()}&dateEnd=${currentDropDate.toISOString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to load hotels');
      }

      const hotelsData = await response.json();
      const availableHotels = hotelsData.filter((hotel: any) => hotel.hasAvailableProducts);
      setHotels(availableHotels);
      
      // Auto-select first available hotel
      if (availableHotels.length > 0) {
        setPickupHotelId(availableHotels[0].id);
        setDropHotelId(availableHotels[0].id);
      }
    } catch (err) {
      console.error('Error loading hotels:', err);
      setError(t.error);
    }
  };

  // Check availability when dates change
  useEffect(() => {
    if (!isEditing) return;

    const checkAvailability = async () => {
      if (dropDate <= pickupDate) {
        setIsAvailable(false);
        setError(t.invalidDates);
        return;
      }

      setIsCheckingAvailability(true);
      setError(null);

      try {
        const response = await fetch(`/api/hotels/availability?citySlug=${citySlug}&productId=${product.id}&dateStart=${pickupDate.toISOString()}&dateEnd=${dropDate.toISOString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to check availability');
        }

        const hotelsData = await response.json();
        const availableHotels = hotelsData.filter((hotel: any) => hotel.hasAvailableProducts);
        
        setHotels(availableHotels);
        setIsAvailable(availableHotels.length > 0);
        
        if (availableHotels.length > 0) {
          setError(null);
          // Auto-select first available hotel
          setPickupHotelId(availableHotels[0].id);
          setDropHotelId(availableHotels[0].id);
        } else {
          setError(t.noHotelsAvailable);
        }
      } catch (err) {
        setError(t.error);
        setIsAvailable(false);
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [pickupDate, dropDate, citySlug, product.id, isEditing, t.error, t.invalidDates, t.noHotelsAvailable]);

  const handleConfirm = () => {
    // Validate that hotels are selected
    if (!pickupHotelId || !dropHotelId) {
      setError('Veuillez sélectionner les hôtels de retrait et de retour');
      return;
    }

    // Prevent multiple submissions
    if (isCheckingAvailability) {
      return;
    }

    if (!isEditing) {
      // Use current dates and selected hotels
      onConfirm({ 
        pickupDate: currentPickupDate, 
        dropDate: currentDropDate,
        pickupTime: pickupTime,
        dropTime: dropTime,
        pickupHotelId: pickupHotelId,
        dropHotelId: dropHotelId
      });
    } else {
      // Use edited dates and selected hotels
      onConfirm({ 
        pickupDate, 
        dropDate,
        pickupTime,
        dropTime,
        pickupHotelId,
        dropHotelId
      });
    }
    onClose();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">{t.title}</h2>
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
          <div className="p-6 space-y-6">
            {/* Product Info */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-red-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-600">{formatPrice(product.pricePerDay)}/jour</p>
              </div>
            </div>

            {/* Current Dates */}
            {!isEditing && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Dates sélectionnées</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-pink-600" />
                    <span>Retrait: {formatDate(currentPickupDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-pink-600" />
                    <span>Retour: {formatDate(currentDropDate)}</span>
                  </div>
                </div>
                
                {/* Hotel Selection for Current Dates */}
                <div className="space-y-3 mt-4">
                  <div>
                    <Label htmlFor="pickupHotelCurrent">{t.pickupHotel}</Label>
                    <select
                      id="pickupHotelCurrent"
                      value={pickupHotelId}
                      onChange={(e) => setPickupHotelId(e.target.value)}
                      className="w-full border rounded-md p-2 mt-1"
                      required
                    >
                      <option value="">{t.selectHotel}</option>
                      {hotels.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="dropHotelCurrent">{t.dropHotel}</Label>
                    <select
                      id="dropHotelCurrent"
                      value={dropHotelId}
                      onChange={(e) => setDropHotelId(e.target.value)}
                      className="w-full border rounded-md p-2 mt-1"
                      required
                    >
                      <option value="">{t.selectHotel}</option>
                      {hotels.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="pickupTimeCurrent">{t.pickupTime}</Label>
                    <Input
                      id="pickupTimeCurrent"
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dropTimeCurrent">{t.dropTime}</Label>
                    <Input
                      id="dropTimeCurrent"
                      type="time"
                      value={dropTime}
                      onChange={(e) => setDropTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Date Editing */}
            {isEditing && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Modifier les dates</h4>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="pickupDate">{t.pickupDate}</Label>
                    <Input
                      id="pickupDate"
                      type="date"
                      value={pickupDate.toISOString().split('T')[0]}
                      onChange={(e) => setPickupDate(new Date(e.target.value))}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pickupTime">{t.pickupTime}</Label>
                    <Input
                      id="pickupTime"
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dropDate">{t.dropDate}</Label>
                    <Input
                      id="dropDate"
                      type="date"
                      value={dropDate.toISOString().split('T')[0]}
                      onChange={(e) => setDropDate(new Date(e.target.value))}
                      min={pickupDate.toISOString().split('T')[0]}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dropTime">{t.dropTime}</Label>
                    <Input
                      id="dropTime"
                      type="time"
                      value={dropTime}
                      onChange={(e) => setDropTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pickupHotel">{t.pickupHotel}</Label>
                    <select
                      id="pickupHotel"
                      value={pickupHotelId}
                      onChange={(e) => setPickupHotelId(e.target.value)}
                      className="w-full border rounded-md p-2 mt-1"
                      required
                    >
                      <option value="">{t.selectHotel}</option>
                      {hotels.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="dropHotel">{t.dropHotel}</Label>
                    <select
                      id="dropHotel"
                      value={dropHotelId}
                      onChange={(e) => setDropHotelId(e.target.value)}
                      className="w-full border rounded-md p-2 mt-1"
                      required
                    >
                      <option value="">{t.selectHotel}</option>
                      {hotels.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Availability Status */}
                <div className="flex items-center gap-2">
                  {isCheckingAvailability ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
                      <span className="text-sm text-gray-600">{t.checking}</span>
                    </>
                  ) : (
                    <>
                      {isAvailable ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {isAvailable ? t.available : t.notAvailable}
                      </span>
                    </>
                  )}
                </div>

                {error && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {!isEditing ? (
                <>
                  <Button
                    onClick={handleConfirm}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    {t.confirm}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="w-full"
                  >
                    {t.editDates}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleConfirm}
                    disabled={!isAvailable || isCheckingAvailability}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    {t.confirmDates}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setPickupDate(currentPickupDate);
                      setDropDate(currentDropDate);
                      setError(null);
                    }}
                    className="w-full"
                  >
                    {t.cancel}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
