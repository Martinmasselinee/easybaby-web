"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Tableau de bord",
    href: "/admin/dashboard",
  },
  {
    title: "Hôtels",
    href: "/admin/hotels",
  },
  {
    title: "Produits",
    href: "/admin/products",
  },
  {
    title: "Stock",
    href: "/admin/stock",
  },
  {
    title: "Réservations",
    href: "/admin/reservations",
  },
  {
    title: "Rapports",
    href: "/admin/reports",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  // Fonction pour vérifier si un lien est actif, même pour les sous-pages
  const isActive = (href: string) => {
    if (href === "/admin/dashboard" && pathname === "/admin/dashboard") {
      return true;
    }
    
    // Pour les autres sections, vérifier si le pathname commence par le href
    // mais pas pour le tableau de bord qui est un cas particulier
    if (href !== "/admin/dashboard") {
      return pathname.startsWith(href);
    }
    
    return false;
  };

  return (
    <aside className="w-64 border-r bg-gray-50 min-h-[calc(100vh-4rem)]">
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-primary text-primary-foreground"
                : "hover:bg-gray-100"
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
