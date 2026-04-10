import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="goal" />
      <Stack.Screen name="activity-level" />
      <Stack.Screen name="dietary-preferences" />
      <Stack.Screen name="metrics-and-gender" />
      <Stack.Screen name="buddy-invite" />
      <Stack.Screen name="generating-plan" />
      <Stack.Screen name="plan-summary" />
    </Stack>
  );
}
