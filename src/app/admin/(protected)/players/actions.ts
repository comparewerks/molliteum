"use server";

import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from "next/cache";
import { Database, Tables } from '@/types/supabase';
import { createClient as createServerClient } from '@/lib/supabase/server';

// --- Reusable Types ---
type ActionResult = {
  success: boolean;
  message: string;
};
type PlayerData = Omit<Tables<'players'>, 'id' | 'created_at'>;

// --- Player Actions ---

export async function addPlayer(formData: FormData): Promise<ActionResult> {
  const supabaseAdmin = createAdminClient<Database>(
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
    resilience_profile: formData.get('resilience_profile') as string,
    reliability: formData.get('reliability') as string,
    self_belief: formData.get('self_belief') as string,
    focus: formData.get('focus') as string,
    adversity: formData.get('adversity') as string,
    driver: formData.get('driver') as string,
    coaching_style: formData.get('coaching_style') as string,
  };

  const playerData: Partial<PlayerData> = {
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

  if (rawFormData.playbook_type === 'pdf' && rawFormData.playbook_file.size > 0) {
    const file = rawFormData.playbook_file;
    const filePath = `playbooks/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const { error: uploadError } = await supabaseAdmin.storage.from('player_profiles').upload(filePath, file);

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      return { success: false, message: 'Failed to upload playbook PDF.' };
    }

    const { data: { publicUrl } } = supabaseAdmin.storage.from('player_profiles').getPublicUrl(filePath);
    playerData.playbook_url = publicUrl;
  } else {
    playerData.playbook_text = rawFormData.playbook_text;
  }

  const { error: insertError } = await supabaseAdmin.from('players').insert(playerData as PlayerData);

  if (insertError) {
    console.error('Insert Error:', insertError);
    return { success: false, message: `Failed to create player: ${insertError.message}` };
  }

  revalidatePath('/admin/players');
  return { success: true, message: 'Player created successfully!' };
}

export async function updatePlayer(formData: FormData): Promise<ActionResult> {
  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const playerId = formData.get('playerId') as string;
  if (!playerId) return { success: false, message: 'Player ID is missing.' };

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

  const playerData: Partial<PlayerData> = {
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

  if (rawFormData.playbook_type === 'pdf' && rawFormData.playbook_file.size > 0) {
    const file = rawFormData.playbook_file;
    const filePath = `playbooks/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const { error: uploadError } = await supabaseAdmin.storage.from('player_profiles').upload(filePath, file);
    if (uploadError) return { success: false, message: 'Failed to upload new playbook PDF.' };
    const { data: { publicUrl } } = supabaseAdmin.storage.from('player_profiles').getPublicUrl(filePath);
    playerData.playbook_url = publicUrl;
    playerData.playbook_text = null;
  } else {
    playerData.playbook_text = rawFormData.playbook_text;
    playerData.playbook_url = null;
  }

  const { error: updateError } = await supabaseAdmin.from('players').update(playerData as PlayerData).eq('id', playerId);

  if (updateError) {
    console.error('Update Error:', updateError);
    return { success: false, message: `Failed to update player: ${updateError.message}` };
  }

  revalidatePath('/admin/players');
  revalidatePath(`/admin/players/${playerId}/edit`);
  return { success: true, message: 'Player updated successfully!' };
}

export async function deletePlayer(playerId: string): Promise<ActionResult> {
  if (!playerId) {
    return { success: false, message: "Player ID is required." };
  }

  const supabaseAdmin = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // First, fetch the player to get their PDF URL for deletion from storage
  const { data: player, error: fetchError } = await supabaseAdmin
    .from('players')
    .select('playbook_url')
    .eq('id', playerId)
    .single();

  if (fetchError) {
    console.error("Error fetching player for deletion:", fetchError);
    return { success: false, message: "Could not find player to delete." };
  }

  // If a playbook PDF exists, delete it from storage
  if (player?.playbook_url) {
    const filePath = player.playbook_url.split('/player_profiles/')[1];
    const { error: storageError } = await supabaseAdmin.storage
      .from('player_profiles')
      .remove([filePath]);

    if (storageError) {
      console.error("Error deleting storage file:", storageError);
      // We can choose to continue even if file deletion fails, as the primary goal is deleting the user record.
    }
  }

  // Now, delete the player record from the database
  const { error: deleteError } = await supabaseAdmin
    .from('players')
    .delete()
    .eq('id', playerId);

  if (deleteError) {
    console.error("Error deleting player:", deleteError);
    return { success: false, message: deleteError.message };
  }

  revalidatePath('/admin/players');
  // Instead of redirecting, return a success message
  return { success: true, message: "Player deleted successfully." };
}


// --- Questionnaire Actions ---

export async function saveQuestionnaireTemplate(questions: string[]) {
  const supabase = createServerClient();
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
  const supabase = createServerClient();
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

