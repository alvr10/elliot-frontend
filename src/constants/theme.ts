/**
 * Theme Configuration
 * Elliot uses one theme only
 */

import { Colors } from './colors';

export const Theme = {
  light: {
    // Background colors
    background: Colors.background,
    backgroundSecondary: Colors.backgroundGray,
    backgroundTertiary: Colors.gray200,

    // Surface colors
    surface: Colors.white,
    surfaceVariant: Colors.gray100,

    // Text colors
    text: {
      primary: Colors.textPrimary,
      secondary: Colors.textSecondary,
      disabled: Colors.textDisabled,
      inverse: Colors.black,
    },

    // Brand colors (keep bright for dark mode)
    primary: Colors.primary,
    primaryDark: Colors.primaryDark,
    primaryLight: Colors.primaryLight,

    secondary: Colors.secondary,
    secondaryDark: Colors.secondaryDark,
    secondaryLight: Colors.secondaryLight,

    // Semantic colors
    success: Colors.success,
    warning: Colors.warning,
    error: Colors.error,
    info: Colors.info,

    // Borders
    border: Colors.border,
    borderFocused: Colors.primary,

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.1)',
    overlayLight: 'rgba(0, 0, 0, 0.05)',

    // Status bar
    statusBar: 'dark' as const,
  },
} as const;

// Export only light theme since we're light mode only
export const AppTheme = Theme.light;