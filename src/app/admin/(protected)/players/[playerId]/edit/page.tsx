import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PlayerForm from "../../PlayerForm";
import { updatePlayer } from "../../actions";

export default async function EditPlayerPage({ params }: { params: { playerId: string } }) {
  const { playerId } = params;
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  // Fetch the specific player's data
  const { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single();

  // Fetch the list of all coaches
  const { data: coaches } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'coach');

  if (!player || !coaches) {
    return <p>Player or coach data could not be loaded.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Player</h1>
      <PlayerForm 
        coaches={coaches} 
        player={player} 
        onSave={updatePlayer} 
      />
    </div>
  );
}
