
import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import React from 'react';
import { colors, spacing, typography, borderRadius } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function NotFoundScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? colors.dark : colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Oops!', headerShown: false }} />
      
      <View style={styles.content}>
        <IconSymbol
          ios_icon_name="exclamationmark.triangle.fill"
          android_material_icon_name="error"
          size={80}
          color={theme.textSecondary}
        />
        
        <Text style={[styles.title, { color: theme.text }]}>
          Page Not Found
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          This screen doesn&apos;t exist.
        </Text>
        
        <Link href="/" style={[styles.link, { backgroundColor: theme.primary }]}>
          <Text style={styles.linkText}>Go to Home</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.h1,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  link: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  linkText: {
    color: '#FFFFFF',
    ...typography.body,
    fontWeight: '600',
  },
});
