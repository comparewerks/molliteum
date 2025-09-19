import { createClient } from "@/lib/supabase/server";
import SidebarLayout, { type NavItem } from "@/components/SidebarLayout";
import { Home } from "lucide-react";

// Define the navigation items specifically for the coach portal
const coachNavItems: NavItem[] = [
  { href: "/dashboard", label: "Players", iconName: "Home" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <SidebarLayout
      user={user}
      navItems={coachNavItems}
      headerTitle="Coach Portal"
      logoHref="/dashboard"
      logoutRedirectTo="/login"
    >
      {children}
    </SidebarLayout>
  );
}
