"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Menu, Home, Users, ClipboardList, BookOpen } from "lucide-react"
import LogoutButton from "@/components/LogoutButton"
import type { User } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"

// A map from string names to the actual icon components
const iconMap = {
  Home,
  Users,
  ClipboardList,
  BookOpen,
}

// The type for a navigation item, accepting a string for the icon name
type NavItem = {
  href: string
  label: string
  iconName: keyof typeof iconMap
}

// The type for all props the layout component accepts
type SidebarLayoutProps = {
  user: User | null
  navItems: NavItem[]
  headerTitle: string
  logoHref: string
  logoutRedirectTo: string
  children: React.ReactNode
}

export default function SidebarLayout({
  user,
  navItems,
  headerTitle,
  logoHref,
  logoutRedirectTo,
  children,
}: SidebarLayoutProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const currentPage = navItems.find(item => pathname.startsWith(item.href));

  const firstName = user?.user_metadata?.first_name || ""
  const lastName = user?.user_metadata?.last_name || ""
  const initials = `${firstName?.[0] || "U"}${lastName?.[0] || ""}`.toUpperCase()

  const NavLinks = () => (
    <nav className="space-y-1 px-3">
      {navItems.map((item) => {
        const Icon = iconMap[item.iconName]
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "group relative flex items-center rounded-lg transition-all duration-200 ease-in-out",
              "hover:bg-accent/50 active:scale-[0.98]",
              isActive ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              isCollapsed ? "h-11 w-11 justify-center" : "h-11 px-3",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center transition-all duration-200",
                isCollapsed ? "w-5 h-5" : "w-5 h-5 mr-3",
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
            </div>

            <span
              className={cn(
                "font-medium text-sm whitespace-nowrap transition-all duration-200 ease-in-out",
                isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100",
              )}
            >
              {item.label}
            </span>

            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                {item.label}
              </div>
            )}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div
      className={cn(
        "grid min-h-screen w-full transition-all duration-300 ease-in-out",
        isCollapsed ? "md:grid-cols-[72px_1fr]" : "md:grid-cols-[280px_1fr]",
      )}
    >
      {/* --- DESKTOP SIDEBAR --- */}
      <div
        className={cn(
          "hidden border-r bg-card/50 backdrop-blur-sm md:block transition-all duration-300 ease-in-out",
          "hover:shadow-lg",
        )}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <div className="flex h-full max-h-screen flex-col">
          <div
            className={cn(
              "flex items-center border-b bg-background/50 transition-all duration-300",
              isCollapsed ? "h-[72px] justify-center px-2" : "h-[72px] justify-start px-6",
            )}
          >
            <Link href={logoHref} className="relative flex items-center justify-center">
              <div className="relative w-[150px] h-[40px] flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="Company Logo"
                  width={150}
                  height={40}
                  className={cn(
                    "transition-all duration-300 ease-in-out",
                    isCollapsed ? "opacity-0 scale-95" : "opacity-100 scale-100",
                  )}
                />
                <Image
                  src="/images/logo_sm.png"
                  alt="Company Logo Small"
                  width={32}
                  height={32}
                  className={cn(
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out",
                    isCollapsed ? "opacity-100 scale-100" : "opacity-0 scale-95",
                  )}
                />
              </div>
            </Link>
          </div>

          <div className="flex-1 py-6">
            <NavLinks />
          </div>

          <div className="border-t bg-background/30 p-4">
            <div
              className={cn(
                "flex items-center transition-all duration-200",
                isCollapsed ? "justify-center mb-3" : "gap-3 mb-4",
              )}
            >
              <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-background shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
                )}
              >
                <p className="text-sm font-semibold leading-none truncate text-foreground">
                  {firstName} {lastName}
                </p>
                <p className="text-xs leading-none text-muted-foreground truncate mt-1">{user?.email}</p>
              </div>
            </div>

            <div
              className={cn(
                "transition-all duration-200",
                isCollapsed ? "opacity-0 pointer-events-none h-0" : "opacity-100 h-auto",
              )}
            >
              <LogoutButton redirectTo={logoutRedirectTo} />
            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE HEADER & CONTENT AREA --- */}
      <div className="flex flex-col">
        <header className="flex h-[72px] items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 lg:px-6 shadow-sm">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden hover:bg-accent bg-transparent">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-[280px]">
              <div className="flex h-[72px] items-center border-b px-4">
                <Link href={logoHref} className="flex items-center gap-2 font-semibold">
                  <Image src="/images/logo.png" alt="Company Logo" width={150} height={32} />
                </Link>
              </div>
              <div className="pt-6">
                <nav className="space-y-1 px-3">
                  {navItems.map((item) => {
                    const Icon = iconMap[item.iconName]
                    const isActive = pathname.startsWith(item.href)
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>
              </div>
              <div className="mt-auto border-t pt-4 px-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold leading-none truncate">
                      {firstName} {lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate mt-1">{user?.email}</p>
                  </div>
                </div>
                <LogoutButton redirectTo={logoutRedirectTo} />
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <h1 className="font-semibold text-lg">{currentPage?.label || headerTitle}</h1>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 p-6 bg-background/50">{children}</main>
      </div>
    </div>
  )
}
