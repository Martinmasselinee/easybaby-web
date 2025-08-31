"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Locale } from "@/i18n";

// Définir des traductions statiques pour simplifier
const translations = {
  fr: {
    tagline: "Location d'équipements pour bébé dans votre hôtel",
    admin: "Administration"
  },
  en: {
    tagline: "Baby equipment rental in your hotel",
    admin: "Administration"
  }
};

export function PublicFooter() {
  const pathname = usePathname();
  
  // Extract locale from pathname
  const currentLocale = pathname?.split("/")[1] as Locale || "fr";
  
  // Get translations for current locale
  const t = translations[currentLocale as keyof typeof translations] || translations.fr;
  
  const year = new Date().getFullYear();

  return (
    <footer className="border-t py-4 md:py-0">
      <div className="px-4 md:px-8 lg:px-16 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
        <div className="text-sm text-muted-foreground">
          &copy; {year} EasyBaby. {t.tagline}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/admin" className="hover:underline">
            {t.admin}
          </Link>
        </div>
      </div>
    </footer>
  );
}
