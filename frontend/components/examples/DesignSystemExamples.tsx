'use client';

import {
    designColors,
    getAmountColor,
    getAmountInputStyles,
    getCardStyles,
    getCategoryIconStyles,
    getFabStyles,
    getProgressStyles,
    getTabStyles,
    type AmountType,
    type CategoryType
} from '@/lib/design-system';
import { ActionIcon, Card, Group, Stack, Text } from '@mantine/core';
import { IconCar, IconGamepad, IconPlus, IconSalad, IconShoppingBag } from '@tabler/icons-react';

/**
 * Пример использования дизайн-системы в компонентах
 * Показывает правильное применение стилей из budget-app-design-system.json
 */
export function DesignSystemExamples() {
  return (
    <div style={{ backgroundColor: designColors.backgrounds.primary, minHeight: '100vh', padding: '16px' }}>
      <Stack gap="lg">
        
        {/* 1. Карточки с правильными стилями */}
        <Text size="lg" style={{ color: designColors.text.primary, marginBottom: '16px' }}>
          1. Карточки (Cards)
        </Text>
        
        <Group gap="md">
          {/* Основная карточка */}
          <Card style={getCardStyles()}>
            <Text style={{ color: designColors.text.primary }}>Основная карточка</Text>
            <Text size="sm" style={{ color: designColors.text.secondary }}>
              Background: #2A2A2A, radius: 16px
            </Text>
          </Card>
          
          {/* Карточка баланса */}
          <Card style={{ ...getCardStyles(), padding: '24px 20px' }}>
            <Text size="sm" style={{ color: designColors.text.secondary }}>Общий баланс</Text>
            <Text 
              size="xl" 
              style={{ 
                color: designColors.text.primary, 
                fontSize: '32px', 
                fontWeight: 300,
                margin: '8px 0' 
              }}
            >
              ₽15,240
            </Text>
          </Card>
        </Group>

        {/* 2. Иконки категорий */}
        <Text size="lg" style={{ color: designColors.text.primary, marginBottom: '16px' }}>
          2. Иконки категорий
        </Text>
        
        <Group gap="md">
          <CategoryIcon category="entertainment" icon={<IconGamepad size={20} />} />
          <CategoryIcon category="food" icon={<IconSalad size={20} />} />
          <CategoryIcon category="shopping" icon={<IconShoppingBag size={20} />} />
          <CategoryIcon category="transport" icon={<IconCar size={20} />} />
        </Group>

        {/* 3. Суммы с правильными цветами */}
        <Text size="lg" style={{ color: designColors.text.primary, marginBottom: '16px' }}>
          3. Суммы (Amounts)
        </Text>
        
        <Group gap="lg">
          <AmountDisplay amount={5000} type="income" label="Доход" />
          <AmountDisplay amount={-3200} type="expense" label="Расход" />
          <AmountDisplay amount={1800} type="neutral" label="Остаток" />
        </Group>

        {/* 4. Progress bars */}
        <Text size="lg" style={{ color: designColors.text.primary, marginBottom: '16px' }}>
          4. Progress bars
        </Text>
        
        <Stack gap="sm">
          <CategoryProgress category="food" value={75} label="Еда" spent={7500} budget={10000} />
          <CategoryProgress category="entertainment" value={45} label="Развлечения" spent={2250} budget={5000} />
          <CategoryProgress category="transport" value={90} label="Транспорт" spent={4500} budget={5000} />
        </Stack>

        {/* 5. Табы для типов транзакций */}
        <Text size="lg" style={{ color: designColors.text.primary, marginBottom: '16px' }}>
          5. Табы (Income/Expense/Transfer)
        </Text>
        
        <TransactionTabs />

        {/* 6. Amount Input */}
        <Text size="lg" style={{ color: designColors.text.primary, marginBottom: '16px' }}>
          6. Amount Input
        </Text>
        
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <input 
            type="text" 
            placeholder="0" 
            style={getAmountInputStyles(false)}
            defaultValue="2,500"
          />
          <Text size="sm" style={{ color: designColors.text.secondary, marginTop: '8px' }}>
            Expense input (красный)
          </Text>
        </div>

        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <input 
            type="text" 
            placeholder="0" 
            style={getAmountInputStyles(true)}
            defaultValue="5,000"
          />
          <Text size="sm" style={{ color: designColors.text.secondary, marginTop: '8px' }}>
            Income input (зеленый)
          </Text>
        </div>

      </Stack>

      {/* FAB кнопка */}
      <ActionIcon style={getFabStyles()}>
        <IconPlus size={24} />
      </ActionIcon>
    </div>
  );
}

// Компонент иконки категории
interface CategoryIconProps {
  category: CategoryType;
  icon: React.ReactNode;
}

function CategoryIcon({ category, icon }: CategoryIconProps) {
  const styles = getCategoryIconStyles(category);
  
  return (
    <div>
      <div style={styles.container}>
        <div style={styles.icon}>
          {icon}
        </div>
      </div>
      <Text size="xs" style={{ color: designColors.text.secondary, textAlign: 'center', marginTop: '4px' }}>
        {category}
      </Text>
    </div>
  );
}

// Компонент отображения суммы
interface AmountDisplayProps {
  amount: number;
  type: AmountType;
  label: string;
}

function AmountDisplay({ amount, type, label }: AmountDisplayProps) {
  const color = getAmountColor(type);
  const sign = type === 'income' ? '+' : type === 'expense' ? '-' : '';
  
  return (
    <div style={{ textAlign: 'center' }}>
      <Text size="sm" style={{ color: designColors.text.secondary }}>
        {label}
      </Text>
      <Text 
        size="lg" 
        style={{ 
          color,
          fontWeight: 600,
          marginTop: '4px'
        }}
      >
        {sign}₽{Math.abs(amount).toLocaleString()}
      </Text>
    </div>
  );
}

// Компонент progress bar категории
interface CategoryProgressProps {
  category: CategoryType;
  value: number;
  label: string;
  spent: number;
  budget: number;
}

function CategoryProgress({ category, value, label, spent, budget }: CategoryProgressProps) {
  const progressStyles = getProgressStyles(category);
  
  return (
    <div>
      <Group justify="space-between" mb="xs">
        <Group gap="sm">
          <div style={getCategoryIconStyles(category).container}>
            <div style={getCategoryIconStyles(category).icon}>
              {getCategoryIcon(category)}
            </div>
          </div>
          <Text style={{ color: designColors.text.primary }}>{label}</Text>
        </Group>
        <Text size="sm" style={{ color: designColors.text.secondary }}>
          ₽{spent.toLocaleString()} / ₽{budget.toLocaleString()}
        </Text>
      </Group>
      
      <div style={progressStyles.track}>
        <div 
          style={{
            ...progressStyles.fill,
            width: `${value}%`,
            transition: 'width 300ms ease'
          }}
        />
      </div>
    </div>
  );
}

// Компонент табов
function TransactionTabs() {
  const [activeTab, setActiveTab] = React.useState<'income' | 'expense' | 'transfer'>('expense');
  
  return (
    <Group gap={0}>
      {(['income', 'expense', 'transfer'] as const).map((tab) => (
        <button
          key={tab}
          style={getTabStyles(tab, activeTab === tab)}
          onClick={() => setActiveTab(tab)}
        >
          {tab === 'income' ? 'Доход' : tab === 'expense' ? 'Расход' : 'Перевод'}
        </button>
      ))}
    </Group>
  );
}

// Вспомогательная функция для иконок категорий
function getCategoryIcon(category: CategoryType) {
  const iconMap = {
    entertainment: <IconGamepad size={16} />,
    food: <IconSalad size={16} />,
    shopping: <IconShoppingBag size={16} />,
    transport: <IconCar size={16} />,
    vacation: <IconPlus size={16} />,
    salary: <IconPlus size={16} />
  };
  
  return iconMap[category] || <IconPlus size={16} />;
}

// Добавляем React import
import React from 'react';
