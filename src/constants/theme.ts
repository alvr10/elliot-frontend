/**
 * Theme Configuration
 * Elliot uses one theme only
 */

import { Colors } from './colors';

export const Theme = {
  dark: {
    // Background colors
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    backgroundTertiary: '#2C2C2C',

    // Surface colors
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',

    // Text colors
    text: {
      primary: '#e2e2e2ff',
      secondary: '#B3B3B3',
      disabled: '#666666',
      inverse: '#121212',
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
    border: '#2C2C2C',
    borderFocused: Colors.primary,

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',

    // Status bar
    statusBar: 'light' as const,
  },
} as const;

// Export only dark theme since we're dark mode only
export const AppTheme = Theme.dark;