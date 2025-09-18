// src/app/admin/(protected)/quizzes/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreateQuizDialog } from "./CreateQuizDialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function QuizzesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  // Fetch all quiz families and their associated versions in a single query
    const { data: quizzes, error } = await supabase
    .from("quizzes")
    .select(`
        id,
        name,
        quiz_versions!fk_quiz_versions_quiz_id ( version_number, is_active, times_administered )
    `);

  if (error) {
    console.error("Error fetching quizzes:", error);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Quiz Management</h1>
        <CreateQuizDialog />
      </div>
      
      {quizzes && quizzes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map(quiz => {
            // Calculate total times administered and find the active version
            const totalAdministered = quiz.quiz_versions.reduce((acc, v) => acc + v.times_administered, 0);
            const activeVersion = quiz.quiz_versions.find(v => v.is_active);

            return (
              <Link href={`/admin/quizzes/${quiz.id}`} key={quiz.id}>
                <Card className="hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle>{quiz.name}</CardTitle>
                    <CardDescription>
                      {activeVersion ? `v${activeVersion.version_number} is active` : "No active version"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Administered</span>
                    <Badge variant="secondary">{totalAdministered} times</Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-8 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No Quizzes Found</h2>
          <p className="text-muted-foreground mt-2">
            Click "Create New Quiz" to get started.
          </p>
        </div>
      )}
    </div>
  );
}