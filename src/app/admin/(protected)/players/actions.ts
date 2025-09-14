// src/app/admin/(protected)/players/actions.ts
"use server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Database } from '@/types/supabase';


// Define a type alias for a player insert object from our generated types
type PlayerInsert = Database['public']['Tables']['players']['Insert'];

export async function addPlayer(formData: FormData) {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Read all data from the form
  const rawFormData = {
    first_name: formData.get('firstName') as string,
    last_name: formData.get('lastName') as string,
    coach_id: formData.get('coachId') as string,
    playbook_type: formData.get('playbookType') as string,
    playbook_text: formData.get('playbookText') as string,
    playbook_file: formData.get('playbookFile') as File,
    resilience_profile: formData.get('resilience_profile') as string,
    reliability: formData.get('reliability') as string,
    self_belief: formData.get('self_belief') as string,
    focus: formData.get('focus') as string,
    adversity: formData.get('adversity') as string,
    driver: formData.get('driver') as string,
    coaching_style: formData.get('coaching_style') as string,
  };

  // Build the strongly-typed object to insert into the database
  const playerData: PlayerInsert = {
    first_name: rawFormData.first_name,
    last_name: rawFormData.last_name,
    coach_id: rawFormData.coach_id,
    resilience_profile: rawFormData.resilience_profile,
    reliability: rawFormData.reliability,
    self_belief: rawFormData.self_belief,
    focus: rawFormData.focus,
    adversity: rawFormData.adversity,
    driver: rawFormData.driver,
    coaching_style: rawFormData.coaching_style,
  };

  // Handle playbook file upload if one was provided
  if (rawFormData.playbook_type === 'pdf' && rawFormData.playbook_file.size > 0) {
    const file = rawFormData.playbook_file;
    // Create a unique file path to avoid name collisions
    const filePath = `playbooks/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    
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
    // Otherwise, save the rich text content
    playerData.playbook_text = rawFormData.playbook_text;
  }

  // Insert the final data into the players table
  const { error: insertError } = await supabaseAdmin
    .from('players')
    .insert(playerData);

  if (insertError) {
    console.error('Insert Error:', insertError);
    throw new Error('Failed to create player.');
  }

  revalidatePath('/admin/players');
  redirect('/admin/players');
}

export async function saveQuestionnaireTemplate(questions: string[]) {
  const supabase = createServerClient(); // <-- Use our helper function
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('questionnaire_templates')
    .insert({ questions: questions });

  if (error) {
    console.error("Error saving template:", error);
    throw new Error(error.message);
  }
  
  revalidatePath("/admin/questionnaire");
}

export async function submitQuestionnaire(formData: FormData) {
  const supabase = createServerClient(); // <-- Use our helper function
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const responseId = formData.get('responseId') as string;
  const answers = JSON.parse(formData.get('answers') as string);
  const playerId = formData.get('playerId') as string;

  if (!responseId || !answers || !playerId) {
    throw new Error("Missing required form data.");
  }

  const { error } = await supabase
    .from('questionnaire_responses')
    .update({ answers: answers, status: 'complete' })
    .eq('id', responseId);

  if (error) {
    console.error("Error submitting questionnaire:", error);
    throw new Error(error.message);
  }
  
  revalidatePath(`/dashboard/${playerId}`);
}