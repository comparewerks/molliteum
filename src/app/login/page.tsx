"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Import the Next.js Image component
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// A sub-component for the "Forgot Password" functionality
function ForgotPasswordDialog() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm`, // Page where user will set their new password
    });

    if (error) {
      setError("Could not send reset link. Please check the email address.");
    } else {
      setMessage("If an account with that email exists, a password reset link has been sent");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto font-normal">
          Forgot your password?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email address below to receive a link to reset your password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handlePasswordReset}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reset-email" className="text-right">Email</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            {message && <p className="col-span-4 text-sm text-green-500">{message}</p>}
            {error && <p className="col-span-4 text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit">Send Reset Link</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


// The main login page component
export default function CoachLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Image
            src="/images/logo.png"
            alt="Company Logo"
            width={175}
            height={100}
            className="mx-auto mb-4"
            priority
          />
          <CardTitle className="text-2xl">Coach Portal</CardTitle>
          <CardDescription>
            Enter your email and password to log in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
              id="email" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} required 
              placeholder="Email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
              id="password" 
              type="password" 
              value={password} onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Password"
              />
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <ForgotPasswordDialog />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
