// src/app/dashboard/[playerId]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function PlayerProfilePage({
  params,
}: {
  params: { playerId: string };
}) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch a single player. RLS ensures the coach can only fetch
  // players that are assigned to them. If they guess a URL for a
  // player not on their roster, this will return `null`.
  const { data: player, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", params.playerId)
    .single();

  if (error || !player) {
    return <p>Player not found or you do not have permission to view this profile.</p>;
  }

  // A simple helper to render metric rows
  const renderMetric = (label: string, value: string | null) => (
    <div className="flex justify-between border-b py-2">
      <span className="font-semibold">{label}</span>
      <span>{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{player.first_name} {player.last_name}</h1>
      <hr className="my-6" />

      {/* Playbook Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Player Playbook</h2>
        {player.playbook_url ? (
          <Button asChild>
            <a href={player.playbook_url} target="_blank" rel="noopener noreferrer">
              Download Playbook PDF
            </a>
          </Button>
        ) : player.playbook_text ? (
          <div
            className="prose dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: player.playbook_text }}
          />
        ) : (
          <p>No playbook available.</p>
        )}
      </div>

      {/* Metrics Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Player Metrics</h2>
        <div className="space-y-2">
          {renderMetric('Resilience Profile', player.resilience_profile)}
          {renderMetric('Reliability', player.reliability)}
          {renderMetric('Self Belief', player.self_belief)}
          {renderMetric('Focus', player.focus)}
          {renderMetric('Adversity', player.adversity)}
          {renderMetric('Driver', player.driver)}
          {renderMetric('Coaching Style', player.coaching_style)}
        </div>
      </div>
    </div>
  );
}