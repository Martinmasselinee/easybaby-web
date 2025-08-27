"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
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

  const handleLinkClick = () => {
    // Fermer le sidebar sur mobile après avoir cliqué sur un lien
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay pour mobile avec opacité réduite */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-16 left-0 z-50 w-64 h-[calc(100vh-4rem)] border-r bg-gray-50 transform transition-transform duration-300 ease-in-out md:relative md:top-0 md:translate-x-0 md:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
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
    </>
  );
}
