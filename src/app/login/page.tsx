// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function CoachLoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        // This is the URL the user will be redirected to after clicking the magic link.
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Error sending magic link:", error);
      setError("Could not send magic link. Please try again.");
    } else {
      setMessage("Magic link sent! Please check your email.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
        <Image
            src="/images/logo.avif" // Path to your logo
            alt="Company Logo"
            width={150} // Adjust width as needed
            height={50} // Adjust height as needed
            className="mx-auto mb-4" // Center the logo
          />
          <CardTitle className="text-2xl">Coach Portal</CardTitle>
          <CardDescription>
            Enter your email to receive a secure login link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="coach@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {message && <p className="text-sm text-green-500">{message}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full">
              Send Login Link
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}