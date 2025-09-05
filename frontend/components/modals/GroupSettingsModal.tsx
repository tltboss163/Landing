'use client';

import { api } from '@/lib/api';
import { designColors } from '@/lib/design-system';
import { Alert, Button, Divider, Group, Modal, Stack, Text, TextInput, Textarea } from '@mantine/core';
import { IconAlertCircle, IconSettings } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  currentGroupName: string;
  currentGroupStatus?: string;
  userRole?: string;
  onUpdateSuccess: () => void;
}



export function GroupSettingsModal({ 
  isOpen, 
  onClose, 
  groupId, 
  currentGroupName,
  currentGroupStatus = 'active',
  userRole = 'participant',
  onUpdateSuccess 
}: GroupSettingsModalProps) {
  const [groupName, setGroupName] = useState(currentGroupName);
  const [groupRules, setGroupRules] = useState('');
  const [originalRules, setOriginalRules] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupStatus, setGroupStatus] = useState(currentGroupStatus);

  const loadGroupRules = useCallback(async () => {
    setIsLoadingRules(true);
    try {
      const result = await api.group.getRules(groupId);
      if (result.success && result.data) {
        const rules = result.data.rules || '';
        setGroupRules(rules);
        setOriginalRules(rules);
      } else {
        setGroupRules('');
        setOriginalRules('');
      }
    } catch (error) {
      console.error('Error loading group rules:', error);
      setGroupRules('');
      setOriginalRules('');
    } finally {
      setIsLoadingRules(false);
    }
  }, [groupId]);

  // Load group rules when modal opens
  useEffect(() => {
    if (isOpen) {
      setGroupName(currentGroupName);
      setGroupStatus(currentGroupStatus);
      setError(null);
      loadGroupRules();
    }
  }, [isOpen, currentGroupName, currentGroupStatus, loadGroupRules]);

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      setError('Название группы не может быть пустым');
      return;
    }

    const nameChanged = groupName.trim() !== currentGroupName;
    const rulesChanged = groupRules !== originalRules;

    if (!nameChanged && !rulesChanged) {
      onClose();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare update data with only changed fields
      const updateData: { name?: string; rules?: string } = {};
      
      if (nameChanged) {
        updateData.name = groupName.trim();
      }
      
      if (rulesChanged) {
        updateData.rules = groupRules;
      }

      // Update group and rules in one call
      const result = await api.group.update(groupId, updateData);
      if (!result.success) {
        setError(result.message || 'Ошибка при обновлении группы');
        return;
      }

      onUpdateSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating group:', error);
      setError('Ошибка при обновлении группы');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setGroupName(currentGroupName);
    setGroupRules(originalRules);
    setError(null);
    onClose();
  };

  const hasChanges = groupName.trim() !== currentGroupName || groupRules !== originalRules;

  return (
    <Modal
      opened={isOpen}
      onClose={handleCancel}
      title={
        <Group gap="xs">
          <IconSettings size={20} style={{ color: designColors.accents.fabButton }} />
          <Text 
            size="lg" 
            style={{ 
              color: designColors.text.primary,
              fontWeight: 600 
            }}
          >
            Настройки группы
          </Text>
        </Group>
      }
      size="md"
      radius="lg"
      styles={{
        content: {
          backgroundColor: designColors.backgrounds.cards,
          border: 'none'
        },
        header: {
          backgroundColor: designColors.backgrounds.cards,
          borderBottom: `1px solid ${designColors.text.tertiary}30`
        },
        title: {
          fontWeight: 600
        }
      }}
    >
      <Stack gap="md">
        {error && (
          <Alert 
            icon={<IconAlertCircle size="1rem" />} 
            title="Ошибка" 
            color="red"
            styles={{
              root: {
                backgroundColor: '#ff444410',
                border: '1px solid #ff444430'
              },
              title: {
                color: '#ff4444'
              },
              message: {
                color: '#ff4444'
              }
            }}
          >
            {error}
          </Alert>
        )}

        <TextInput
          label="Название группы"
          placeholder="Введите название группы"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          disabled={isLoading}
          styles={{
            label: {
              color: designColors.text.primary,
              marginBottom: '8px'
            },
            input: {
              backgroundColor: designColors.backgrounds.secondary,
              borderColor: designColors.text.tertiary,
              color: designColors.text.primary,
              '&:focus': {
                borderColor: designColors.accents.fabButton
              }
            }
          }}
        />

        <Textarea
          label="Правила группы"
          placeholder="Введите правила группы (необязательно)"
          value={groupRules}
          onChange={(e) => setGroupRules(e.target.value)}
          disabled={isLoading || isLoadingRules}
          minRows={4}
          maxRows={8}
          styles={{
            label: {
              color: designColors.text.primary,
              marginBottom: '8px'
            },
            input: {
              backgroundColor: designColors.backgrounds.secondary,
              borderColor: designColors.text.tertiary,
              color: designColors.text.primary,
              '&:focus': {
                borderColor: designColors.accents.fabButton
              }
            }
          }}
        />

        <Divider />

        <Group justify="flex-end" gap="sm" mt="lg">
          <Button
            variant="subtle"
            onClick={handleCancel}
            disabled={isLoading}
            styles={{
              root: {
                color: designColors.text.secondary,
                '&:hover': {
                  backgroundColor: `${designColors.text.secondary}10`
                }
              }
            }}
          >
            Отмена
          </Button>
          
          <Button
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!hasChanges || isLoadingRules}
            styles={{
              root: {
                backgroundColor: designColors.accents.fabButton,
                '&:hover': {
                  backgroundColor: `${designColors.accents.fabButton}dd`
                },
                '&:disabled': {
                  backgroundColor: designColors.text.tertiary,
                  color: designColors.text.secondary
                }
              }
            }}
          >
            Сохранить
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
} 