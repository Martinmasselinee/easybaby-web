"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
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
    return pathname.startsWith(href);
  };

  const handleLinkClick = () => {
    // Fermer le sidebar sur mobile après avoir cliqué sur un lien
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Sidebar plein écran sur mobile */}
      <aside className={cn(
        "fixed inset-0 z-50 bg-gray-50 transform transition-transform duration-300 ease-in-out md:fixed md:top-16 md:left-0 md:w-64 md:h-[calc(100vh-4rem)] md:border-r md:translate-x-0 md:z-40",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header avec bouton X (mobile uniquement) */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 md:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

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
