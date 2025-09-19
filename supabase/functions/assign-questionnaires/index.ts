// supabase/functions/assign-questionnaires/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// It's a good practice to define the structure of your data.
// You can generate these automatically with `supabase gen types typescript > types.ts`
interface Player {
  id: string; // or number, depending on your schema
}

interface QuestionnaireTemplate {
  id: number;
}


serve(async (_req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 1. Get the latest questionnaire template
    const { data: latestTemplate, error: templateError } = await supabase
      .from('questionnaire_templates')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single<QuestionnaireTemplate>(); // Specify the expected type here

    if (templateError) throw templateError;
    if (!latestTemplate) throw new Error("No questionnaire template found.");

    // 2. Get all players
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id')
      .returns<Player[]>(); // Specify the expected return type here

    if (playersError) throw playersError;
    if (!players || players.length === 0) {
      return new Response(
        JSON.stringify({ message: "No players to assign questionnaires to." }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // 3. Create a new pending response for each player
    const newResponses = players.map((player: { id: any; }) => ({
      player_id: player.id,
      template_id: latestTemplate.id,
      status: 'pending'
    }));

    // 4. Bulk insert the new responses
    const { error: insertError } = await supabase
      .from('questionnaire_responses')
      .insert(newResponses);

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: `Successfully assigned questionnaires to ${players.length} players.` }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    // This is a safer way to handle unknown errors in a catch block
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: errorMessage }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
    });
  }
});