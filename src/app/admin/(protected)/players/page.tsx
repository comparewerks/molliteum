// src/app/admin/players/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function PlayersPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  // Admins can see all players thanks to our RLS policy
  const { data: players, error } = await supabase
    .from("players")
    .select(`
      id,
      first_name,
      last_name,
      profiles ( first_name, last_name )
    `); // This is a Supabase JOIN

  if (error) {
    console.error("Error fetching players:", error);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Manage Players</h1>
        <Button asChild>
          <Link href="/admin/players/add">Add New Player</Link>
        </Button>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player Name</TableHead>
              <TableHead>Assigned Coach</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players?.map((player) => (
              <TableRow key={player.id}>
                <TableCell>{player.first_name} {player.last_name}</TableCell>
                <TableCell>
                  {/* @ts-ignore because Supabase types can be tricky with joins */}
                  {player.profiles?.first_name} {player.profiles?.last_name}
                </TableCell>
                <TableCell>
                  {/* Edit/Delete buttons will go here */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}