import { PublicHeader } from "@/components/layouts/public-header";
import { PublicFooter } from "@/components/layouts/public-footer";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto w-full py-8">{children}</main>
      <PublicFooter />
    </div>
  );
}
