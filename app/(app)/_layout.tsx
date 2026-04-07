import { Redirect, Stack } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useEffect } from 'react';
import { saveUserProfile } from '../../lib/firebase';

export default function AppLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      saveUserProfile(user.id, {
        uid: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        displayName: user.fullName || "User",
        photoURL: user.imageUrl || null,
        provider: user.externalAccounts.length > 0 ? "google" : "email"
      });
    }
  }, [isSignedIn, user]);

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
