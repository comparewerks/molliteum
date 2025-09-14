// src/app/admin/login/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Correct hook for App Router
import { createClient } from "@/lib/supabase/client";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  // State hooks to store user input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Next.js router for navigation
  const router = useRouter();
  // Initialize the Supabase client
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the form from reloading the page
    setError(null); // Reset error state on new submission

    try {
      // Call the Supabase sign in method
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If Supabase returns an error, throw it to be caught by the catch block
      if (error) {
        throw error;
      }

      // On successful login, redirect to the admin dashboard
      // The router.refresh() is a good practice to ensure the layout re-renders
      // with the new authentication state.
      router.refresh();
      router.push("/admin/coaches");

    } catch (error: any) {
      console.error("Authentication error:", error.message);
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Image
            src="/images/logo.avif" // Path to your logo
            alt="Company Logo"
            width={150} // Adjust width as needed
            height={50} // Adjust height as needed
            className="mx-auto mb-4" // Center the logo
          />
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Conditionally render the error message */}
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}