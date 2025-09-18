// src/app/admin/(protected)/quizzes/DeleteQuizButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { deleteQuizFamily } from "./actions";
import { toast } from "sonner";

export function DeleteQuizButton({ quizId, quizName }: { quizId: string, quizName: string }) {
  const handleAction = () => {
    toast.promise(deleteQuizFamily(quizId), {
      loading: "Deleting quiz family...",
      success: "Quiz deleted successfully!",
      error: "Failed to delete quiz.",
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Quiz</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{quizName}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is permanent and will delete this quiz and ALL of its versions. Are you absolutely sure?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAction}>Yes, delete everything</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}