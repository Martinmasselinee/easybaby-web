import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n";

export default function RootPage() {
  // Redirect to the default locale
  redirect(`/${defaultLocale}`);
}