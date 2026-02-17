
import React from 'react';
import { Stack } from 'expo-router';

export default function TabLayout() {
  // Single screen app - no tabs needed for PackSmart
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'default',
      }}
    >
      <Stack.Screen name="(home)" />
    </Stack>
  );
}
