'use client';

import { designColors } from '@/lib/design-system';
import { useGroupMembers } from '@/hooks/useApi';
import { useCurrentGroup } from '@/stores/useAppStore';
import { 
  Box, 
  Button, 
  Group, 
  Modal, 
  NumberInput, 
  Select, 
  Stack, 
  Text, 
  TextInput,
  Loader
} from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { useState, useMemo } from 'react';

interface NewTransferModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: { toUserId: number; amount: number; description: string }) => void;
}

export function NewTransferModal({ opened, onClose, onSubmit }: NewTransferModalProps) {
  const currentGroup = useCurrentGroup();
  const { members, loading: membersLoading } = useGroupMembers(currentGroup?.group_id || 0);
  
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Фильтруем участников, исключая текущего пользователя
  const availableRecipients = useMemo(() => {
    if (!members) return [];
    
    return members
      .filter(member => member.user_id !== currentGroup?.user_id) // Исключаем текущего пользователя
      .map(member => ({
        value: member.user_id.toString(),
        label: `${member.profile_first_name || member.first_name} ${member.profile_last_name || member.last_name || ''}`.trim()
      }));
  }, [members, currentGroup?.user_id]);

  const handleSubmit = async () => {
    if (!selectedUserId || !amount || amount <= 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        toUserId: parseInt(selectedUserId),
        amount: amount,
        description: description || 'Перевод средств'
      });
      
      // Сброс формы
      setSelectedUserId('');
      setAmount('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error creating transfer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = selectedUserId && amount && amount > 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Новый перевод"
      size="md"
      centered
      styles={{
        title: {
          color: designColors.text.primary,
          fontWeight: 600
        },
        header: {
          backgroundColor: designColors.backgrounds.primary,
          borderBottom: `1px solid ${designColors.text.tertiary}`
        },
        body: {
          backgroundColor: designColors.backgrounds.primary
        }
      }}
    >
      <Stack gap="lg">
        {membersLoading ? (
          <Box style={{ textAlign: 'center', padding: '20px' }}>
            <Loader size="md" />
            <Text style={{ color: designColors.text.secondary, marginTop: '10px' }}>
              Загрузка участников...
            </Text>
          </Box>
        ) : (
          <>
            {/* Выбор получателя */}
            <Box>
              <Text 
                size="sm" 
                style={{ 
                  color: designColors.text.primary, 
                  fontWeight: 500,
                  marginBottom: '8px'
                }}
              >
                Кому отправить
              </Text>
              <Select
                placeholder="Выберите получателя"
                data={availableRecipients}
                value={selectedUserId}
                onChange={setSelectedUserId}
                searchable
                clearable
                styles={{
                  input: {
                    backgroundColor: designColors.backgrounds.secondary,
                    border: `1px solid ${designColors.text.tertiary}`,
                    color: designColors.text.primary,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    textOverflow: 'unset',
                    overflow: 'visible',
                    '&::placeholder': {
                      color: designColors.text.secondary
                    }
                  },
                  dropdown: {
                    backgroundColor: designColors.backgrounds.secondary,
                    border: `1px solid ${designColors.text.tertiary}`,
                    color: 'white'
                  },
                  item: {
                    color: 'white !important',
                    backgroundColor: designColors.backgrounds.secondary,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    textOverflow: 'unset',
                    overflow: 'visible',
                    '&[data-selected]': {
                      backgroundColor: designColors.accents.fabButton,
                      color: 'white !important'
                    },
                    '&[data-hovered]': {
                      backgroundColor: designColors.backgrounds.primary,
                      color: 'white !important'
                    }
                  },
                  searchInput: {
                    backgroundColor: designColors.backgrounds.secondary,
                    border: `1px solid ${designColors.text.tertiary}`,
                    color: 'white !important',
                    '&::placeholder': {
                      color: designColors.text.secondary
                    }
                  },
                  separator: {
                    borderColor: designColors.text.tertiary
                  },
                  separatorLabel: {
                    color: designColors.text.secondary
                  },
                  label: {
                    color: 'white !important'
                  },
                  option: {
                    color: 'white !important'
                  }
                }}
              />
            </Box>

            {/* Сумма перевода */}
            <Box>
              <Text 
                size="sm" 
                style={{ 
                  color: designColors.text.primary, 
                  fontWeight: 500,
                  marginBottom: '8px'
                }}
              >
                Сумма (₽)
              </Text>
              <NumberInput
                placeholder="0"
                value={amount}
                onChange={setAmount}
                min={0}
                precision={2}
                step={100}
                styles={{
                  input: {
                    backgroundColor: designColors.backgrounds.secondary,
                    border: `1px solid ${designColors.text.tertiary}`,
                    color: designColors.text.primary,
                    '&::placeholder': {
                      color: designColors.text.secondary
                    }
                  },
                  control: {
                    borderColor: designColors.text.tertiary,
                    color: designColors.text.primary,
                    '&:hover': {
                      backgroundColor: designColors.backgrounds.primary
                    }
                  }
                }}
              />
            </Box>

            {/* Описание */}
            <Box>
              <Text 
                size="sm" 
                style={{ 
                  color: designColors.text.primary, 
                  fontWeight: 500,
                  marginBottom: '8px'
                }}
              >
                Описание (необязательно)
              </Text>
              <TextInput
                placeholder="Например: За обед, За такси..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                styles={{
                  input: {
                    backgroundColor: designColors.backgrounds.secondary,
                    border: `1px solid ${designColors.text.tertiary}`,
                    color: designColors.text.primary,
                    '&::placeholder': {
                      color: designColors.text.secondary
                    }
                  }
                }}
              />
            </Box>

            {/* Кнопки */}
            <Group gap="md" style={{ marginTop: '10px' }}>
              <Button
                fullWidth
                size="md"
                leftSection={<IconSend size={16} />}
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                loading={isSubmitting}
                styles={{
                  root: {
                    backgroundColor: designColors.accents.fabButton,
                    color: designColors.text.primary,
                    border: 'none',
                    borderRadius: '12px',
                    height: '48px'
                  },
                  root: {
                    backgroundColor: isFormValid ? designColors.accents.fabButton : designColors.backgrounds.secondary,
                    color: isFormValid ? designColors.text.primary : designColors.text.secondary,
                    border: 'none',
                    borderRadius: '12px',
                    height: '48px',
                    opacity: isFormValid ? 1 : 0.6
                  }
                }}
              >
                Отправить перевод
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}
