"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminHeader() {
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
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 md:px-8 lg:px-16 flex h-16 items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <span className="text-xl font-bold">EasyBaby</span>
          <span className="text-sm text-gray-500">Admin</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">{adminEmail}</span>
          <button 
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}