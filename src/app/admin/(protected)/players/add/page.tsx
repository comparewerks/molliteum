import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PlayerForm from "../PlayerForm";
import { addPlayer } from "../actions";

export default async function AddPlayerPage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { data: coaches } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'coach');
    
  if (!coaches) return <p>Could not load coaches.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Add New Player</h1>
      <PlayerForm 
        coaches={coaches} 
        onSave={addPlayer} 
      />
    </div>
  );
}
