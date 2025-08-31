"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Locale, locales } from "@/i18n";

// Définir des traductions statiques pour simplifier
const translations = {
  fr: {
    appName: "EasyBaby",
    cities: "Villes",
    language: "Français"
  },
  en: {
    appName: "EasyBaby",
    cities: "Cities",
    language: "English"
  }
};

export function PublicHeader() {
  const pathname = usePathname();
  
  // Extract locale from pathname
  const currentLocale = pathname?.split("/")[1] as Locale || "fr";
  
  // Get translations for current locale
  const t = translations[currentLocale as keyof typeof translations] || translations.fr;
  
  // Function to change locale in URL
  const switchLocale = (locale: string) => {
    if (!pathname) return `/${locale}`;
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  return (
    <header className="border-b bg-gradient-to-r from-pink-600 to-red-600">
      <div className="px-4 md:px-8 lg:px-16 max-w-7xl mx-auto w-full flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={`/${currentLocale}`} className="text-2xl font-bold text-white">
            {t.appName}
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href={`/${currentLocale}/city`} className="text-sm font-medium text-white hover:text-white/80">
              {t.cities}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                {currentLocale.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {locales.map((locale) => (
                <DropdownMenuItem key={locale} asChild>
                  <Link href={switchLocale(locale)}>
                    {locale === "fr" ? "Français" : "English"}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
