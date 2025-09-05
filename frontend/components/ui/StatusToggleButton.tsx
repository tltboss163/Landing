'use client';

import { designColors } from '@/lib/design-system';
import { useAppStore } from '@/stores/useAppStore';
import { Button, Group, Loader, Text } from '@mantine/core';
import { IconCheckbox, IconLock, IconPlaylist } from '@tabler/icons-react';
import { useState } from 'react';

interface StatusToggleButtonProps {
  groupId: number;
  groupStatus: string;
  userRole: string;
  onStatusChange?: (newStatus: string) => void;
}

export function StatusToggleButton({ 
  groupId, 
  groupStatus, 
  userRole, 
  onStatusChange 
}: StatusToggleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { completeCollection, resumeCollection } = useAppStore();

  // Check if user can manage collection status
  const canManageStatus = userRole === 'admin' || userRole === 'organizer';
  const isCompleted = groupStatus.toLowerCase() === 'completed'; // Support both cases
  const isActive = groupStatus.toLowerCase() === 'active'; // Support both cases

  const handleToggleStatus = async () => {
    if (!canManageStatus || isLoading) return;

    setIsLoading(true);
    try {
      let success = false;
      
      if (isActive) {
        // Complete the collection
        success = await completeCollection(groupId);
        if (success && onStatusChange) {
          onStatusChange('COMPLETED'); // ИСПРАВЛЕНИЕ: верхний регистр
        }
      } else if (isCompleted) {
        // Resume the collection
        success = await resumeCollection(groupId);
        if (success && onStatusChange) {
          onStatusChange('ACTIVE'); // ИСПРАВЛЕНИЕ: верхний регистр
        }
      }
    } catch (error) {
      console.error('Failed to toggle collection status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // If user cannot manage status, show only status indicator
  if (!canManageStatus) {
    return (
      <Group gap="xs">
        {isCompleted ? (
          <IconLock size={16} color={designColors.semantic.warning} />
        ) : (
          <IconPlaylist size={16} color={designColors.semantic.success} />
        )}
        <Text size="sm" color={isCompleted ? 'orange' : 'green'}>
          {isCompleted ? 'Сбор завершён' : 'Сбор активен'}
        </Text>
      </Group>
    );
  }

  // Admin/organizer can toggle status
  return (
    <Button
      variant={isCompleted ? 'light' : 'filled'}
      color={isCompleted ? 'green' : 'orange'}
      leftSection={
        isLoading ? (
          <Loader size={16} />
        ) : isCompleted ? (
          <IconPlaylist size={16} />
        ) : (
          <IconCheckbox size={16} />
        )
      }
      onClick={handleToggleStatus}
      disabled={isLoading}
      size="sm"
    >
      {isLoading 
        ? 'Обновление...' 
        : isCompleted 
          ? 'Возобновить сбор'
          : 'Завершить сбор'
      }
    </Button>
  );
} 