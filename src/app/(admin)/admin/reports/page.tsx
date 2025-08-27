"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

// Données de démonstration pour la V1
const demoRevenueData = [
  {
    month: "Juillet 2023",
    hotels: [
      {
        id: "hotel-demo-paris",
        name: "Hôtel Demo Paris",
        revenue: 0,
        platformShare: 0,
        hotelShare: 0,
        deposits: 0,
        claims: 0,
        reservations: 2,
      },
    ],
    totals: {
      revenue: 0,
      platformShare: 0,
      hotelShare: 0,
      deposits: 0,
      claims: 0,
      reservations: 2,
    },
  },
  {
    month: "Juin 2023",
    hotels: [
      {
        id: "hotel-demo-paris",
        name: "Hôtel Demo Paris",
        revenue: 0,
        platformShare: 0,
        hotelShare: 0,
        deposits: 0,
        claims: 0,
        reservations: 0,
      },
    ],
    totals: {
      revenue: 0,
      platformShare: 0,
      hotelShare: 0,
      deposits: 0,
      claims: 0,
      reservations: 0,
    },
  },
];

export default function AdminReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(demoRevenueData[0].month);
  
  const currentData = demoRevenueData.find((data) => data.month === selectedMonth) || demoRevenueData[0];

  const handleExport = () => {
    // Dans une vraie application, nous générerions un CSV ici
    alert("Export CSV en cours...");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Rapports</h1>
        <p className="text-muted-foreground">
          Consultez et exportez les rapports financiers
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Période</label>
            <select
              className="border rounded-md p-2"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {demoRevenueData.map((data) => (
                <option key={data.month} value={data.month}>
                  {data.month}
                </option>
              ))}
            </select>
          </div>
          <Button variant="outline" onClick={handleExport}>
            Exporter CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-muted-foreground">Revenu total</h3>
              <div className="text-3xl font-bold">
                {new Intl.NumberFormat("fr", {
                  style: "currency",
                  currency: "EUR",
                }).format(currentData.totals.revenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {currentData.totals.reservations} réservations
              </p>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-muted-foreground">Part plateforme</h3>
              <div className="text-3xl font-bold">
                {new Intl.NumberFormat("fr", {
                  style: "currency",
                  currency: "EUR",
                }).format(currentData.totals.platformShare)}
              </div>
              <p className="text-xs text-muted-foreground">30% ou 70%</p>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-muted-foreground">Part hôtels</h3>
              <div className="text-3xl font-bold">
                {new Intl.NumberFormat("fr", {
                  style: "currency",
                  currency: "EUR",
                }).format(currentData.totals.hotelShare)}
              </div>
              <p className="text-xs text-muted-foreground">70% ou 30%</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium">Hôtel</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Réservations</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Revenu</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Part hôtel</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Part plateforme</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Cautions</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Réclamations</th>
              </tr>
            </thead>
            <tbody>
              {currentData.hotels.map((hotel) => (
                <tr key={hotel.id} className="border-b">
                  <td className="px-4 py-3 text-sm font-medium">{hotel.name}</td>
                  <td className="px-4 py-3 text-sm">{hotel.reservations}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Intl.NumberFormat("fr", {
                      style: "currency",
                      currency: "EUR",
                    }).format(hotel.revenue)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Intl.NumberFormat("fr", {
                      style: "currency",
                      currency: "EUR",
                    }).format(hotel.hotelShare)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Intl.NumberFormat("fr", {
                      style: "currency",
                      currency: "EUR",
                    }).format(hotel.platformShare)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Intl.NumberFormat("fr", {
                      style: "currency",
                      currency: "EUR",
                    }).format(hotel.deposits)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Intl.NumberFormat("fr", {
                      style: "currency",
                      currency: "EUR",
                    }).format(hotel.claims)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t bg-muted/50">
                <td className="px-4 py-3 text-sm font-medium">Total</td>
                <td className="px-4 py-3 text-sm font-medium">
                  {currentData.totals.reservations}
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  {new Intl.NumberFormat("fr", {
                    style: "currency",
                    currency: "EUR",
                  }).format(currentData.totals.revenue)}
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  {new Intl.NumberFormat("fr", {
                    style: "currency",
                    currency: "EUR",
                  }).format(currentData.totals.hotelShare)}
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  {new Intl.NumberFormat("fr", {
                    style: "currency",
                    currency: "EUR",
                  }).format(currentData.totals.platformShare)}
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  {new Intl.NumberFormat("fr", {
                    style: "currency",
                    currency: "EUR",
                  }).format(currentData.totals.deposits)}
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  {new Intl.NumberFormat("fr", {
                    style: "currency",
                    currency: "EUR",
                  }).format(currentData.totals.claims)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
