"use client";

import { PublicHeader } from "@/components/layouts/public-header";
import { PublicFooter } from "@/components/layouts/public-footer";
import { BasketProvider } from "@/components/basket/basket-provider";
import { useEffect, useState } from "react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isBasketOpen, setIsBasketOpen] = useState(false);

  useEffect(() => {
    const handleBasketToggle = (event: CustomEvent) => {
      setIsBasketOpen(event.detail.isOpen);
    };

    window.addEventListener('basket-toggle', handleBasketToggle as EventListener);
    return () => {
      window.removeEventListener('basket-toggle', handleBasketToggle as EventListener);
    };
  }, []);

  return (
    <BasketProvider>
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-50 bg-white">
          <PublicHeader />
        </div>
        <main className="flex-1 w-full">
          {children}
        </main>
        <div className={`sticky bottom-0 bg-white border-t ${isBasketOpen ? 'z-30' : 'z-50'}`}>
          <PublicFooter />
        </div>
      </div>
    </BasketProvider>
  );
}
