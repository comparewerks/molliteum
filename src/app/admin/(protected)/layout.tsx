// src/app/admin/layout.tsx
"use client";

import Link from "next/link";
import LogoutButton from "@/components/AdminLogoutButton";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navLink = (href: string, label: string) => {
    const isActive = pathname.startsWith(href);

    return (
      <Link
        href={href}
        className={`transition-colors hover:text-foreground ${
          isActive ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
        <nav className="flex-row gap-6 text-lg font-medium md:flex md:items-center md:gap-5 lg:gap-6">
          <Image
            src="/images/logo.png"
            alt="Company Logo"
            width={150}
            height={150}
            className="mr-2"
          />
          {navLink("/admin/coaches", "Coaches")}
          {navLink("/admin/players", "Players")}
          {navLink("/admin/questionnaire", "Questionnaire")}
        </nav>
        <LogoutButton />
      </header>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
