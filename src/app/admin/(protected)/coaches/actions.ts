// src/app/admin/coaches/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server"; // Use the server client for user session
import { createClient as createAdminClient } from '@supabase/supabase-js' // Use the vanilla client for admin
import { revalidatePath } from "next/cache";

export async function inviteCoach(formData: FormData) {
  // Use the regular server client to check if the current user is an admin
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to invite a coach.");
  }
  
  // You would ideally check if user has an 'admin' role from your profiles table here
  // For now, we'll assume any logged-in user on this page is an admin.
  
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;

  if (!email || !firstName || !lastName) {
    throw new Error("First name, last name, and email are required.");
  }
  
  // Use the ADMIN client to create a user. This requires the service_role key.
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Create the user in Supabase Auth
  const { data: newUserData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    email_confirm: true, // You can set this to false to not require email confirmation
    user_metadata: {
      role: 'coach',
      first_name: firstName,
      last_name: lastName
    }
  });

  if (authError) {
    console.error("Error creating user:", authError);
    throw new Error(authError.message);
  }
  
  // Our trigger `handle_new_user` will automatically create the profile.
  // We just need to update it with the first and last name.
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ first_name: firstName, last_name: lastName })
    .eq('id', newUserData.user.id);
    
  if (profileError) {
    console.error("Error updating profile:", profileError);
    // You might want to delete the auth user here to clean up
    throw new Error(profileError.message);
  }

  // Revalidate the path to refresh the coach list on the page
  revalidatePath("/admin/coaches");
}
export async function deleteCoach(userId: string) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Error deleting user:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/coaches");
}