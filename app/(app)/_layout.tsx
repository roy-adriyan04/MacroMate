import { Redirect, Stack, useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';
import { saveUserProfile, getUserProfile } from '../../lib/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AppLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    async function checkState() {
      if (isSignedIn && user) {
        // Save base info
        await saveUserProfile(user.id, {
          uid: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          displayName: user.fullName || "User",
          photoURL: user.imageUrl || null,
          provider: user.externalAccounts.length > 0 ? "google" : "email"
        });

        const profile = await getUserProfile(user.id);
        const isDbComplete = profile?.preferences?.onboardingComplete === true;
        
        if (isDbComplete) {
          await AsyncStorage.setItem('onboardingComplete', 'true');
          setNeedsOnboarding(false);
        } else {
          // The database clearly states onboarding is incomplete.
          // Overwrite any stale local cache (like from a previous user's login).
          await AsyncStorage.removeItem('onboardingComplete');
          setNeedsOnboarding(true);
        }
      }
      setChecking(false);
    }
    
    if (isLoaded) {
      checkState();
    }
  }, [isSignedIn, user, isLoaded]);

  if (!isLoaded || checking) return null;

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (needsOnboarding) {
    return <Redirect href="/(onboarding)/goal" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
