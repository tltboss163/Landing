'use client';

import { designColors } from '@/lib/design-system'
import { Button, Group, Modal, NumberInput, Select, Stack, TextInput } from '@mantine/core'
import { useEffect, useState } from 'react'

interface Expense {
  id: number;
  description: string;
  amount: number;
  category?: string;
}

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onSave: (expenseData: Partial<Expense>) => Promise<void>;
}

const categoryOptions = [
  { value: 'food', label: 'Еда' },
  { value: 'transport', label: 'Транспорт' },
  { value: 'entertainment', label: 'Развлечения' },
  { value: 'shopping', label: 'Покупки' },
  { value: 'utilities', label: 'Коммунальные услуги' },
  { value: 'healthcare', label: 'Здоровье' },
  { value: 'education', label: 'Образование' },
  { value: 'other', label: 'Другое' },
];

export function EditExpenseModal({ isOpen, onClose, expense, onSave }: EditExpenseModalProps) {
    
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('other');
  const [loading, setLoading] = useState(false);

  // Update state when expense changes
  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setAmount(expense.amount);
      setCategory(expense.category || 'other');
    }
  }, [expense]);

  const handleSave = async () => {
    if (!expense || !description.trim() || amount <= 0) return;

    setLoading(true);
    try {
      await onSave({
        id: expense.id,
        description: description.trim(),
        amount,
        category,
      });
      handleClose();
    } catch (error) {
      console.error('Error saving expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDescription('');
    setAmount(0);
    setCategory('other');
    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title="Редактировать расход"
      size="md"
      styles={{
        modal: {
          backgroundColor: designColors.backgrounds.modalContent,
        },
        header: {
          backgroundColor: designColors.backgrounds.modalContent,
          borderBottom: `1px solid ${designColors.text.tertiary}`,
        },
        title: {
          color: designColors.text.primary,
          fontWeight: 600,
        },
        close: {
          color: designColors.text.secondary,
          '&:hover': {
            backgroundColor: designColors.backgrounds.cards,
          },
        },
      }}
    >
      <Stack gap="md">
        <TextInput
          label="Описание"
          placeholder="Введите описание расхода"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          styles={{
            root: {
              backgroundColor: designColors.backgrounds.primary,
              color: designColors.text.primary,
            },
            input: {
              backgroundColor: designColors.backgrounds.secondary,
              borderColor: designColors.text.tertiary,
              color: designColors.text.primary,
              '&:focus': {
                borderColor: designColors.accents.primary,
              },
            },
            label: {
              color: designColors.text.primary,
            },
          }}
        />

        <NumberInput
          label="Сумма"
          placeholder="0"
          value={amount}
          onChange={(value) => setAmount(Number(value) || 0)}
          required
          min={0}
          step={0.01}
          styles={{
            root: {
              backgroundColor: designColors.backgrounds.primary,
              color: designColors.text.primary,
            },
            input: {
              backgroundColor: designColors.backgrounds.secondary,
              borderColor: designColors.text.tertiary,
              color: designColors.text.primary,
              '&:focus': {
                borderColor: designColors.accents.primary,
              },
            },
            label: {
              color: designColors.text.primary,
            },
          }}
        />

        <Select
          label="Категория"
          value={category}
          onChange={(value) => setCategory(value || 'other')}
          data={categoryOptions}
          styles={{
            root: {
              backgroundColor: designColors.backgrounds.primary,
              color: designColors.text.primary,
            },
            input: {
              backgroundColor: designColors.backgrounds.secondary,
              borderColor: designColors.text.tertiary,
              color: designColors.text.primary,
              '&:focus': {
                borderColor: designColors.accents.primary,
              },
            },
            label: {
              color: designColors.text.primary,
            },
            dropdown: {
              backgroundColor: designColors.backgrounds.secondary,
              borderColor: designColors.text.tertiary,
            },
            item: {
              color: designColors.text.primary,
              '&[data-selected]': {
                backgroundColor: designColors.accents.primary,
                color: designColors.text.primary,
              },
              '&:hover': {
                backgroundColor: designColors.backgrounds.cards,
              },
            },
          }}
        />

        <Group justify="flex-end" gap="sm" style={{ marginTop: '16px' }}>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            styles={{
              root: {
                borderColor: designColors.text.tertiary,
                color: designColors.text.secondary,
                '&:hover': {
                  backgroundColor: designColors.backgrounds.cards,
                },
              },
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            loading={loading}
            disabled={!description.trim() || amount <= 0}
            styles={{
              root: {
                backgroundColor: designColors.accents.primary,
                '&:hover': {
                  backgroundColor: designColors.accents.secondary,
                },
                '&:disabled': {
                  backgroundColor: designColors.text.tertiary,
                  color: designColors.text.secondary,
                },
              },
            }}
          >
            Сохранить
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
} 