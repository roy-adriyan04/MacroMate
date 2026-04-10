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
      try {
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
          const dbOnboardingState = profile?.preferences?.onboardingComplete;
          
          if (dbOnboardingState === true) {
            await AsyncStorage.setItem(`onboardingComplete_${user.id}`, 'true');
            setNeedsOnboarding(false);
          } else if (dbOnboardingState === false) {
            // The database explicitly states onboarding is incomplete.
            // Overwrite any stale local cache (like from a previous user's login).
            await AsyncStorage.multiRemove([
              `onboardingComplete_${user.id}`,
              'onboarding_goal',
              'onboarding_activity',
              'onboarding_diet',
              'onboarding_metrics',
              'onboarding_ai_plan'
            ]);
            setNeedsOnboarding(true);
          } else {
            // Database request failed (null) or preference is undefined.
            // Fall back to preserving local cached state.
            const localComplete = await AsyncStorage.getItem(`onboardingComplete_${user.id}`);
            setNeedsOnboarding(localComplete !== 'true');
          }
        }
      } catch (err) {
        console.error("Layout checkState Error:", err);
      } finally {
        setChecking(false);
      }
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
