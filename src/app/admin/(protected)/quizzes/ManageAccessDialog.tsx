// src/app/admin/(protected)/quizzes/ManageAccessDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { updateCoachAccess } from "./actions";
import { toast } from "sonner";

type Coach = Tables<'profiles'>;
type Access = { coach_id: string };

export function ManageAccessDialog({ versionId, initialAssignedCoaches }: { versionId: string, initialAssignedCoaches: Access[] }) {
  const [allCoaches, setAllCoaches] = useState<Coach[]>([]);
  const [assignedIds, setAssignedIds] = useState<string[]>(() => 
    initialAssignedCoaches.map(c => c.coach_id)
  );

  useEffect(() => {
    const fetchCoaches = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('*').eq('role', 'coach');
      if (data) setAllCoaches(data);
    };
    fetchCoaches();
  }, []);

  const handleCheckboxChange = (coachId: string, checked: boolean) => {
    if (checked) {
      setAssignedIds(prev => [...prev, coachId]);
    } else {
      setAssignedIds(prev => prev.filter(id => id !== coachId));
    }
  };

  const handleSave = () => {
    toast.promise(updateCoachAccess(versionId, assignedIds), {
      loading: "Saving permissions...",
      success: "Coach access updated successfully!",
      error: (err) => err.message, // Display the specific error message from the action
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Manage Access</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Coach Access</DialogTitle>
          <DialogDescription>Select the coaches who should have access to this quiz version.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-4">
          {allCoaches.map(coach => (
            <div key={coach.id} className="flex items-center space-x-2">
              <Checkbox
                id={coach.id}
                checked={assignedIds.includes(coach.id)}
                onCheckedChange={(checked) => handleCheckboxChange(coach.id, !!checked)}
              />
              <Label htmlFor={coach.id} className="font-normal">
                {coach.first_name} {coach.last_name}
              </Label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}