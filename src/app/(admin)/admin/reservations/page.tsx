"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Données de démonstration pour la V1
const demoReservations = [
  {
    id: "res1",
    code: "DEMO123456",
    status: "CONFIRMED",
    productName: "Poussette",
    userEmail: "client@example.com",
    pickupDate: new Date("2023-07-15T10:00:00"),
    dropoffDate: new Date("2023-07-20T14:00:00"),
    hotel: "Hôtel Demo Paris",
    city: "Paris",
  },
  {
    id: "res2",
    code: "DEMO789012",
    status: "PENDING",
    productName: "Lit parapluie",
    userEmail: "autre@example.com",
    pickupDate: new Date("2023-07-18T11:00:00"),
    dropoffDate: new Date("2023-07-22T16:00:00"),
    hotel: "Hôtel Demo Paris",
    city: "Paris",
  },
];

export default function AdminReservationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterProduct, setFilterProduct] = useState("");

  const filteredReservations = demoReservations.filter((reservation) => {
    const matchesSearch = 
      reservation.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.hotel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus ? reservation.status === filterStatus : true;
    const matchesProduct = filterProduct ? reservation.productName.toLowerCase().includes(filterProduct.toLowerCase()) : true;
    
    return matchesSearch && matchesStatus && matchesProduct;
  });

  // Extraire les produits uniques pour le filtre
  const uniqueProducts = Array.from(
    new Set(demoReservations.map((item) => item.productName))
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Réservations</h1>
        <p className="text-muted-foreground">
          Gérez toutes les réservations
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher par code, email, hôtel..."
              className="w-full rounded-md border px-4 py-2 pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div>
            <select
              className="w-full rounded-md border px-4 py-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="CONFIRMED">Confirmée</option>
              <option value="COMPLETED">Terminée</option>
              <option value="CANCELLED">Annulée</option>
              <option value="NO_SHOW">Non présenté</option>
              <option value="DAMAGED">Endommagé</option>
            </select>
          </div>
          <div>
            <select
              className="w-full rounded-md border px-4 py-2"
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
            >
              <option value="">Tous les produits</option>
              {uniqueProducts.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium">Code</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Produit</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Hôtel</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Retrait</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Retour</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id} className="border-b">
                  <td className="px-4 py-3 text-sm">{reservation.code}</td>
                  <td className="px-4 py-3 text-sm">{reservation.productName}</td>
                  <td className="px-4 py-3 text-sm">{reservation.userEmail}</td>
                  <td className="px-4 py-3 text-sm">{reservation.hotel}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Intl.DateTimeFormat("fr", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(reservation.pickupDate)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Intl.DateTimeFormat("fr", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(reservation.dropoffDate)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        reservation.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                        reservation.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                        reservation.status === "COMPLETED" ? "bg-blue-100 text-blue-800" :
                        reservation.status === "NO_SHOW" ? "bg-orange-100 text-orange-800" :
                        reservation.status === "DAMAGED" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {reservation.status === "CONFIRMED" ? "Confirmée" : 
                       reservation.status === "PENDING" ? "En attente" :
                       reservation.status === "COMPLETED" ? "Terminée" :
                       reservation.status === "NO_SHOW" ? "Non présenté" :
                       reservation.status === "DAMAGED" ? "Endommagé" :
                       "Annulée"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/reservations/${reservation.id}`}>
                        Voir
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
