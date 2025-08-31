import { PublicHeader } from "@/components/layouts/public-header";
import { PublicFooter } from "@/components/layouts/public-footer";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <PublicHeader />
      </div>
      <main className="flex-1">
        {children}
      </main>
      <div className="sticky bottom-0 z-50 bg-white border-t">
        <PublicFooter />
      </div>
    </div>
  );
}
