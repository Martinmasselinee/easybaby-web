import { PublicHeader } from "@/components/layouts/public-header";
import { PublicFooter } from "@/components/layouts/public-footer";
import { BasketProvider } from "@/components/basket/basket-provider";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BasketProvider>
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-50 bg-white">
          <PublicHeader />
        </div>
        <main className="flex-1 flex items-start justify-center w-full pt-16">
          {children}
        </main>
        <div className="sticky bottom-0 z-50 bg-white border-t">
          <PublicFooter />
        </div>
      </div>
    </BasketProvider>
  );
}
