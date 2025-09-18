import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SetActiveButton } from "../SetActiveButton";
import { EditOrCloneButton } from "../EditOrCloneButton";
import { ManageAccessDialog } from "../ManageAccessDialog";
import { DeleteVersionButton } from "../DeleteVersionButton";
import { DeleteQuizButton } from "../DeleteQuizButton";

// This is a critical setting for Vercel/Next.js.
// It ensures this page is always rendered dynamically on the server,
// preventing stale data and fixing the "Quiz not found" error on fresh clones.
export const dynamic = 'force-dynamic';

export default async function QuizVersionsPage({ params }: { params: { quizId: string } }) {
  // Destructure params inside the function body to align with modern Next.js practices
  const { quizId } = params;
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  // Fetch the quiz family and all its versions, explicitly defining the relationship
  // to avoid ambiguity errors.
  const { data: quiz, error } = await supabase
    .from("quizzes")
    .select(`
      id,
      name,
      quiz_versions!fk_quiz_versions_quiz_id ( * )
    `)
    .eq("id", quizId)
    .order("version_number", { referencedTable: "quiz_versions", ascending: false })
    .single();

  if (error || !quiz) {
    console.error("Error fetching quiz versions:", error);
    return <p>Quiz not found or an error occurred.</p>;
  }

  // Fetch all coach access permissions for all versions of this quiz in a single query
  const { data: accessData, error: accessError } = await supabase
    .from("quiz_version_coach_access")
    .select("quiz_version_id, coach_id")
    .in("quiz_version_id", quiz.quiz_versions.map(v => v.id));

  if (accessError) {
    console.error("Error fetching coach access data:", accessError);
    // We can still render the page even if this fails, just with less info.
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/admin/quizzes" className="text-sm text-muted-foreground hover:underline">
            &larr; Back to all quizzes
          </Link>
          <h1 className="text-2xl font-bold">{quiz.name}</h1>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
            <DeleteQuizButton quizId={quizId} quizName={quiz.name} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Versions</CardTitle>
          <CardDescription>
            Manage all versions of this quiz. Cloning a version creates a new editable draft. Only one version can be active at a time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {quiz.quiz_versions.length > 0 ? (
            <div className="space-y-4">
              {quiz.quiz_versions.map(version => {
                const assignedCoachesForThisVersion = accessData?.filter(
                  (a) => a.quiz_version_id === version.id
                ) || [];

                return (
                  <div key={version.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-md">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg">
                        Version {version.version_number}
                        {version.is_active && <Badge className="ml-2">Active</Badge>}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Administered {version.times_administered} times &bull; Assigned to {assignedCoachesForThisVersion.length} coaches
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                    <SetActiveButton 
                        quizId={quizId} 
                        versionId={version.id} 
                        isActive={version.is_active} 
                    />
                    {/* Use the new component and pass all required props */}
                    <EditOrCloneButton 
                        quizId={quizId}
                        versionId={version.id}
                        timesAdministered={version.times_administered}
                        isActive={version.is_active}
                    />
                    <ManageAccessDialog 
                        versionId={version.id} 
                        initialAssignedCoaches={assignedCoachesForThisVersion}
                    />
                    <DeleteVersionButton versionId={version.id} quizId={quizId} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              <p>No versions found for this quiz.</p>
              <p>Clone the most recent version or create a new one to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

