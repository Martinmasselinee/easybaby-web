import React from "react";
import { locales } from "@/i18n";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Utiliser React.use() pour déballer les paramètres si nécessaire
  // const paramsData = React.use(params);
  // const locale = paramsData.locale;
  
  return <>{children}</>;
}
