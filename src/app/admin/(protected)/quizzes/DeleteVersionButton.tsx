// src/app/admin/(protected)/quizzes/DeleteVersionButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { deleteQuizVersion } from "./actions";
import { toast } from "sonner";

export function DeleteVersionButton({ versionId, quizId }: { versionId: string, quizId: string }) {
  const handleAction = () => {
    toast.promise(deleteQuizVersion(versionId, quizId), {
      loading: "Deleting version...",
      success: "Version deleted successfully!",
      error: "Failed to delete version.",
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This will permanently delete this version. This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAction}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}