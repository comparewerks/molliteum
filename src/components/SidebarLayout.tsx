"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Menu,
  Home,
  Users,
  ClipboardList,
  BookOpen,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

// A map from string names to the actual icon components
const iconMap = {
  Home,
  Users,
  ClipboardList,
  BookOpen,
};

// The type for a navigation item, accepting a string for the icon name
type NavItem = {
  href: string;
  label: string;
  iconName: keyof typeof iconMap;
};

// The type for all props the layout component accepts
type SidebarLayoutProps = {
  user: User | null;
  navItems: NavItem[];
  headerTitle: string;
  logoHref: string;
  logoutRedirectTo: string;
  children: React.ReactNode;
};

export default function SidebarLayout({
  user,
  navItems,
  headerTitle,
  logoHref,
  logoutRedirectTo,
  children,
}: SidebarLayoutProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const firstName = user?.user_metadata?.first_name || '';
  const lastName = user?.user_metadata?.last_name || '';
  const initials = `${firstName?.[0] || 'U'}${lastName?.[0] || ''}`.toUpperCase();

  // Reusable navigation component with stationary, centered icons
  const NavLinks = () => (
    <nav className="grid gap-2 text-md font-medium">
      {navItems.map((item) => {
        const Icon = iconMap[item.iconName];
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-4 rounded-lg py-2 text-muted-foreground transition-colors hover:text-primary hover:bg-muted",
              pathname.startsWith(item.href) ? "bg-muted text-primary" : "",
              isCollapsed ? "px-3 justify-center" : "px-3"
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span
              className={cn(
                "overflow-hidden transition-all duration-200",
                isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className={cn(
        "grid min-h-screen w-full transition-all duration-300",
        isCollapsed ? "md:grid-cols-[80px_1fr]" : "md:grid-cols-[280px_1fr]"
    )}>
      {/* --- DESKTOP SIDEBAR --- */}
      <div 
        className="hidden border-r bg-muted/40 md:block"
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center justify-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href={logoHref} className="relative flex items-center justify-center h-[48px] w-[150px]">
              <Image
                src="/images/logo.png"
                alt="Company Logo"
                width={150}
                height={48}
                className={cn("transition-opacity duration-200 ease-in-out", isCollapsed ? 'opacity-0' : 'opacity-100')}
              />
              <Image
                src="/images/logo_sm.png"
                alt="Company Logo Small"
                width={32}
                height={32}
                className={cn("absolute left-1/2 -translate-x-1/2 transition-opacity duration-200 ease-in-out", isCollapsed ? 'opacity-100' : 'opacity-0')}
              />
            </Link>
          </div>
          <div className="flex-1 py-4">
            <NavLinks />
          </div>
          <div className="mt-auto p-4 border-t">
            <div className={`flex items-center gap-4 mb-2 ${isCollapsed ? 'justify-center' : ''}`}>
                <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div 
                  className={cn("overflow-hidden transition-all duration-200", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}
                >
                    <p className="text-sm font-medium leading-none truncate">{firstName} {lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                </div>
            </div>
            <div 
              className={cn("transition-opacity duration-200", isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100')}
            >
              <LogoutButton redirectTo={logoutRedirectTo} />
            </div>
          </div>
        </div>
      </div>
      
      {/* --- MOBILE HEADER & CONTENT AREA --- */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
                <div className="flex h-14 items-center border-b px-4">
                    <Link href={logoHref} className="flex items-center gap-2 font-semibold">
                        <Image src="/images/logo.png" alt="Company Logo" width={150} height={32} />
                    </Link>
                </div>
              <div className="pt-4">
                <NavLinks />
              </div>
              <div className="mt-auto border-t pt-4">
                 <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                     <div>
                        <p className="text-sm font-medium leading-none truncate">{firstName} {lastName}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                    </div>
                </div>
                 <LogoutButton redirectTo={logoutRedirectTo} />
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <h1 className="font-semibold text-lg">{headerTitle}</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

