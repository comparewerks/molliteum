"use client";

import { useEffect, useState, useRef } from 'react'; // Import useRef
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
  
  // Use a ref to ensure the effect runs only once
  const effectRan = useRef(false);

  const supabase = createClient();

  useEffect(() => {
    // Prevent the effect from running twice in development with Strict Mode
    if (effectRan.current) {
      return;
    }
    effectRan.current = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'USER_UPDATED' || event === 'PASSWORD_RECOVERY')) {
        setIsReady(true);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  // We remove supabase from the dependency array as it's stable
  // and this effect should truly only run once on mount.
  }, []);


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

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password set successfully! Redirecting to your dashboard...");
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