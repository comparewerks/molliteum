// src/app/admin/(protected)/quizzes/EditOrCloneButton.tsx
"use client";
    
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cloneQuizVersion } from "./actions";
import { toast } from "sonner";
    
export function EditOrCloneButton({ 
  quizId,
  versionId,
  timesAdministered,
  isActive
}: { 
  quizId: string;
  versionId: string;
  timesAdministered: number;
  isActive: boolean;
}) {
  const router = useRouter();

  // Determine if the version should be directly editable.
  // A version is editable if it has NEVER been administered AND is NOT active.
  const isDirectlyEditable = timesAdministered === 0 && !isActive;

  const handleCloneAction = async () => {
    const toastId = toast.loading("Cloning version...");
    const result = await cloneQuizVersion(versionId);
    if (result.success && result.quizId && result.newVersionId) {
      toast.success(result.message, { id: toastId });
      router.push(`/admin/quizzes/${result.quizId}/versions/${result.newVersionId}/edit`);
    } else {
      toast.error(result.message, { id: toastId });
    }
  };
    
  if (isDirectlyEditable) {
    // If it's a new draft, this is a simple link to the edit page.
    return (
      <Button asChild size="sm">
        <Link href={`/admin/quizzes/${quizId}/versions/${versionId}/edit`}>Edit</Link>
      </Button>
    );
  }

  // Otherwise, it's a clone button that runs the server action.
  return (
    <Button onClick={handleCloneAction} variant="outline" size="sm">
      Clone & Edit
    </Button>
  );
}