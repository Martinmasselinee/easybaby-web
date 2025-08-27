"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Données de démonstration pour la V1
const demoHotels = [
  {
    id: "hotel-demo-paris",
    name: "Hôtel Demo Paris",
    city: "Paris",
    address: "123 Avenue des Champs-Élysées, 75008 Paris",
    email: "reception+demo@hotel.example",
    phone: "+33123456789",
    contactName: "Jean Dupont",
    discountCode: "HOTELPARIS70",
  },
];

export default function AdminHotelsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHotels = demoHotels.filter((hotel) =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hôtels</h1>
          <p className="text-muted-foreground">
            Gérez les hôtels partenaires
          </p>
        </div>
        <div className="flex space-x-4">
          <Button asChild variant="outline">
            <Link href="/admin/cities">Ajouter une ville</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/hotels/new">Ajouter un hôtel</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher un hôtel..."
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
        </div>

        <div className="border rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Ville</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Code</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHotels.map((hotel) => (
                <tr key={hotel.id} className="border-b">
                  <td className="px-4 py-3 text-sm font-medium">{hotel.name}</td>
                  <td className="px-4 py-3 text-sm">{hotel.city}</td>
                  <td className="px-4 py-3 text-sm">{hotel.email}</td>
                  <td className="px-4 py-3 text-sm">{hotel.contactName}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {hotel.discountCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/hotels/${hotel.id}`}>
                        Gérer
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
