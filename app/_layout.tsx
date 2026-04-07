import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { Slot } from "expo-router";
import { tokenCache } from "../lib/clerk";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const publishableKey = Constants.expoConfig?.extra?.clerkPublishableKey;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "PlusJakartaSans-Bold": "https://github.com/google/fonts/raw/main/ofl/plusjakartasans/PlusJakartaSans-Bold.ttf",
    "BeVietnamPro-Regular": "https://github.com/google/fonts/raw/main/ofl/bevietnampro/BeVietnamPro-Regular.ttf",
    // We can just rely on standard system fonts if remote ones are tricky to download all variants safely.
    // For now we'll stick to basic RN fonts for speed, let's keep it simple.
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <Slot />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
