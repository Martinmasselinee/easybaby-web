import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
 
// Define all supported locales
export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'fr';

// This is the configuration used by the middleware and server components
export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is supported
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Load messages for the requested locale
  const messages = (await import(`./messages/${locale}/common.json`)).default;
  const adminMessages = (await import(`./messages/${locale}/admin.json`)).default;
  
  return {
    messages: {
      ...messages,
      admin: adminMessages,
    },
    timeZone: 'Europe/Paris',
    now: new Date(),
  };
});
