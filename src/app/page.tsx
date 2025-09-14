// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Permanently redirect users from the root to the coach login page.
  redirect('/login');
}