"use client";

import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";

export function IntlProvider({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: unknown;
  children: ReactNode;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
