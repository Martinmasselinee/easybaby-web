import React from "react";
import { notFound } from "next/navigation";
import { IntlProvider } from "@/components/providers/intl-provider";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale?: string };
}) {
  // Vérifier si le paramètre locale existe
  if (!params || !params.locale) {
    return <>{children}</>;
  }
  
  const locale = params.locale;
  
  let messages;
  try {
    const commonMessages = (await import(`../../messages/${locale}/common.json`)).default;
    const adminMessages = (await import(`../../messages/${locale}/admin.json`)).default;
    
    messages = {
      common: commonMessages,
      admin: adminMessages
    };
  } catch (error) {
    notFound();
  }

  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
}
