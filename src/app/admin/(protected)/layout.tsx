// src/app/admin/layout.tsx
import Link from "next/link";
import LogoutButton from "@/components/AdminLogoutButton";
import Image from "next/image";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
        <nav className="flex-row gap-6 text-lg font-medium md:flex md:items-center md:gap-5 lg:gap-6">
        <Image
            src="/images/logo.avif" // Path to your logo
            alt="Company Logo"
            width={150} // Adjust size for header
            height={150}
            className="mr-2"
          />
          <Link href="/admin/coaches" className="text-muted-foreground transition-colors hover:text-foreground">
            Coaches
          </Link>
          <Link href="/admin/players" className="text-foreground transition-colors hover:text-foreground">
            Players
          </Link>
        </nav>
        <LogoutButton />
      </header>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}