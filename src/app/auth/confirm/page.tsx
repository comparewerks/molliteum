// C:\Users\jacob\Coding Projects\Molliteum\molliteum\src\app\auth\confirm\page.tsx

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ConfirmPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // This is the only listener you need. When the page loads,
    // Supabase processes the URL hash. If the tokens are valid,
    // it will fire this event with the `session` object.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // We listen for the user being updated (for invites) or password recovery.
      // The crucial part is `session`, which confirms authentication.
      if (session && (event === 'USER_UPDATED' || event === 'PASSWORD_RECOVERY')) {
        setIsReady(true);
      }
    });

    // Cleanup the subscription when the component unmounts.
    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);


  const handleSetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // Now that the user is authenticated via the invite link,
    // we can update their password.
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password set successfully! Redirecting to your dashboard...");
      // Redirect to a protected page, not the login page,
      // as the user is now logged in.
      setTimeout(() => router.push('/dashboard'), 2000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Account Setup</CardTitle>
          <CardDescription>
            {isReady 
              ? "Please set a password to activate your account." 
              : "Verifying your invitation..."}
          </CardDescription>
        </CardHeader>
        {isReady && (
          <CardContent>
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              {message && <p className="text-sm text-green-500">{message}</p>}
              <Button type="submit" className="w-full">Set Password</Button>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}