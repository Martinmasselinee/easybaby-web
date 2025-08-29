"use client";

import { AdminHeader } from "@/components/layouts/admin-header";
import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Vérifier si nous sommes côté client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Vérification de l'authentification admin
  useEffect(() => {
    // Ne pas vérifier sur la page de login
    if (pathname === "/admin/login" || !isClient) {
      return;
    }
    
    // Vérifier si l'utilisateur est connecté
    const adminSession = localStorage.getItem("admin_session");
    if (!adminSession) {
      router.push("/admin/login");
      return;
    }
    
    // Vérifier si la session est valide
    try {
      const session = JSON.parse(adminSession);
      const now = Date.now();
      const sessionAge = now - session.timestamp;
      
      // Session expire après 24h
      if (sessionAge > 24 * 60 * 60 * 1000) {
        localStorage.removeItem("admin_session");
        router.push("/admin/login");
      }
    } catch (error) {
      localStorage.removeItem("admin_session");
      router.push("/admin/login");
    }
  }, [pathname, router, isClient]);
  
  // Si c'est la page de login, ne pas afficher le layout admin
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader onMenuToggle={toggleSidebar} />
      <div className="flex flex-1 pt-16 relative">
        <AdminSidebar 
          isOpen={sidebarOpen} 
          onClose={closeSidebar} 
        />
        <main className="flex-1 px-6 py-6 md:ml-0 transition-all duration-300 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}