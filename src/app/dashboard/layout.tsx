// src/app/dashboard/layout.tsx
import LogoutButton from "@/components/CoachLogoutButton";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center border-b bg-background px-4 md:px-6 justify-between">
                <Image
                    src="/images/logo.avif" // Path to your logo
                    alt="Company Logo"
                    width={150} // Adjust size for header
                    height={150}
                    className="mr-2"
                  />
        <h1 className="text-lg font-semibold">Player Portal</h1>
        <LogoutButton />
      </header>
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}