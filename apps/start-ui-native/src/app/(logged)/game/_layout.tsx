import { Stack } from 'expo-router';

export default function GameLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Godot Game' }} />
    </Stack>
  );
}
