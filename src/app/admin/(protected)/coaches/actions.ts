// src/app/admin/(protected)/coaches/actions.ts
"use server";

import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from "next/cache";
// Note: We are not redirecting from this action anymore

// Keep this type for our return values
type ActionResult = {
  success: boolean;
  message: string;
};

export async function inviteCoach(formData: FormData): Promise<ActionResult> {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const organizationName = formData.get("organization") as string; // We'll add this to the form

  if (!email || !firstName || !lastName || !organizationName) {
    return { success: false, message: "All fields are required." };
  }
  
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Use the inviteUserByEmail function
  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: 'coach',
      },
      // This is the page the user will be sent to AFTER they click the invite link
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    }
  );

  if (inviteError || !inviteData.user) {
    console.error("Error inviting user:", inviteError);
    return { success: false, message: inviteError?.message || "Failed to send invitation." };
  }
  
  // Now, find or create the organization and update the user's profile
  // This is a "find or create" operation
  const { data: org, error: orgError } = await supabaseAdmin
    .from('organizations')
    .upsert({ name: organizationName }, { onConflict: 'name' })
    .select()
    .single();

  if (orgError || !org) {
      console.error("Error with organization:", orgError);
      return { success: false, message: "Could not find or create organization." };
  }

  // Update the user's profile with the new details
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ first_name: firstName, last_name: lastName, organization_id: org.id })
    .eq('id', inviteData.user.id);
    
  if (profileError) {
    console.error("Error updating profile:", profileError);
    return { success: false, message: "Invitation sent, but failed to update profile." };
  }

  revalidatePath("/admin/coaches");
  return { success: true, message: "Invitation sent successfully!" };
}

export async function deleteCoach(userId: string) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Deleting the user from Supabase Auth will automatically
  // delete their corresponding row in our `profiles` table
  // because we set up "ON DELETE CASCADE" in our database schema.
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Error deleting user:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/coaches");
}