'use client';

import { designColors } from '@/lib/design-system';
import { Box, Button, Group, Modal, Radio, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconMail, IconMessageCircle, IconPhone, IconShield } from '@tabler/icons-react';
import { useState } from 'react';

interface TransferConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recipient: {
    name: string;
    amount: number;
    details: string[];
  };
}

export function TransferConfirmationModal({ 
  opened, 
  onClose, 
  onConfirm, 
  recipient 
}: TransferConfirmationModalProps) {
    
  const [confirmationMethod, setConfirmationMethod] = useState<'sms' | 'telegram' | 'chat'>('chat');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0
    }).format(amount) + ' ₽';
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
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
      <Box style={{ padding: '24px' }}>
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
          💳 Подтвердить перевод
        </Text>

        <Stack gap="lg">
          {/* Transfer Details */}
          <Box
            style={{
              backgroundColor: designColors.backgrounds.cards,
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center'
            }}
          >
            <Text 
              size="lg"
              mb="xs"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              {recipient.name}
            </Text>
            <Text 
              style={{ 
                color: designColors.semantic.transfer,
                fontSize: '32px',
                fontWeight: 300,
                margin: '8px 0'
              }}
            >
              {formatCurrency(recipient.amount)}
            </Text>
            
            <Text 
              size="sm"
              style={{ 
                color: designColors.text.secondary,
                marginTop: '12px'
              }}
            >
              За: {recipient.details.join(', ')}
            </Text>
          </Box>

          {/* Security Section */}
          <Stack gap="md">
            <Group gap="sm" align="center">
              <IconShield size={20} style={{ color: designColors.semantic.success }} />
              <Text 
                size="md"
                style={{ 
                  color: designColors.text.primary,
                  fontWeight: 600
                }}
              >
                🔒 Подтверждение получателя
              </Text>
            </Group>
            
            <Box
              style={{
                backgroundColor: designColors.backgrounds.cards,
                borderRadius: '12px',
                padding: '16px'
              }}
            >
              <Stack gap="sm">
                <Radio
                  value="sms"
                  checked={confirmationMethod === 'sms'}
                  onChange={() => setConfirmationMethod('sms')}
                  label={
                    <Group gap="sm">
                      <IconPhone size={16} style={{ color: designColors.text.secondary }} />
                      <Text style={{ color: designColors.text.primary }}>
                        📱 SMS-код на +7 999 ***-**-67
                      </Text>
                    </Group>
                  }
                />
                
                <Radio
                  value="telegram"
                  checked={confirmationMethod === 'telegram'}
                  onChange={() => setConfirmationMethod('telegram')}
                  label={
                    <Group gap="sm">
                      <IconMail size={16} style={{ color: designColors.text.secondary }} />
                      <Text style={{ color: designColors.text.primary }}>
                        📧 Уведомление в Telegram
                      </Text>
                    </Group>
                  }
                />
                
                <Radio
                  value="chat"
                  checked={confirmationMethod === 'chat'}
                  onChange={() => setConfirmationMethod('chat')}
                  label={
                    <Group gap="sm">
                      <IconMessageCircle size={16} style={{ color: designColors.text.secondary }} />
                      <Text style={{ color: designColors.text.primary }}>
                        ✅ Подтверждение в чате
                      </Text>
                    </Group>
                  }
                />
              </Stack>
            </Box>
          </Stack>

          {/* Action Buttons */}
          <Stack gap="md">
            <Button 
              size="lg"
              radius="md"
              style={{
                backgroundColor: designColors.accents.fabButton,
                color: designColors.text.primary
              }}
              onClick={handleConfirm}
            >
              Отправить перевод
            </Button>

            <Button 
              variant="subtle"
              color="gray"
              size="lg"
              onClick={onClose}
              style={{
                backgroundColor: designColors.text.tertiary,
                color: designColors.text.primary
              }}
            >
              Отмена
            </Button>
          </Stack>

          {/* Warning */}
          <Box
            style={{
              backgroundColor: designColors.semantic.warning + '20',
              border: `1px solid ${designColors.semantic.warning}`,
              borderRadius: '12px',
              padding: '16px'
            }}
          >
            <Group gap="sm" align="flex-start">
              <IconAlertTriangle 
                size={20} 
                style={{ 
                  color: designColors.semantic.warning,
                  marginTop: '2px'
                }}
              />
              <Stack gap="xs">
                <Text 
                  size="sm"
                  style={{ 
                    color: designColors.semantic.warning,
                    fontWeight: 500
                  }}
                >
                  ⚠️ После отправки средства будут списаны с вашего баланса
                </Text>
                <Text 
                  size="xs"
                  style={{ color: designColors.semantic.warning }}
                >
                  Убедитесь, что данные получателя указаны правильно. Отменить перевод будет невозможно.
                </Text>
              </Stack>
            </Group>
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
} 