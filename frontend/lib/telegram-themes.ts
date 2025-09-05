import { createTheme, MantineColorsTuple } from '@mantine/core';

// Цвета для светлой темы Telegram
const lightThemeColors = {
  // Основные фоны
  backgrounds: {
    primary: '#ffffff',
    secondary: '#f8f9fa',
    cards: '#ffffff',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    modalContent: '#ffffff'
  },

  // Текст
  text: {
    primary: '#000000',
    secondary: '#6c757d',
    tertiary: '#adb5bd',
    currency: '#000000'
  },

  // Суммы
  amounts: {
    positive: '#00C896', // income
    negative: '#FF6B6B', // expense
    neutral: '#000000'
  },

  // Семантические цвета
  semantic: {
    income: '#00C896',
    expense: '#FF6B6B',
    transfer: '#4A90E2',
    warning: '#FFB800',
    success: '#4ECDC4',
    error: '#FF4757'
  },

  // Акценты
  accents: {
    primary: '#4A90E2',
    secondary: '#007AFF',
    fabButton: '#6C5CE7'
  },

  // Категории
  categories: {
    entertainment: '#4ECDC4',
    food: '#FF6B6B',
    shopping: '#FFB800',
    transport: '#4A90E2',
    vacation: '#FF8A65',
    salary: '#00C896'
  }
} as const;

// Цвета для темной темы Telegram
const darkThemeColors = {
  // Основные фоны
  backgrounds: {
    primary: '#17212b',
    secondary: '#1e2a3a',
    cards: '#2b2b2b',
    modalOverlay: 'rgba(0, 0, 0, 0.8)',
    modalContent: '#1e2a3a'
  },

  // Текст
  text: {
    primary: '#ffffff',
    secondary: '#a0a0a0',
    tertiary: '#666666',
    currency: '#ffffff'
  },

  // Суммы
  amounts: {
    positive: '#00C896', // income
    negative: '#FF6B6B', // expense
    neutral: '#ffffff'
  },

  // Семантические цвета
  semantic: {
    income: '#00C896',
    expense: '#FF6B6B',
    transfer: '#4A90E2',
    warning: '#FFB800',
    success: '#4ECDC4',
    error: '#FF4757'
  },

  // Акценты
  accents: {
    primary: '#4A90E2',
    secondary: '#007AFF',
    fabButton: '#6C5CE7'
  },

  // Категории
  categories: {
    entertainment: '#4ECDC4',
    food: '#FF6B6B',
    shopping: '#FFB800',
    transport: '#4A90E2',
    vacation: '#FF8A65',
    salary: '#00C896'
  }
} as const;

// Цветовые палитры для Mantine
const incomeGreen: MantineColorsTuple = [
  '#e6faf7',
  '#ccf5ed',
  '#99ebe0',
  '#4ddcc9',
  '#00c896',
  '#00b587',
  '#00a278',
  '#008f69',
  '#007c5a',
  '#00694b'
];

const expenseRed: MantineColorsTuple = [
  '#ffe8e8',
  '#ffd1d1',
  '#ffa3a3',
  '#ff7575',
  '#ff6b6b',
  '#ff5252',
  '#ff3939',
  '#e62929',
  '#cc1f1f',
  '#b31515'
];

const accentBlue: MantineColorsTuple = [
  '#e7f3ff',
  '#d0e7ff',
  '#a3cfff',
  '#75b7ff',
  '#4a90e2',
  '#3a7bc8',
  '#2a66ae',
  '#1a5194',
  '#0a3c7a',
  '#002760'
];

const fabPurple: MantineColorsTuple = [
  '#f0edff',
  '#e1dbff',
  '#c3b7ff',
  '#a593ff',
  '#6c5ce7',
  '#5a4fcf',
  '#4842b7',
  '#36359f',
  '#242887',
  '#121b6f'
];

// Светлая тема Mantine
export const lightTheme = createTheme({
  primaryColor: 'accent-blue',

  colors: {
    dark: [
      '#f8f9fa', // dark.0 - lightest
      '#e9ecef', // dark.1
      '#dee2e6', // dark.2
      '#ced4da', // dark.3
      '#adb5bd', // dark.4
      '#6c757d', // dark.5
      '#495057', // dark.6
      '#343a40', // dark.7
      '#212529', // dark.8
      '#000000', // dark.9 - darkest
    ],
    'income-green': incomeGreen,
    'expense-red': expenseRed,
    'accent-blue': accentBlue,
    'fab-purple': fabPurple,
  },

  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  fontFamilyMonospace: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace',

  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '24px',
  },

  lineHeights: {
    xs: '1.2',
    sm: '1.4',
    md: '1.4',
    lg: '1.6',
    xl: '1.6',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },

  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
  },

  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    sm: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
    md: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
    lg: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
    xl: '0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22)',
  },

  other: {
    colorScheme: 'light',
    designColors: lightThemeColors,
  },
});

// Темная тема Mantine
export const darkTheme = createTheme({
  primaryColor: 'accent-blue',

  colors: {
    dark: [
      '#C1C2C5', // dark.0
      '#A6A7AB', // dark.1
      '#909296', // dark.2
      '#5C5F66', // dark.3
      '#373A40', // dark.4
      '#2C2E33', // dark.5
      '#25262B', // dark.6
      '#1A1B1E', // dark.7
      '#141517', // dark.8
      '#000000', // dark.9
    ],
    'income-green': incomeGreen,
    'expense-red': expenseRed,
    'accent-blue': accentBlue,
    'fab-purple': fabPurple,
  },

  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  fontFamilyMonospace: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace',

  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '24px',
  },

  lineHeights: {
    xs: '1.2',
    sm: '1.4',
    md: '1.4',
    lg: '1.6',
    xl: '1.6',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },

  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
  },

  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4)',
    sm: '0 3px 6px rgba(0, 0, 0, 0.4), 0 3px 6px rgba(0, 0, 0, 0.5)',
    md: '0 10px 20px rgba(0, 0, 0, 0.5), 0 6px 6px rgba(0, 0, 0, 0.6)',
    lg: '0 14px 28px rgba(0, 0, 0, 0.6), 0 10px 10px rgba(0, 0, 0, 0.7)',
    xl: '0 19px 38px rgba(0, 0, 0, 0.7), 0 15px 12px rgba(0, 0, 0, 0.8)',
  },

  other: {
    colorScheme: 'dark',
    designColors: darkThemeColors,
  },
});

// Функция для получения цветов дизайн-системы
export const getDesignColors = (colorScheme: 'light' | 'dark') => {
  return colorScheme === 'light' ? lightThemeColors : darkThemeColors;
};

// Функция для получения темы Mantine
export const getMantineTheme = (colorScheme: 'light' | 'dark') => {
  return colorScheme === 'light' ? lightTheme : darkTheme;
};

// Функция для определения темы на основе Telegram WebApp
export const detectTelegramTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';

  try {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) return 'light';

    // Используем colorScheme из Telegram WebApp
    if (webApp.colorScheme === 'dark') return 'dark';
    if (webApp.colorScheme === 'light') return 'light';

    // Fallback: определяем по themeParams
    const themeParams = webApp.themeParams;
    if (themeParams?.bg_color && typeof themeParams.bg_color === 'string') {
      const bgColor = themeParams.bg_color.toLowerCase();
      // Темные цвета фона в Telegram
      if (bgColor === '#17212b' || bgColor === '#0f0f0f' || bgColor === '#1e1e1e') {
        return 'dark';
      }
    }

    return 'light';
  } catch (error) {
    console.warn('Failed to detect Telegram theme:', error);
    return 'light';
  }
};
