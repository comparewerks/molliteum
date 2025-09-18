// src/app/admin/coaches/InviteCoachDialog.tsx
"use client";

import { useState, useRef } from "react";
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
import { inviteCoach } from "./actions";
import { toast } from "sonner";

export function InviteCoachDialog() {
  const formRef = useRef<HTMLFormElement>(null);
  // 1. Control the dialog's open state
  const [open, setOpen] = useState(false);

  return (
    // 2. Bind the state to the Dialog component
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Invite New Coach</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Coach</DialogTitle>
          <DialogDescription>
            Enter the coach's details below. They will receive an invitation to set up their account.
          </DialogDescription>
        </DialogHeader>
        <form 
          ref={formRef}
          action={async (formData) => {
            // 3. Await the result from the server action
            const result = await inviteCoach(formData);

            // 4. Provide feedback based on the result
            if (result.success) {
              toast.success(result.message);
              formRef.current?.reset();
              setOpen(false); // Close dialog on success
            } else {
              toast.error(result.message);
            }
          }}
        >
          {/* ... your input fields ... */}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firstName" className="text-right">
                    First Name
                </Label>
                <Input id="firstName" name="firstName" className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lastName" className="text-right">
                    Last Name
                </Label>
                <Input id="lastName" name="lastName" className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                    Email
                </Label>
                <Input id="email" name="email" type="email" className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="organization" className="text-right">Organization</Label>
                <Input id="organization" name="organization" className="col-span-3" required/>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Send Invitation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}