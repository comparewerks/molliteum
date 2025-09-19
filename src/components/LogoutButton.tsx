"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui/button";

export default function LogoutButton({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Important to clear cached user data from server components
    router.push(redirectTo);
  };

  return (
    <Button variant="outline" onClick={handleLogout} className="w-full">
      Log Out
    </Button>
  );
}