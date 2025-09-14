// src/app/admin/players/actions.ts
"use server";

import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addPlayer(formData: FormData) {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const rawFormData = {
    first_name: formData.get('firstName') as string,
    last_name: formData.get('lastName') as string,
    coach_id: formData.get('coachId') as string,
    playbook_type: formData.get('playbookType') as string,
    playbook_text: formData.get('playbookText') as string,
    playbook_file: formData.get('playbookFile') as File,
    // --- FIX: Read all 7 metrics from the form data ---
    resilience_profile: formData.get('resilience_profile') as string,
    reliability: formData.get('reliability') as string,
    self_belief: formData.get('self_belief') as string,
    focus: formData.get('focus') as string,
    adversity: formData.get('adversity') as string,
    driver: formData.get('driver') as string,
    coaching_style: formData.get('coaching_style') as string,
  };

  // Build the object to insert into the database
  const playerData: any = {
    first_name: rawFormData.first_name,
    last_name: rawFormData.last_name,
    coach_id: rawFormData.coach_id,
    // --- FIX: Add all 7 metrics to the database object ---
    resilience_profile: rawFormData.resilience_profile,
    reliability: rawFormData.reliability,
    self_belief: rawFormData.self_belief,
    focus: rawFormData.focus,
    adversity: rawFormData.adversity,
    driver: rawFormData.driver,
    coaching_style: rawFormData.coaching_style,
  };

  // Handle playbook file upload if one exists
  if (rawFormData.playbook_type === 'pdf' && rawFormData.playbook_file.size > 0) {
    const file = rawFormData.playbook_file;
    const filePath = `playbooks/${Date.now()}-${file.name}`;
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('player_profiles')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      throw new Error('Failed to upload playbook PDF.');
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('player_profiles')
      .getPublicUrl(filePath);
      
    playerData.playbook_url = publicUrl;
  } else {
    playerData.playbook_text = rawFormData.playbook_text;
  }

  // Insert data into the players table
  const { error: insertError } = await supabaseAdmin
    .from('players')
    .insert([playerData]);

  if (insertError) {
    console.error('Insert Error:', insertError);
    throw new Error('Failed to create player.');
  }

  revalidatePath('/admin/players');
  redirect('/admin/players');
}