
import { StyleSheet } from 'react-native';

// PackSmart Glassmorphic Color Palette
export const colors = {
  // Light mode - Soft pastels with glass effect
  light: {
    background: '#E8F4F8', // Soft blue-gray gradient base
    backgroundGradientStart: '#E8F4F8',
    backgroundGradientEnd: '#F0E8F8',
    card: 'rgba(255, 255, 255, 0.75)', // Semi-transparent white
    cardBlur: 'rgba(255, 255, 255, 0.85)', // Slightly more opaque for important cards
    text: '#1A2332',
    textSecondary: '#5A6B7D',
    primary: '#0EA5E9', // Sky blue
    primaryGlass: 'rgba(14, 165, 233, 0.15)', // Glass tint
    secondary: '#06B6D4', // Cyan
    secondaryGlass: 'rgba(6, 182, 212, 0.15)',
    accent: '#F59E0B', // Amber
    accentGlass: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(226, 232, 240, 0.3)', // Subtle glass border
    borderStrong: 'rgba(226, 232, 240, 0.6)',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    highlight: 'rgba(224, 242, 254, 0.5)',
    overlay: 'rgba(15, 23, 42, 0.4)', // Modal overlay
    glassShine: 'rgba(255, 255, 255, 0.4)', // Top shine effect
  },
  // Dark mode - Deep blues with glass effect
  dark: {
    background: '#0A1628', // Deep blue-black gradient base
    backgroundGradientStart: '#0A1628',
    backgroundGradientEnd: '#1A1A2E',
    card: 'rgba(30, 41, 59, 0.7)', // Semi-transparent dark blue
    cardBlur: 'rgba(30, 41, 59, 0.85)',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    primary: '#38BDF8',
    primaryGlass: 'rgba(56, 189, 248, 0.2)',
    secondary: '#22D3EE',
    secondaryGlass: 'rgba(34, 211, 238, 0.2)',
    accent: '#FBBF24',
    accentGlass: 'rgba(251, 191, 36, 0.2)',
    border: 'rgba(51, 65, 85, 0.4)',
    borderStrong: 'rgba(51, 65, 85, 0.7)',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    highlight: 'rgba(30, 58, 95, 0.5)',
    overlay: 'rgba(0, 0, 0, 0.6)',
    glassShine: 'rgba(255, 255, 255, 0.1)',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
};

// Glassmorphic shadows - subtle elevation
export const shadows = {
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  glassHover: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Glass card base style
  glassCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  // Shine effect overlay
  glassShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    opacity: 0.3,
  },
});
