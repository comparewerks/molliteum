// src/app/admin/(protected)/quizzes/[quizId]/versions/[versionId]/edit/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { QuizBuilder } from "./QuizBuilder";
import { DeleteVersionButton } from "../DeleteVersionButton"; 
import { DeleteQuizButton } from "../DeleteQuizButton";

export const dynamic = 'force-dynamic';

export default async function EditQuizVersionPage({
  params,
}: {
  params: { quizId: string; versionId: string };
}) {
  const { quizId, versionId } = params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // Fetch the specific version's data
  const { data: version, error } = await supabase
    .from("quiz_versions")
    .select("*, quizzes ( name )")
    .eq("id", versionId)
    .single();

  if (error || !version) {
    return <p>Quiz version not found.</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <Link href={`/admin/quizzes/${quizId}`} className="text-sm text-muted-foreground hover:underline">
          &larr; Back to Versions
        </Link>
        <h1 className="text-2xl font-bold">{version.quizzes?.name} - Editing v{version.version_number}</h1>
      </div>
      
      {/* This client component will contain all the complex editing logic */}
      <QuizBuilder version={version} />
    </div>
  );
}