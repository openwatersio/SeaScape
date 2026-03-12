import "@/lib/backgroundLocation"; // Register background task at module scope
import { router, Stack } from "expo-router";
import { Button } from 'react-native';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="ViewOptions" options={{
        presentation: "fullScreenModal",
        title: "View Options",
        headerRight: () => (
          <Button title="Done" onPress={() => router.dismiss()} />
        ),
      }} />
      <Stack.Screen name="Tracks" options={{
        presentation: "modal",
        title: "Tracks",
        headerRight: () => (
          <Button title="Done" onPress={() => router.dismiss()} />
        ),
      }} />
    </Stack>
  );
}
