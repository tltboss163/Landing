'use client';

import { Card, Group, Text, Badge, Button, Stack } from '@mantine/core';
import { useDesignColors } from '@/lib/design-system';
import { useTelegram } from '@/components/providers/TelegramProvider';
import { IconSun, IconMoon, IconWallet, IconUsers } from '@tabler/icons-react';

export const ThemeExample = () => {
  const colors = useDesignColors();
  const { colorScheme } = useTelegram();

  return (
    <Stack gap="md" p="md">
      <Card 
        style={{ 
          backgroundColor: colors.backgrounds.cards,
          border: `1px solid ${colors.text.tertiary}20`
        }}
      >
        <Group justify="space-between" mb="md">
          <Text 
            size="lg" 
            fw={600}
            style={{ color: colors.text.primary }}
          >
            Пример темизации
          </Text>
          <Badge 
            color={colorScheme === 'dark' ? 'blue' : 'gray'}
            leftSection={colorScheme === 'dark' ? <IconMoon size={12} /> : <IconSun size={12} />}
          >
            {colorScheme === 'dark' ? 'Темная' : 'Светлая'} тема
          </Badge>
        </Group>

        <Stack gap="sm">
          <Group>
            <IconWallet 
              size={20} 
              style={{ color: colors.accents.primary }} 
            />
            <Text style={{ color: colors.text.secondary }}>
              Основной акцент: {colors.accents.primary}
            </Text>
          </Group>

          <Group>
            <IconUsers 
              size={20} 
              style={{ color: colors.semantic.success }} 
            />
            <Text style={{ color: colors.text.secondary }}>
              Успех: {colors.semantic.success}
            </Text>
          </Group>

          <Group justify="space-between">
            <Text style={{ color: colors.amounts.positive }}>
              +1,500 ₽
            </Text>
            <Text style={{ color: colors.amounts.negative }}>
              -800 ₽
            </Text>
          </Group>

          <Button 
            style={{ 
              backgroundColor: colors.accents.fabButton,
              color: colors.text.primary
            }}
            fullWidth
          >
            Кнопка в стиле темы
          </Button>
        </Stack>
      </Card>

      <Card 
        style={{ 
          backgroundColor: colors.backgrounds.secondary,
          border: `1px solid ${colors.text.tertiary}20`
        }}
      >
        <Text 
          size="sm" 
          style={{ color: colors.text.tertiary }}
        >
          Фон карточки: {colors.backgrounds.secondary}
        </Text>
        <Text 
          size="sm" 
          style={{ color: colors.text.tertiary }}
        >
          Основной фон: {colors.backgrounds.primary}
        </Text>
      </Card>
    </Stack>
  );
};
