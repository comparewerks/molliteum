// src/app/admin/(protected)/quizzes/SetActiveButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { setActiveVersion } from "./actions";
import { toast } from "sonner";

export function SetActiveButton({ 
  quizId, 
  versionId, 
  isActive 
}: { 
  quizId: string; 
  versionId: string; 
  isActive: boolean;
}) {
  const handleAction = () => {
    toast.promise(setActiveVersion(quizId, versionId), {
      loading: "Updating status...",
      success: "Active version has been updated!",
      error: "Failed to update status.",
    });
  };

  return <Button onClick={handleAction} disabled={isActive} size="sm">Set Active</Button>;
}