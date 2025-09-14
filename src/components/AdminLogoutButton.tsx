// src/components/LogoutButton.tsx

"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui/button";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Important to clear cached user data
    router.push("/admin/login");
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      Log Out
    </Button>
  );
}