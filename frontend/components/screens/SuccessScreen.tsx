'use client';

import { designColors } from '@/lib/design-system';
import { Box, Button, Stack, Text } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

interface SuccessScreenProps {
  firstName: string;
  lastName: string;
  onClose: () => void;
}

export function SuccessScreen({ firstName, lastName, onClose }: SuccessScreenProps) {
  return (
    <Box
      style={{
        backgroundColor: designColors.backgrounds.primary,
        minHeight: '100vh',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Stack gap="xl" align="center" style={{ maxWidth: '400px', width: '100%' }}>
        {/* Success Icon */}
        <Box
          style={{
            backgroundColor: designColors.semantic.success,
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          <IconCheck 
            size={40} 
            style={{ color: designColors.backgrounds.primary }} 
          />
        </Box>

        {/* Success Message */}
        <Stack gap="md" align="center">
          <Text 
            size="xl"
            ta="center"
            style={{ 
              color: designColors.text.primary,
              fontSize: '28px',
              fontWeight: 600
            }}
          >
            ✅ Регистрация завершена!
          </Text>
          
          <Text 
            ta="center"
            style={{ 
              color: designColors.text.secondary,
              fontSize: '16px',
              lineHeight: 1.5
            }}
          >
            Добро пожаловать, {firstName} {lastName}!{'\n'}
            Инструкции отправлены в чат группы
          </Text>
        </Stack>

        {/* Info Card */}
        <Box
          style={{
            backgroundColor: designColors.backgrounds.cards,
            borderRadius: '12px',
            padding: '20px',
            width: '100%',
            marginTop: '20px'
          }}
        >
          <Text 
            size="sm"
            ta="center"
            style={{ 
              color: designColors.text.secondary,
              lineHeight: 1.6
            }}
          >
            📱 Сообщение с инструкциями появится в чате{'\n'}
            и автоматически удалится через 2 минуты
          </Text>
        </Box>

        {/* Close Button */}
        <Button 
          size="lg"
          radius="md"
          fullWidth
          leftSection={<IconX size={20} />}
          onClick={onClose}
          styles={{
            root: {
              backgroundColor: designColors.accents.fabButton,
              color: designColors.text.primary,
              marginTop: '20px',
              height: '50px',
              paddingLeft: '48px' // Увеличиваем левый отступ для иконки
            }
          }}
        >
          Закрыть WebApp
        </Button>

        {/* Additional Info */}
        <Text 
          size="xs"
          ta="center"
          style={{ 
            color: designColors.text.tertiary,
            marginTop: '16px'
          }}
        >
          Вы можете открыть WebApp в любое время{'\n'}
          для удобного управления расходами
        </Text>
      </Stack>
    </Box>
  );
} 