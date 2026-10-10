import React from 'react';
import AuthClientPage from '../../components/auth-client';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

async function getSafeSession() {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch (err) {
    console.warn("Session fetch failed, continuing as guest");
    return null;
  }
}

export default async function AuthPage() {
  const session = await getSafeSession();

  if (session) {
    redirect("/auth-dashboard");
  }

  return <AuthClientPage />;
}
