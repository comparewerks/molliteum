// src/app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // --- FIX: Updated the select() statement to use the new, correct column names ---
  const { data: players, error } = await supabase
    .from("players")
    .select("id, first_name, last_name, resilience_profile, reliability");

  if (error) {
    console.error("Error fetching players:", error);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Players</h1>
      {players && players.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <Card key={player.id}>
              <CardHeader>
                <CardTitle>{player.first_name} {player.last_name}</CardTitle>
                {/* --- FIX: Display the new metrics --- */}
                <CardDescription>
                  Resilience: {player.resilience_profile} | Reliability: {player.reliability}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/dashboard/${player.id}`}>View Full Profile</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p>You have not been assigned any players yet.</p>
      )}
    </div>
  );
}