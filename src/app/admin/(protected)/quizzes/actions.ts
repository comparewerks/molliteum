// src/app/admin/(protected)/quizzes/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type QuizData = {
  questions: {
    id: string;
    text: string;
    metric: string;
    choices: {
      id: string;
      text: string;
      value: number;
    }[];
  }[];
};

export async function createQuiz(formData: FormData) {
  const supabase = createClient();
  const name = formData.get("name") as string;

  if (!name) {
    throw new Error("Quiz name is required.");
  }

  // 1. Create the parent quiz "family"
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .insert({ name: name })
    .select()
    .single();

  if (quizError || !quiz) {
    console.error("Error creating quiz:", quizError);
    throw new Error("Failed to create quiz family.");
  }

  // 2. Create the initial, empty Version 1 for this new quiz
  const { data: version, error: versionError } = await supabase
    .from("quiz_versions")
    .insert({
      quiz_id: quiz.id,
      version_number: 1,
      is_active: false, // It starts as an inactive draft
      quiz_data: { questions: [] }, // Empty shell
    })
    .select()
    .single();

  if (versionError || !version) {
    console.error("Error creating initial version:", versionError);
    // Here you might want to delete the parent quiz for cleanup
    throw new Error("Failed to create initial quiz version.");
  }

  revalidatePath("/admin/quizzes");
  // Redirect the user directly to the new quiz's edit page
  redirect(`/admin/quizzes/${quiz.id}`);
}



export async function setActiveVersion(quizId: string, versionId: string) {
  const supabase = createClient();

  // Transaction to ensure data consistency:
  // 1. Deactivate all versions for this quiz family.
  const { error: deactivateError } = await supabase
    .from("quiz_versions")
    .update({ is_active: false })
    .eq("quiz_id", quizId);

  if (deactivateError) {
    console.error("Error deactivating old versions:", deactivateError);
    throw new Error("Failed to update version status.");
  }

  // 2. Activate the selected version.
  const { error: activateError } = await supabase
    .from("quiz_versions")
    .update({ is_active: true })
    .eq("id", versionId);

  if (activateError) {
    console.error("Error activating new version:", activateError);
    throw new Error("Failed to set new active version.");
  }

  revalidatePath(`/admin/quizzes/${quizId}`);
  revalidatePath('/admin/quizzes'); // Also revalidate the main hub page
}

export async function cloneQuizVersion(versionId: string): Promise<{
  success: boolean;
  message: string;
  quizId?: string;
  newVersionId?: string;
}> {
  const supabase = createClient();

  // 1. Fetch the version we want to clone
  const { data: originalVersion, error: fetchError } = await supabase
    .from("quiz_versions")
    .select("*")
    .eq("id", versionId)
    .single();
  
  if (fetchError || !originalVersion) {
    return { success: false, message: "Could not find the quiz version to clone." };
  }

  // 2. Find the highest existing version number for this quiz family
  const { data: highestVersion, error: countError } = await supabase
    .from("quiz_versions")
    .select("version_number")
    .eq("quiz_id", originalVersion.quiz_id)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();

  if (countError && countError.code !== 'PGRST116') { // Ignore 'no rows found' error
    return { success: false, message: "Could not determine the next version number." };
  }

  const nextVersionNumber = (highestVersion?.version_number || 0) + 1;

  // 3. Insert the new version as an inactive draft
  const { data: newVersion, error: insertError } = await supabase
    .from("quiz_versions")
    .insert({
      quiz_id: originalVersion.quiz_id,
      version_number: nextVersionNumber,
      quiz_data: originalVersion.quiz_data,
      is_active: false,
    })
    .select("id")
    .single();

  if (insertError || !newVersion) {
    return { success: false, message: "Failed to create a new version clone." };
  }

  revalidatePath(`/admin/quizzes/${originalVersion.quiz_id}`);
  
  // Return a success object with the IDs needed for the redirect
  return { 
    success: true, 
    message: "Version cloned successfully!",
    quizId: originalVersion.quiz_id,
    newVersionId: newVersion.id
  };
}

export async function updateCoachAccess(versionId: string, assignedCoachIds: string[]) {
  const supabase = createClient();

  // First, remove ALL existing assignments for this specific version.
  // This is simpler than trying to figure out who was added/removed.
  const { error: deleteError } = await supabase
    .from("quiz_version_coach_access")
    .delete()
    .eq("quiz_version_id", versionId);
  
  if (deleteError) throw new Error("Failed to clear old permissions.");

  // If there are any coaches to assign, insert the new permissions.
  if (assignedCoachIds.length > 0) {
    const assignments = assignedCoachIds.map(coachId => ({
      quiz_version_id: versionId,
      coach_id: coachId,
    }));

    // The unique constraint on coach_id might cause this to fail if a coach
    // is already assigned to a DIFFERENT version. We need to handle this gracefully.
    const { error: insertError } = await supabase
      .from("quiz_version_coach_access")
      .insert(assignments);

    if (insertError) {
      // This error will likely fire if a coach is already assigned elsewhere.
      // We should provide a user-friendly message.
      if (insertError.code === '23505') { // Unique violation error code
        throw new Error("Failed to save: One or more coaches are already assigned to a different quiz version.");
      }
      throw new Error(insertError.message);
    }
  }

  revalidatePath(`/admin/quizzes/[quizId]`, 'page');
}

export async function updateQuizVersionData(versionId: string, quizData: QuizData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("quiz_versions")
    .update({ quiz_data: quizData })
    .eq("id", versionId);

  if (error) {
    console.error("Error updating quiz data:", error);
    throw new Error("Failed to save quiz content.");
  }

  revalidatePath(`/admin/quizzes/[quizId]/versions/${versionId}/edit`, 'page');
}

export async function deleteQuizVersion(versionId: string, quizId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("quiz_versions")
    .delete()
    .eq("id", versionId);

  if (error) {
    console.error("Error deleting version:", error);
    throw new Error("Failed to delete quiz version.");
  }

  revalidatePath(`/admin/quizzes/${quizId}`);
}


// --- Action to delete an ENTIRE quiz family ---
// This will cascade and delete all its versions due to our database schema.
export async function deleteQuizFamily(quizId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", quizId);
  
  if (error) {
    console.error("Error deleting quiz family:", error);
    throw new Error("Failed to delete quiz.");
  }

  revalidatePath('/admin/quizzes');
  redirect('/admin/quizzes'); // Go back to the main hub after deletion
}