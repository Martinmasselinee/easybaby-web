"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AvailabilityCheckerProps {
  productId: string;
  cityId?: string;
  locale?: string;
  onAvailabilityChange?: (isAvailable: boolean, hotels: any[]) => void;
}

const translations = {
  fr: {
    checkAvailability: "Vérifier la disponibilité",
    checking: "Vérification...",
    startDate: "Date de début",
    endDate: "Date de fin",
    available: "Disponible",
    notAvailable: "Non disponible",
    alternativeDates: "Dates alternatives disponibles",
    tryDates: "Essayer ces dates",
    availableHotels: "Hôtels disponibles",
    selectDates: "Sélectionnez des dates pour vérifier la disponibilité",
  },
  en: {
    checkAvailability: "Check Availability",
    checking: "Checking...",
    startDate: "Start Date",
    endDate: "End Date",
    available: "Available",
    notAvailable: "Not Available",
    alternativeDates: "Alternative dates available",
    tryDates: "Try these dates",
    availableHotels: "Available Hotels",
    selectDates: "Select dates to check availability",
  },
};

export function AvailabilityChecker({
  productId,
  cityId,
  locale = "fr",
  onAvailabilityChange,
}: AvailabilityCheckerProps) {
  const t = translations[locale as keyof typeof translations] || translations.fr;

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);
  const [availability, setAvailability] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckAvailability = async () => {
    if (!startDate || !endDate) {
      setError("Veuillez sélectionner des dates de début et de fin");
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      // Construire l'URL avec les paramètres
      let url = `/api/products/availability?productId=${productId}&dateStart=${encodeURIComponent(
        startDate
      )}&dateEnd=${encodeURIComponent(endDate)}`;

      if (cityId) {
        url += `&cityId=${cityId}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      setAvailability(data);

      // Notifier le parent du changement de disponibilité
      if (onAvailabilityChange) {
        onAvailabilityChange(data.isAvailable, data.hotels);
      }
    } catch (err) {
      console.error("Erreur lors de la vérification de la disponibilité:", err);
      setError("Erreur lors de la vérification de la disponibilité");
    } finally {
      setIsChecking(false);
    }
  };

  const handleTryAlternativeDates = (startAt: string, endAt: string) => {
    setStartDate(startAt.split("T")[0]);
    setEndDate(endAt.split("T")[0]);
    handleCheckAvailability();
  };

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <h3 className="font-medium mb-2">{t.checkAvailability}</h3>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm mb-1">{t.startDate}</label>
          <input
            type="date"
            className="w-full border rounded-md p-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">{t.endDate}</label>
          <input
            type="date"
            className="w-full border rounded-md p-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      <Button
        onClick={handleCheckAvailability}
        disabled={isChecking || !startDate || !endDate}
        className="w-full"
      >
        {isChecking ? t.checking : t.checkAvailability}
      </Button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {availability && (
        <div className="mt-4">
          <div
            className={`p-2 rounded-md ${
              availability.isAvailable
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <p className="font-medium">
              {availability.isAvailable ? t.available : t.notAvailable}
            </p>
          </div>

          {!availability.isAvailable && availability.alternatives?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium">{t.alternativeDates}:</p>
              <div className="space-y-2 mt-2">
                {availability.alternatives.map((alt: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">
                      {new Date(alt.startAt).toLocaleDateString(locale)} -{" "}
                      {new Date(alt.endAt).toLocaleDateString(locale)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTryAlternativeDates(alt.startAt, alt.endAt)}
                    >
                      {t.tryDates}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {availability.isAvailable && availability.hotels?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium">{t.availableHotels}:</p>
              <ul className="mt-2 space-y-1">
                {availability.hotels.map((hotel: any) => (
                  <li key={hotel.hotelId} className="text-sm">
                    {hotel.hotelName} ({hotel.availableQuantity} disponible
                    {hotel.availableQuantity > 1 ? "s" : ""})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!availability && !error && (
        <p className="text-sm text-gray-500">{t.selectDates}</p>
      )}
    </div>
  );
}
