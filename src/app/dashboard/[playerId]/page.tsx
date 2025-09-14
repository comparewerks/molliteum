// src/app/dashboard/[playerId]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { submitQuestionnaire } from "@/app/admin/(protected)/players/actions";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/types/supabase"; // <-- 1. Import Supabase types

// 2. Define a reusable type for our questionnaire data
type QuestionnaireResponseWithTemplate = Tables<'questionnaire_responses'> & {
  questionnaire_templates: Tables<'questionnaire_templates'> | null;
};

// Sub-component for rendering the pending questionnaire form
function QuestionnaireForm({ response }: { response: QuestionnaireResponseWithTemplate }) { // <-- 3. Use the new type
  const questions = (response.questionnaire_templates?.questions as string[]) || [];
  
  const submitWithAnswers = async (formData: FormData) => {
    "use server";
    const answers = questions.map((_, index: number) => { // Type the index
      return formData.get(`answer-${index}`) as string || '';
    });
    formData.append('answers', JSON.stringify(answers));
    return submitQuestionnaire(formData);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Pending Questionnaire</CardTitle>
        <CardDescription>
          Please provide your feedback for the week of {new Date(response.created_at!).toLocaleDateString()}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={submitWithAnswers} className="space-y-4">
          <input type="hidden" name="responseId" value={response.id} />
          <input type="hidden" name="playerId" value={response.player_id!} />
          {questions.map((question: string, index: number) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`answer-${index}`}>{question}</Label>
              <Textarea id={`answer-${index}`} name={`answer-${index}`} required />
            </div>
          ))}
          <Button type="submit" className="w-full">Submit Answers</Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Sub-component for rendering the history of completed answers
function AnswerHistory({ responses }: { responses: QuestionnaireResponseWithTemplate[] }) { // <-- 4. Use the new type
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Answer History</h2>
      <Accordion type="single" collapsible className="w-full">
        {responses.map(response => (
          <AccordionItem key={response.id} value={response.id}>
            <AccordionTrigger>
              Week of {new Date(response.created_at!).toLocaleDateString()}
            </AccordionTrigger>
            <AccordionContent>
              {(response.questionnaire_templates?.questions as string[]).map((q: string, i: number) => (
                <div key={i} className="mb-4 last:mb-0">
                  <p className="font-semibold">{q}</p>
                  <p className="text-muted-foreground pl-4 border-l-2 ml-2 italic">
                    {(response.answers as string[])?.[i] || "No answer provided."}
                  </p>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
// The main page component
export default async function PlayerProfilePage({
  params: { playerId }, // Destructure playerId directly from params
}: {
  params: { playerId: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Now we use `playerId` directly instead of `params.playerId`
  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("id", playerId) // <-- Use playerId
    .single();

  const { data: pendingResponse } = await supabase
    .from('questionnaire_responses')
    .select(`*, questionnaire_templates ( questions )`)
    .eq('player_id', playerId) // <-- Use playerId
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const { data: completedResponses } = await supabase
    .from('questionnaire_responses')
    .select(`*, questionnaire_templates ( questions )`)
    .eq('player_id', playerId) // <-- Use playerId
    .eq('status', 'complete')
    .order('created_at', { ascending: false });

  if (!player) {
    return <p>Player not found or you do not have permission.</p>;
  }
  
  // Helper array to render metrics cleanly
  const metrics = [
    { label: 'Resilience Profile', value: player.resilience_profile },
    { label: 'Reliability', value: player.reliability },
    { label: 'Self Belief', value: player.self_belief },
    { label: 'Focus', value: player.focus },
    { label: 'Adversity', value: player.adversity },
    { label: 'Driver', value: player.driver },
    { label: 'Coaching Style', value: player.coaching_style },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Player Header */}
      <div>
        <h1 className="text-4xl font-bold">{player.first_name} {player.last_name}</h1>
      </div>

      {/* Conditionally render the pending questionnaire form at the top if it exists */}
      {pendingResponse && <QuestionnaireForm response={pendingResponse} />}

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Playbook */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">Player Playbook</h2>
          {player.playbook_url ? (
            <Button asChild>
              <a href={player.playbook_url} target="_blank" rel="noopener noreferrer">
                Download Playbook PDF
              </a>
            </Button>
          ) : player.playbook_text ? (
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: player.playbook_text }}
            />
          ) : (
            <p className="text-muted-foreground">No playbook available for this player.</p>
          )}
        </div>

        {/* Right Column: Metrics */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">Player Metrics</h2>
          <div className="space-y-2">
            {metrics.map(metric => (
              <div key={metric.label} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{metric.label}</span>
                <Badge variant="secondary">{metric.value || 'N/A'}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Conditionally render the answer history */}
      {completedResponses && completedResponses.length > 0 && <AnswerHistory responses={completedResponses} />}
    </div>
  );
}