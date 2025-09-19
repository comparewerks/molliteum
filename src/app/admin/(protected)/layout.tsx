import { createClient } from "@/lib/supabase/server";
import SidebarLayout, { type NavItem } from "@/components/SidebarLayout";
import {
  Home,
  Users,
  ClipboardList,
  BookOpen,
} from "lucide-react";

// Define the navigation items specifically for the admin panel
const adminNavItems: NavItem[] = [
  { href: "/admin/coaches", label: "Coaches", iconName: "Users" },
  { href: "/admin/players", label: "Players", iconName: "Home" },
  { href: "/admin/questionnaire", label: "Coach Feedback", iconName: "ClipboardList" },
  { href: "/admin/quizzes", label: "Assessments", iconName: "BookOpen" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <SidebarLayout
      user={user}
      navItems={adminNavItems}
      headerTitle={"Admin Panel"}
      logoHref="/admin/coaches"
      logoutRedirectTo="/admin/login"
    >
      {children}
    </SidebarLayout>
  );
}
