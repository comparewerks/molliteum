// src/app/admin/(protected)/quizzes/CreateQuizDialog.tsx
"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createQuiz } from "./actions";
import { toast } from "sonner";

export function CreateQuizDialog() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleAction = async (formData: FormData) => {
    toast.promise(createQuiz(formData), {
      loading: "Creating new quiz...",
      // Success toast won't show due to redirect, which is fine
      success: "Quiz created!",
      error: "Failed to create quiz.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create New Quiz</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Quiz</DialogTitle>
          <DialogDescription>
            Give your new quiz family a name. You can add questions and versions in the next step.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={handleAction}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" name="name" className="col-span-3" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create and Edit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}