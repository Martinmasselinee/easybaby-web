"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NotificationBell } from "@/components/admin/notification-bell";

interface AdminHeaderProps {
  onMenuToggle?: () => void;
  pageTitle?: string;
}

export function AdminHeader({ onMenuToggle, pageTitle }: AdminHeaderProps) {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState<string>("Admin");
  
  // Utiliser useEffect pour accéder à localStorage côté client uniquement
  useEffect(() => {
    try {
      const adminSession = localStorage.getItem("admin_session");
      if (adminSession) {
        const session = JSON.parse(adminSession);
        setAdminEmail(session.email);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la session admin", error);
    }
  }, []);
  
  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    router.push("/admin/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-300 shadow-sm">
      <div className="px-6 flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Bouton menu mobile */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={onMenuToggle}
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <Link href="/admin/dashboard" className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-black">EasyBaby</span>
              <span className="text-lg text-gray-600 hidden sm:inline">Admin</span>
            </div>
            {pageTitle && (
              <>
                <span className="text-gray-400 hidden md:inline">•</span>
                <span className="text-lg font-medium text-black hidden md:inline">{pageTitle}</span>
              </>
            )}
          </Link>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <NotificationBell />
          <span className="text-sm text-gray-600 hidden sm:inline">{adminEmail}</span>
          <button 
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded"
          >
            <span className="hidden sm:inline">Déconnexion</span>
            <span className="sm:hidden">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}