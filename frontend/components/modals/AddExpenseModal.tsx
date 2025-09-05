'use client';

import { useTelegram } from '@/components/providers/TelegramProvider'
import { useGroupMembers } from '@/hooks/useApi'
import { designColors, getAmountInputStyles } from '@/lib/design-system'
import { Box, Button, Checkbox, LoadingOverlay, Modal, Select, Stack, Text, TextInput } from '@mantine/core'
import { IconChevronDown, IconPencil } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'

interface AddExpenseModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (expense: {
    amount: number;
    description: string;
    category: string;
    participants: string[];
    splitType: 'equal' | 'custom';
  }) => void;
  groupId?: number | null;
  editingExpense?: {
    id: number;
    description: string;
    amount: number;
    category: string;
  } | null;
  mode?: 'create' | 'edit';
}

export function AddExpenseModal({ opened, onClose, onSubmit, groupId, editingExpense, mode = 'create' }: AddExpenseModalProps) {
    
  const telegram = useTelegram();
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('food');
  const [participantMode, setParticipantMode] = useState<'all' | 'select'>('all');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  // Получаем участников группы
  const { members: groupMembers, loading: membersLoading } = useGroupMembers(groupId || 0);

  const categories = [
    { value: 'food', label: 'Еда', emoji: '🍔', color: '#FF6B6B' },
    { value: 'transport', label: 'Транспорт', emoji: '🚗', color: '#4A90E2' },
    { value: 'entertainment', label: 'Развлечения', emoji: '🎮', color: '#4ECDC4' },
    { value: 'shopping', label: 'Покупки', emoji: '🛍️', color: '#FFB800' },
    { value: 'vacation', label: 'Отпуск', emoji: '✈️', color: '#FF8A65' },
    { value: 'accommodation', label: 'Жилье', emoji: '🏠', color: '#9C27B0' },
    { value: 'health', label: 'Здоровье', emoji: '💊', color: '#4CAF50' },
    { value: 'other', label: 'Другое', emoji: '📦', color: '#757575' }
  ];

  // Преобразуем участников группы в нужный формат с useMemo для предотвращения пересоздания
  const participants = useMemo(() => {
    console.log('useMemo participants triggered:', {
      groupMembers,
      groupMembersLength: groupMembers?.length,
      telegramUserId: telegram.userId
    });
    
    const result = groupMembers?.map((member: any) => {
      // Проверяем наличие member данных
      if (!member) {
        console.warn('Empty member:', member);
        return null;
      }
      
      // API возвращает данные напрямую в member, а не в member.user
      const participantData = {
        id: member.user_id?.toString() || member.id?.toString() || '',
        name: member.display_name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Unknown User',
        isYou: member.user_id === telegram.userId || member.telegram_id === telegram.userId,
        telegram_id: member.telegram_id || member.user_id
      };
      
      // Проверяем что ID не пустой
      if (!participantData.id || participantData.id === '') {
        console.warn('Participant has empty ID:', member);
        return null;
      }
      
      console.log('Participant data:', participantData);
      return participantData;
    }).filter(Boolean) || []; // Фильтруем null значения
    
    console.log('Final participants:', result);
    return result;
  }, [groupMembers, telegram.userId]);

  const selectedCategory = categories.find(cat => cat.value === category);

  // Сброс формы при открытии и инициализация при редактировании
  useEffect(() => {
    if (opened) {
      if (mode === 'edit' && editingExpense) {
        // Инициализация для редактирования
        setAmount(editingExpense.amount.toString());
        setDescription(editingExpense.description);
        setCategory(editingExpense.category);
        setParticipantMode('all');
        setSelectedParticipants([]);
      } else {
        // Сброс для создания
        setAmount('');
        setDescription('');
        setCategory('food');
        setParticipantMode('all');
        setSelectedParticipants([]);
      }
    }
  }, [opened, mode, editingExpense]);

  // Автоматически выбираем всех участников при смене режима на "все"
  useEffect(() => {
    if (!opened) return; // Не запускаем если модальное окно закрыто
    
    console.log('useEffect triggered:', {
      participantMode,
      participantsLength: participants.length,
      participants: participants.map(p => p ? ({ id: p.id, name: p.name }) : null).filter(Boolean)
    });
    
    if (participantMode === 'all' && participants.length > 0) {
      const allParticipantIds = participants.map((p: any) => p.id);
      console.log('Setting all participants:', allParticipantIds);
      setSelectedParticipants(allParticipantIds);
    } else if (participantMode === 'select') {
      // При переключении на "Выбрать участников" очищаем выбор
      console.log('Clearing selection for manual mode');
      setSelectedParticipants([]);
    }
  }, [participantMode, participants, opened]);

  const handleParticipantToggle = (participantId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const handleSubmit = () => {
    const numAmount = parseFloat(amount.replace(',', '.'));
    
    console.log('HandleSubmit called:', {
      participantMode,
      selectedParticipants,
      participantsLength: participants.length,
      amount: numAmount,
      description: description.trim()
    });
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    if (!description.trim()) {
      return;
    }

    if (selectedParticipants.length === 0) {
      return;
    }

    onSubmit({
      amount: numAmount,
      description: description.trim(),
      category,
      participants: selectedParticipants,
      splitType: 'equal'
    });

    handleClose();
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setCategory('food');
    setParticipantMode('all');
    setSelectedParticipants([]);
    onClose();
  };

  const formatAmount = (value: string) => {
    // Удаляем все символы кроме цифр, точки и запятой
    const cleaned = value.replace(/[^\d.,]/g, '');
    
    // Заменяем запятую на точку для единообразия
    const normalized = cleaned.replace(',', '.');
    
    // Проверяем, что есть только одна точка
    const parts = normalized.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return normalized;
  };

  const handleAmountChange = (value: string) => {
    const formatted = formatAmount(value);
    setAmount(formatted);
  };

  if (membersLoading) {
    return (
      <Modal opened={opened} onClose={onClose} title="Добавить расход" size="lg">
        <Stack>
          <Text>Загрузка участников...</Text>
        </Stack>
      </Modal>
    );
  }

  const participantsList = participants.filter((p: any) => p.id !== 'you');

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      centered
      size="lg"
      radius="xl"
      overlayProps={{
        backgroundOpacity: 0.8,
        color: '#000000',
        blur: 2
      }}
      styles={{
        content: {
          backgroundColor: designColors.backgrounds.modalContent,
          border: 'none'
        },
        header: {
          backgroundColor: 'transparent',
          borderBottom: 'none'
        },
        body: {
          padding: 0
        }
      }}
      withCloseButton={false}
    >
      <Box style={{ padding: '24px', position: 'relative' }}>
        {/* Loading Overlay */}
        {membersLoading && <LoadingOverlay visible={true} />}

        {/* Modal Handle */}
        <Box
          style={{
            backgroundColor: '#444444',
            width: '36px',
            height: '4px',
            borderRadius: '2px',
            margin: '0 auto 16px'
          }}
        />

        {/* Title */}
        <Text 
          size="xl"
          ta="center"
          mb="xl"
          style={{ 
            color: designColors.text.primary,
            fontWeight: 600
          }}
        >
          {mode === 'edit' ? '✏️ Редактировать расход' : '💸 Новый расход'}
        </Text>

        {!groupId && (
          <Box mb="lg" p="md" style={{ 
            backgroundColor: designColors.semantic.warning,
            borderRadius: '8px'
          }}>
            <Text size="sm" style={{ color: designColors.text.primary }}>
              ⚠️ Группа не выбрана. Выберите группу для добавления расхода.
            </Text>
          </Box>
        )}

        <Stack gap="lg">
          {/* Amount Input - Large Style */}
          <Box style={{ textAlign: 'center' }}>
            <Box
              style={{
                backgroundColor: 'transparent',
                borderRadius: '12px',
                padding: '16px',
                border: `1px solid ${designColors.text.tertiary}`
              }}
            >
              <TextInput
                value={amount}
                onChange={(e) => handleAmountChange(e.currentTarget.value)}
                placeholder="0"
                variant="unstyled"
                type="number"
                min="0"
                step="0.01"
                styles={{
                  input: {
                    ...getAmountInputStyles(false),
                    border: 'none',
                    backgroundColor: 'transparent'
                  }
                }}
                rightSection={
                  <Text 
                    style={{ 
                      color: designColors.amounts.negative,
                      fontSize: '48px',
                      fontWeight: 300
                    }}
                  >
                    ₽
                  </Text>
                }
              />
            </Box>
          </Box>

          {/* Description */}
          <TextInput
            placeholder="Описание расхода"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            leftSection={<IconPencil size={16} style={{ color: designColors.text.secondary }} />}
            styles={{
              input: {
                backgroundColor: designColors.text.tertiary,
                color: designColors.text.primary,
                border: 'none',
                borderRadius: '8px',
                padding: '12px 16px 12px 44px',
                fontSize: '16px',
                height: '50px'
              }
            }}
            maxLength={100}
          />

          {/* Category Selector */}
          <Select
            value={category}
            onChange={(value) => value && setCategory(value)}
            data={categories.map(cat => ({ value: cat.value, label: cat.label }))}
            leftSection={
              <span style={{ fontSize: '20px' }}>
                {selectedCategory?.emoji}
              </span>
            }
            rightSection={<IconChevronDown size={16} />}
            styles={{
              input: {
                backgroundColor: selectedCategory?.color || designColors.text.tertiary,
                color: designColors.text.primary,
                border: 'none',
                borderRadius: '12px',
                fontWeight: 500
              }
            }}
          />

          {/* Participants Section */}
          {participants.length > 0 && (
            <Stack gap="md">
              <Text 
                size="md"
                style={{ 
                  color: designColors.text.primary,
                  fontWeight: 600
                }}
              >
                👥 Кто участвует?
              </Text>
              
              <Box
                style={{
                  backgroundColor: designColors.backgrounds.cards,
                  borderRadius: '12px',
                  padding: '12px'
                }}
              >
                <Stack gap="xs">
                  <Checkbox
                    checked={participantMode === 'all'}
                    onChange={() => setParticipantMode('all')}
                    label={
                      <Text style={{ color: designColors.text.primary }}>
                        ✅ Все участники ({participants.length} человек{participants.length >= 5 ? '' : participants.length === 1 ? '' : 'а'})
                      </Text>
                    }
                    styles={{
                      input: {
                        backgroundColor: participantMode === 'all' ? designColors.semantic.success : 'transparent',
                        borderColor: designColors.semantic.success
                      }
                    }}
                  />
                  <Checkbox
                    checked={participantMode === 'select'}
                    onChange={() => setParticipantMode('select')}
                    label={
                      <Text style={{ color: designColors.text.primary }}>
                        🎯 Выбрать участников
                      </Text>
                    }
                    styles={{
                      input: {
                        backgroundColor: participantMode === 'select' ? designColors.semantic.success : 'transparent',
                        borderColor: designColors.semantic.success
                      }
                    }}
                  />
                </Stack>
                
                {participantMode === 'select' && (
                  <Box mt="md">
                    <Stack gap="xs">
                      {participants.map((participant: any) => (
                        <Checkbox
                          key={participant.id}
                          checked={selectedParticipants.includes(participant.id)}
                          onChange={() => handleParticipantToggle(participant.id)}
                          label={
                            <Text style={{ color: designColors.text.primary }}>
                              {participant.name}
                              {participant.isYou && ' (вы)'}
                            </Text>
                          }
                          styles={{
                            input: {
                              backgroundColor: selectedParticipants.includes(participant.id) ? designColors.semantic.success : 'transparent',
                              borderColor: designColors.semantic.success
                            }
                          }}
                        />
                      ))}
                    </Stack>
                    
                    <Text size="sm" mt="xs" style={{ color: designColors.text.secondary }}>
                      Выбрано участников: {selectedParticipants.length}
                    </Text>
                  </Box>
                )}
              </Box>
            </Stack>
          )}

          {/* Action Button */}
          <Button 
            size="lg"
            radius="md"
            style={{
              backgroundColor: (amount && description && groupId) ? designColors.accents.fabButton : designColors.text.tertiary,
              color: designColors.text.primary
            }}
            onClick={handleSubmit}
            disabled={!amount || !description || !groupId || membersLoading}
          >
            {mode === 'edit' ? 'Сохранить изменения' : 'Добавить расход'}
          </Button>

          {/* Cancel Button */}
          <Button 
            variant="subtle"
            color="gray"
            onClick={handleClose}
          >
            Отмена
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
} 