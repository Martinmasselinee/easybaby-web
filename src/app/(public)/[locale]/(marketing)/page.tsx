import React from "react";
import { redirect } from "next/navigation";
import { env } from "@/env.mjs";

export default function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale || 'fr';
  
  // Redirection vers la page des villes
  if (typeof window === 'undefined') {
    redirect(`/${locale}/city`);
  }
  
  return null;
}
