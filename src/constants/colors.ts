/**
 * Color Constants
 * Deliveroo Brand Colors and Theme
 */

export const Colors = {
  // Primary Brand Colors
  primary: '#0088ccff', // Elliot Teal
  primaryDark: '#005885ff',
  primaryLight: '#32aeecff',

  // Secondary Colors
  secondary: '#FF4B3E',
  secondaryDark: '#E63E32',
  secondaryLight: '#FF6B60',

  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  // Semantic Colors
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',

  // Text Colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  textWhite: '#FFFFFF',

  // Background Colors
  background: '#FFFFFF',
  backgroundGray: '#F5F5F5',
  backgroundDark: '#212121',

  // Border Colors
  border: '#E0E0E0',
  borderDark: '#BDBDBD',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

export type ColorKey = keyof typeof Colors;