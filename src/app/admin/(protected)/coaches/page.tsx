// src/app/admin/coaches/page.tsx

import { createClient as createServerClient } from "@/lib/supabase/server"; // Renamed for clarity
import { createClient as createAdminClient } from '@supabase/supabase-js'; // Import the base client
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InviteCoachDialog } from "./InviteCoachDialog";
import { DeleteCoachButton } from "@/components/DeleteCoachButton";
export default async function CoachesPage() {
  // 1. Use the standard server client to check for a logged-in user
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  // 2. Create a new ADMIN client to perform privileged operations
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 3. Use the ADMIN client to list all users
  const { data: { users: allUsers }, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error("Error fetching users:", error);
  }

  // Filter the users in our code to only show coaches
  const coaches = allUsers?.filter(user => user.user_metadata.role === 'coach') || [];

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Manage Coaches</h1>
        <div className="flex items-center gap-4">
          <InviteCoachDialog />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined On</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coaches.map((coach) => (
              <TableRow key={coach.id}>
                <TableCell>
                  {coach.user_metadata.first_name} {coach.user_metadata.last_name}
                </TableCell>
                <TableCell>{coach.email}</TableCell>
                <TableCell>{new Date(coach.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DeleteCoachButton coachId={coach.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}