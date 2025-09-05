import { createTheme, MantineColorsTuple } from '@mantine/core';

// Цвета из дизайн-системы budget-app-design-system.json
const incomeGreen: MantineColorsTuple = [
  '#e6faf7',
  '#ccf5ed',
  '#99ebe0',
  '#4ddcc9',
  '#00c896', // основной цвет income
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
  '#ff6b6b', // основной цвет expense
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
  '#4a90e2', // основной accent цвет
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
  '#6c5ce7', // основной FAB цвет
  '#5a4fcf',
  '#4842b7',
  '#36359f',
  '#242887',
  '#121b6f'
];

// Категории цветов
const entertainmentTeal: MantineColorsTuple = [
  '#e6fffe',
  '#ccfffc',
  '#99fff9',
  '#4dffef',
  '#4ecdc4', // entertainment
  '#3fb8b1',
  '#30a39e',
  '#218e8b',
  '#127978',
  '#036465'
];

const shoppingOrange: MantineColorsTuple = [
  '#fff8e6',
  '#fff1cc',
  '#ffe399',
  '#ffd54d',
  '#ffb800', // shopping
  '#e6a600',
  '#cc9400',
  '#b38200',
  '#997000',
  '#805e00'
];

export const theme = createTheme({
  // Основная цветовая схема - dark theme
  primaryColor: 'accent-blue',

  // Все цвета в одном объекте
  colors: {
    dark: [
      '#C1C2C5', // dark.0
      '#A6A7AB', // dark.1
      '#909296', // dark.2
      '#5C5F66', // dark.3 - tertiary text (#666666)
      '#373A40', // dark.4
      '#2C2E33', // dark.5 - cards background (#2A2A2A)
      '#25262B', // dark.6 - secondary background (#1A1A1A)
      '#1A1B1E', // dark.7
      '#141517', // dark.8
      '#000000', // dark.9 - primary background
    ],
    'income-green': incomeGreen,
    'expense-red': expenseRed,
    'accent-blue': accentBlue,
    'fab-purple': fabPurple,
    'entertainment-teal': entertainmentTeal,
    'shopping-orange': shoppingOrange,
  },

  // Typography из дизайн-системы
  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  fontFamilyMonospace: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace',

  fontSizes: {
    xs: '12px',    // xs из дизайн-системы
    sm: '14px',    // sm
    md: '16px',    // base
    lg: '18px',    // lg
    xl: '24px',    // xl
  },

  lineHeights: {
    xs: '1.2',   // tight
    sm: '1.4',   // normal
    md: '1.4',   // normal
    lg: '1.6',   // relaxed
    xl: '1.6',   // relaxed
  },

  // Spacing из дизайн-системы
  spacing: {
    xs: '4px',   // xs
    sm: '8px',   // sm (base)
    md: '16px',  // md
    lg: '24px',  // lg
    xl: '32px',  // xl
  },

  // Border radius из дизайн-системы
  radius: {
    xs: '4px',    // xs
    sm: '8px',    // sm
    md: '12px',   // md
    lg: '16px',   // lg
    xl: '20px',   // xl
  },

  // Shadows из дизайн-системы
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.2)',
    sm: '0 2px 8px rgba(0, 0, 0, 0.3)', // card shadow
    md: '0 4px 12px rgba(108, 92, 231, 0.4)', // fab shadow
    lg: '0 8px 32px rgba(0, 0, 0, 0.5)', // modal shadow
    xl: '0 12px 48px rgba(0, 0, 0, 0.6)',
  },

  // Компоненты с настройками из дизайн-системы
  components: {
    // Cards - background #2A2A2A, borderRadius 16px, padding 16px
    Card: {
      defaultProps: {
        radius: 'lg', // 16px
        padding: 'md', // 16px
        shadow: 'sm', // card shadow
        bg: 'dark.5', // #2A2A2A
      },
    },

    // Paper - аналогично Cards
    Paper: {
      defaultProps: {
        radius: 'lg',
        p: 'md',
        bg: 'dark.5',
      },
    },

    // Button - основные кнопки
    Button: {
      defaultProps: {
        radius: 'md', // 12px
        size: 'md',
      },
      styles: {
        root: {
          fontWeight: 500,
        },
      },
    },

    // ActionIcon - для FAB и иконочных кнопок
    ActionIcon: {
      defaultProps: {
        radius: 'md',
        size: 'lg',
      },
      styles: {
        // FAB стили
        root: {
          '&[data-variant="fab"]': {
            backgroundColor: '#6C5CE7',
            color: '#FFFFFF',
            width: '56px',
            height: '56px',
            borderRadius: '28px',
            boxShadow: '0 4px 12px rgba(108, 92, 231, 0.4)',
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            '&:hover': {
              backgroundColor: '#5A4FCF',
              transform: 'scale(1.05)',
              boxShadow: '0 6px 16px rgba(108, 92, 231, 0.6)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
          },
          // Category icon containers
          '&[data-variant="category"]': {
            backgroundColor: '#333333',
            color: '#FFFFFF',
            borderRadius: '12px',
            width: '40px',
            height: '40px',
          },
        },
      },
    },

    // Input fields
    TextInput: {
      defaultProps: {
        radius: 'md',
        size: 'md',
      },
    },

    NumberInput: {
      defaultProps: {
        radius: 'md',
        size: 'md',
      },
      styles: {
        // Для amount input - большой размер, цвет expense
        input: {
          '&[data-variant="amount"]': {
            fontSize: '48px',
            fontWeight: 300,
            textAlign: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#FF6B6B', // expense red по умолчанию
          },
          '&[data-variant="amount"][data-positive="true"]': {
            color: '#00C896', // income green для положительных
          },
        },
      },
    },

    // Modal - настройки из дизайн-системы
    Modal: {
      defaultProps: {
        centered: true,
        radius: 'xl', // 20px
        overlayProps: {
          backgroundOpacity: 0.8,
          color: '#000000',
          blur: 2,
        },
      },
      styles: {
        content: {
          backgroundColor: '#1E1E1E', // modal content background
        },
      },
    },

    // Progress bars
    Progress: {
      defaultProps: {
        radius: 'xs', // 3px для budget progress
        size: 'sm',
      },
      styles: {
        root: {
          backgroundColor: '#333333', // track color
        },
      },
    },

    // Notifications
    Notification: {
      defaultProps: {
        radius: 'md',
      },
    },

    // Navigation
    NavLink: {
      styles: {
        root: {
          color: '#A0A0A0', // secondary text
          '&:hover': {
            backgroundColor: '#333333',
          },
          '&[data-active]': {
            color: '#6C5CE7', // fab purple для активного состояния
            backgroundColor: 'transparent',
          },
        },
      },
    },

    // Tabs - для переключения income/expense/transfer
    Tabs: {
      styles: {
        tab: {
          backgroundColor: 'transparent',
          color: '#A0A0A0',
          borderBottom: '2px solid transparent',
          fontWeight: 500,
          '&:hover': {
            backgroundColor: 'transparent',
          },
          '&[data-active]': {
            color: '#FFFFFF',
            borderBottomColor: 'currentColor',
          },
          // Специальные варианты для income/expense/transfer
          '&[data-variant="income"][data-active]': {
            color: '#00C896',
            borderBottomColor: '#00C896',
          },
          '&[data-variant="expense"][data-active]': {
            color: '#FF6B6B',
            borderBottomColor: '#FF6B6B',
          },
          '&[data-variant="transfer"][data-active]': {
            color: '#4A90E2',
            borderBottomColor: '#4A90E2',
          },
        },
      },
    },
  },

  // Breakpoints (сохраняем стандартные)
  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
  },
});