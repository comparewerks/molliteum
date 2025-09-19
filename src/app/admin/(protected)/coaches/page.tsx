// src/app/admin/(protected)/coaches/page.tsx
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from '@supabase/supabase-js';
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
import { Badge } from "@/components/ui/badge"; // <-- Import the Badge component

export default async function CoachesPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  // We are already using the admin client which has access to `last_sign_in_at`
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data: { users: allUsers }, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error("Error fetching users:", error);
  }

  const coaches = allUsers?.filter(user => user.user_metadata.role === 'coach') || [];

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Manage Coaches</h1>
        <InviteCoachDialog />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coaches.map((coach) => {
              // --- LOGIC TO DETERMINE STATUS ---
              const isActive = !!coach.last_sign_in_at;

              return (
                <TableRow key={coach.id}>
                  <TableCell>
                    {coach.user_metadata.first_name} {coach.user_metadata.last_name}
                  </TableCell>
                  <TableCell>{coach.email}</TableCell>
                  {/* --- NEW STATUS CELL --- */}
                  <TableCell>
                    <Badge variant={isActive ? "default" : "secondary"}>
                      {isActive ? "Active" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DeleteCoachButton coachId={coach.id} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}