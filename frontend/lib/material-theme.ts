import { createTheme, MantineColorsTuple } from '@mantine/core';

// Material Design 3 (M3) Color Palette
const m3LightColors = {
  primary: '#005AC1',
  onPrimary: '#FFFFFF',
  primaryContainer: '#D8E2FF',
  onPrimaryContainer: '#001A41',
  secondary: '#575E71',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#DBE2F9',
  onSecondaryContainer: '#141B2C',
  tertiary: '#715573',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FBD7FC',
  onTertiaryContainer: '#29132D',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
  background: '#FEFBFF',
  onBackground: '#1B1B1F',
  surface: '#FEFBFF',
  onSurface: '#1B1B1F',
  surfaceVariant: '#E1E2EC',
  onSurfaceVariant: '#44474F',
  outline: '#74777F',
  shadow: '#000000',
  inverseSurface: '#303033',
  inverseOnSurface: '#F2F0F4',
  inversePrimary: '#ADC6FF',
  surfaceTint: '#005AC1',
};

const m3DarkColors = {
  primary: '#ADC6FF',
  onPrimary: '#002E69',
  primaryContainer: '#004494',
  onPrimaryContainer: '#D8E2FF',
  secondary: '#BFC6DC',
  onSecondary: '#293041',
  secondaryContainer: '#3F4759',
  onSecondaryContainer: '#DBE2F9',
  tertiary: '#DEBCDF',
  onTertiary: '#402843',
  tertiaryContainer: '#583E5B',
  onTertiaryContainer: '#FBD7FC',
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',
  background: '#1B1B1F',
  onBackground: '#E3E2E6',
  surface: '#1B1B1F',
  onSurface: '#E3E2E6',
  surfaceVariant: '#44474F',
  onSurfaceVariant: '#C4C6CF',
  outline: '#8E9099',
  shadow: '#000000',
  inverseSurface: '#E3E2E6',
  inverseOnSurface: '#303033',
  inversePrimary: '#005AC1',
  surfaceTint: '#ADC6FF',
};

// Mantine color tuples for the app's specific colors
const accentBlue: MantineColorsTuple = [
  '#e7f3ff', '#d0e7ff', '#a3cfff', '#75b7ff', '#4a90e2',
  '#3a7bc8', '#2a66ae', '#1a5194', '#0a3c7a', '#002760'
];

// Base theme settings for M3
const baseTheme = {
  fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  headings: { fontFamily: 'Roboto, sans-serif' },
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '28px',
  },
};

// Light Theme based on M3
export const lightTheme = createTheme({
  ...baseTheme,
  primaryColor: 'blue',
  colorScheme: 'light',
  colors: {
    blue: accentBlue,
  },
  other: {
    ...m3LightColors,
  },
});

// Dark Theme based on M3
export const darkTheme = createTheme({
  ...baseTheme,
  primaryColor: 'blue',
  colorScheme: 'dark',
  colors: {
    blue: accentBlue,
  },
  other: {
    ...m3DarkColors,
  },
});

// Function to get the appropriate Mantine theme
export const getMantineTheme = (colorScheme: 'light' | 'dark') => {
  return colorScheme === 'light' ? lightTheme : darkTheme;
};
