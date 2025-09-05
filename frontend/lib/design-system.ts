// Утилиты для работы с дизайн-системой Budget Mini Bot
// Основано на budget-app-design-system.json

// Цвета из дизайн-системы
export const designColors = {
  // Основные фоны
  backgrounds: {
    primary: '#000000',
    secondary: '#1A1A1A', 
    cards: '#2A2A2A',
    modalOverlay: 'rgba(0, 0, 0, 0.8)',
    modalContent: '#1E1E1E'
  },
  
  // Текст
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0A0',
    tertiary: '#666666',
    currency: '#FFFFFF'
  },
  
  // Суммы
  amounts: {
    positive: '#00C896', // income
    negative: '#FF6B6B', // expense
    neutral: '#FFFFFF'
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

// Типографика
export const designTypography = {
  fontFamily: 'SF Pro Display',
  sizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px'
  },
  weights: {
    light: '300',
    normal: '400', 
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  lineHeights: {
    tight: '1.2',
    normal: '1.4',
    relaxed: '1.6'
  }
} as const;

// Spacing
export const designSpacing = {
  base: '8px',
  xs: '4px',
  sm: '8px', 
  md: '16px',
  lg: '24px',
  xl: '32px',
  cardPadding: '16px',
  screenPadding: '16px'
} as const;

// Border radius
export const designRadius = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px'
} as const;

// Shadows
export const designShadows = {
  card: '0 2px 8px rgba(0, 0, 0, 0.3)',
  fab: '0 4px 12px rgba(108, 92, 231, 0.4)',
  modal: '0 8px 32px rgba(0, 0, 0, 0.5)'
} as const;

// Анимации
export const designAnimations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  easing: {
    default: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  transitions: {
    cardHover: 'all 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    buttonPress: 'all 100ms ease-out',
    modalSlide: 'all 300ms cubic-bezier(0.4, 0.0, 0.2, 1)'
  }
} as const;

// Утилиты для применения стилей

/**
 * Получить цвет категории по названию
 */
export function getCategoryColor(category: keyof typeof designColors.categories): string {
  return designColors.categories[category] || designColors.categories.entertainment;
}

/**
 * Получить цвет для суммы в зависимости от типа
 */
export function getAmountColor(type: 'income' | 'expense' | 'neutral'): string {
  switch (type) {
    case 'income':
      return designColors.amounts.positive;
    case 'expense':
      return designColors.amounts.negative;
    default:
      return designColors.amounts.neutral;
  }
}

/**
 * Стили для иконки категории (контейнер + иконка)
 */
export function getCategoryIconStyles(category: keyof typeof designColors.categories) {
  return {
    container: {
      backgroundColor: getCategoryColor(category),
      borderRadius: designRadius.md,
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    icon: {
      color: designColors.text.primary,
      fontSize: '20px'
    }
  };
}

/**
 * Стили для карточки
 */
export function getCardStyles() {
  return {
    backgroundColor: designColors.backgrounds.cards,
    borderRadius: designRadius.lg,
    padding: designSpacing.md,
    boxShadow: designShadows.card,
    border: 'none'
  };
}

/**
 * Стили для FAB кнопки
 */
export function getFabStyles() {
  return {
    backgroundColor: designColors.accents.fabButton,
    color: designColors.text.primary,
    width: '56px',
    height: '56px',
    borderRadius: '28px',
    boxShadow: designShadows.fab,
    position: 'fixed' as const,
    bottom: '24px',
    right: '24px',
    zIndex: 1000,
    border: 'none',
    cursor: 'pointer',
    transition: designAnimations.transitions.buttonPress
  };
}

/**
 * Стили для input с большой суммой
 */
export function getAmountInputStyles(isPositive: boolean = false) {
  return {
    color: isPositive ? designColors.amounts.positive : designColors.amounts.negative,
    fontSize: designTypography.sizes['3xl'],
    fontWeight: designTypography.weights.light,
    textAlign: 'center' as const,
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    width: '100%'
  };
}

/**
 * Стили для модального окна
 */
export function getModalStyles() {
  return {
    overlay: {
      backgroundColor: designColors.backgrounds.modalOverlay,
      backdropFilter: 'blur(2px)'
    },
    content: {
      backgroundColor: designColors.backgrounds.modalContent,
      borderRadius: `${designRadius.xl} ${designRadius.xl} 0 0`,
      padding: designSpacing.lg,
      minHeight: '60vh',
      border: 'none'
    },
    handle: {
      backgroundColor: '#444444',
      width: '36px',
      height: '4px',
      borderRadius: '2px',
      margin: `0 auto ${designSpacing.md}`
    }
  };
}

/**
 * Стили для progress bar
 */
export function getProgressStyles(category?: keyof typeof designColors.categories) {
  return {
    track: {
      backgroundColor: '#333333',
      height: '6px',
      borderRadius: '3px'
    },
    fill: {
      backgroundColor: category ? getCategoryColor(category) : designColors.accents.primary,
      height: '6px',
      borderRadius: '3px'
    }
  };
}

/**
 * Стили для табов (income/expense/transfer)
 */
export function getTabStyles(variant: 'income' | 'expense' | 'transfer', isActive: boolean) {
  const baseStyles = {
    backgroundColor: 'transparent',
    color: designColors.text.secondary,
    borderBottom: '2px solid transparent',
    fontWeight: designTypography.weights.medium,
    padding: '12px 0',
    cursor: 'pointer',
    border: 'none',
    outline: 'none'
  };

  if (!isActive) return baseStyles;

  const activeColors = {
    income: designColors.semantic.income,
    expense: designColors.semantic.expense,
    transfer: designColors.semantic.transfer
  };

  return {
    ...baseStyles,
    color: activeColors[variant],
    borderBottomColor: activeColors[variant]
  };
}

// Типы для TypeScript
export type CategoryType = keyof typeof designColors.categories;
export type AmountType = 'income' | 'expense' | 'neutral';
export type TabVariant = 'income' | 'expense' | 'transfer';

// Экспорт всех констант для прямого использования
export {
    designAnimations as animations, designColors as colors, designRadius as radius,
    designShadows as shadows, designSpacing as spacing, designTypography as typography
};
