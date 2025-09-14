// src/app/admin/(protected)/players/DeletePlayerButton.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deletePlayer } from "./actions";
import { toast } from "sonner";

export function DeletePlayerButton({ playerId }: { playerId: string }) {
  const router = useRouter();
  
  const handleDelete = async () => {
    const toastId = toast.loading('Deleting player...');

    const result = await deletePlayer(playerId);

    if (result.success) {
      toast.success(result.message, { id: toastId });
      // On success, the client handles the redirect
      router.push('/admin/players');
    } else {
      toast.error(result.message, { id: toastId });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Player</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this player&apos;s profile and playbook.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {/* We use a standard button here and call our async handler */}
          <Button variant="destructive" onClick={handleDelete}>
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}