'use client';

import { designColors } from '@/lib/design-system';
import { Box, Button, Center, Group, Loader, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

interface LoadingStateProps {
  loading: boolean;
  error: string | null;
  data: unknown; // заменяю any на unknown
  onRetry?: () => void;
  loadingText?: string;
  emptyText?: string;
}

export function LoadingState({
  loading,
  error,
  data,
  onRetry,
  loadingText = 'Загрузка...',
  emptyText = 'Нет данных'
}: LoadingStateProps) {
  if (loading) {
    return (
      <Center style={{ height: '200px' }}>
        <Stack gap="md" align="center">
          <Loader 
            size="lg" 
            style={{ color: designColors.accents.fabButton }} 
          />
          <Text 
            size="sm" 
            style={{ color: designColors.text.secondary }}
          >
            {loadingText}
          </Text>
        </Stack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center style={{ height: '200px' }}>
        <Stack gap="md" align="center">
          <Text 
            size="sm" 
            style={{ color: '#ff4444', textAlign: 'center' }}
          >
            {error}
          </Text>
          {onRetry && (
            <Button
              size="sm"
              onClick={onRetry}
              styles={{
                root: {
                  backgroundColor: designColors.accents.fabButton,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: `${designColors.accents.fabButton}dd`
                  }
                }
              }}
            >
              Повторить
            </Button>
          )}
        </Stack>
      </Center>
    );
  }

  if (!data) {
    return (
      <Center style={{ height: '200px' }}>
        <Text 
          size="sm" 
          style={{ color: designColors.text.secondary }}
        >
          {emptyText}
        </Text>
      </Center>
    );
  }

  return null;
}

// Skeleton loader component
export function SkeletonLoader({ height = 60, count = 3 }: { height?: number; count?: number }) {
  return (
    <Stack gap="md">
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          style={{
            height: `${height}px`,
            backgroundColor: designColors.text.tertiary,
            borderRadius: '12px',
            animation: 'pulse 1.5s infinite'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </Stack>
  );
}

// Error boundary component
export function ErrorBoundary({ 
  error, 
  onRetry, 
  title = 'Что-то пошло не так' 
}: { 
  error: Error | null; 
  onRetry?: () => void;
  title?: string;
}) {
  if (!error) return null;

  return (
    <Box
      style={{
        backgroundColor: designColors.semantic.error + '10',
        border: `1px solid ${designColors.semantic.error}`,
        borderRadius: '12px',
        padding: '16px',
        margin: '16px 0'
      }}
    >
      <Stack gap="md">
        <Group gap="sm">
          <IconAlertCircle size={20} style={{ color: designColors.semantic.error }} />
          <Text 
            size="md" 
            style={{ 
              color: designColors.semantic.error,
              fontWeight: 500
            }}
          >
            {title}
          </Text>
        </Group>
        
        <Text 
          size="sm" 
          style={{ color: designColors.semantic.error }}
        >
          {error.message || 'Произошла неизвестная ошибка'}
        </Text>
        
        {onRetry && (
          <Button
            variant="light"
            size="sm"
            leftSection={<IconRefresh size={14} />}
            onClick={onRetry}
            styles={{
              root: {
                backgroundColor: designColors.semantic.error + '20',
                color: designColors.semantic.error,
                paddingLeft: '40px' // Увеличиваем левый отступ для иконки
              }
            }}
          >
            Попробовать снова
          </Button>
        )}
      </Stack>
    </Box>
  );
} 