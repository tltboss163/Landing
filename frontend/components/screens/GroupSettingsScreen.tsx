'use client';

import { designColors } from '@/lib/design-system'
import { ActionIcon, Box, Button, Card, Divider, Group, Modal, Select, Stack, Switch, Text, TextInput } from '@mantine/core'
import {
  IconCheck,
  IconCopy,
  IconEdit,
  IconMail,
  IconPhone,
  IconTrash,
  IconUserPlus
} from '@tabler/icons-react'
import { useState } from 'react'

interface GroupSettingsScreenProps {
  onBackToProfile: () => void;
  onInviteUser: (inviteData: { method: 'link' | 'phone' | 'email'; value: string }) => void;
  onRemoveUser: (userId: string) => void;
  onChangeUserRole: (userId: string, role: 'organizer' | 'participant') => void;
}

export function GroupSettingsScreen({ 
  onBackToProfile, 
  onInviteUser, 
  onRemoveUser, 
  onChangeUserRole 
}: GroupSettingsScreenProps) {
  const [inviteModalOpened, setInviteModalOpened] = useState(false);
  const [inviteMethod, setInviteMethod] = useState<'link' | 'phone' | 'email'>('link');
  const [inviteValue, setInviteValue] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // Mock данные группы
  const groupData = {
    id: '1',
    name: 'Поездка в горы',
    description: 'Совместная поездка в горы на выходные',
    currency: 'RUB',
    status: 'active', // active | completed | archived
    createdAt: '15 мая 2024',
    totalMembers: 5,
    totalExpenses: 127500,
    inviteLink: 'https://t.me/BudgetMiniBot?start=group_abc123',
    settings: {
      allowAddExpenses: true,
      allowEditExpenses: false,
      allowDeleteExpenses: false,
      requireApproval: true,
      autoSplitExpenses: true,
      notifications: true
    }
  };



  const groupMembers = [
    { 
      id: '1', 
      name: 'Александр Иванов', 
      role: 'organizer' as const,
      phone: '+7 999 123-45-67',
      email: 'alex@example.com',
      joinedAt: '15 мая 2024',
      totalSpent: 32500,
      isYou: true
    },
    { 
      id: '2', 
      name: 'Мария Сидорова', 
      role: 'participant' as const,
      phone: '+7 999 234-56-78',
      joinedAt: '16 мая 2024',
      totalSpent: 28900,
      isYou: false
    },
    { 
      id: '3', 
      name: 'Сергей Козлов', 
      role: 'participant' as const,
      phone: '+7 999 345-67-89',
      joinedAt: '17 мая 2024',
      totalSpent: 26100,
      isYou: false
    },
    { 
      id: '4', 
      name: 'Анна Волкова', 
      role: 'participant' as const,
      phone: '+7 999 456-78-90',
      joinedAt: '18 мая 2024',
      totalSpent: 24500,
      isYou: false
    },
    { 
      id: '5', 
      name: 'Дмитрий Лебедев', 
      role: 'participant' as const,
      phone: '+7 999 567-89-01',
      joinedAt: '19 мая 2024',
      totalSpent: 15500,
      isYou: false
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0
    }).format(amount) + ' ₽';
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(groupData.inviteLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleInviteSubmit = () => {
    if (!inviteValue.trim()) return;
    
    onInviteUser({
      method: inviteMethod,
      value: inviteValue.trim()
    });
    
    setInviteValue('');
    setInviteModalOpened(false);
  };

  return (
    <Box
      style={{
        backgroundColor: designColors.backgrounds.primary,
        minHeight: '100vh',
        paddingBottom: '100px'
      }}
    >
      {/* Header */}
      <Group justify="space-between" align="center" p="md" pt="xl">
        <Text 
          size="xl"
          style={{ 
            color: designColors.text.primary,
            fontWeight: 600
          }}
        >
          ⚙️ Настройки группы
        </Text>
        
        <Button
          variant="subtle"
          size="sm"
          onClick={onBackToProfile}
          style={{
            color: designColors.text.secondary
          }}
        >
          Назад
        </Button>
      </Group>

      <Stack gap="lg" p="md">
        {/* Group Info */}
        <Card
          radius="lg"
          p="lg"
          style={{
            backgroundColor: designColors.backgrounds.cards,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Stack gap="xs">
                <Text 
                  size="xl"
                  style={{ 
                    color: designColors.text.primary,
                    fontWeight: 600
                  }}
                >
                  {groupData.name}
                </Text>
                <Text 
                  size="sm"
                  style={{ color: designColors.text.secondary }}
                >
                  {groupData.description}
                </Text>
              </Stack>
              
              <ActionIcon
                size="lg"
                variant="subtle"
                color="gray"
              >
                <IconEdit size={20} style={{ color: designColors.text.secondary }} />
              </ActionIcon>
            </Group>
            
            <Group gap="lg">
              <Box style={{ textAlign: 'center' }}>
                <Text 
                  size="lg"
                  style={{ 
                    color: designColors.accents.fabButton,
                    fontWeight: 600
                  }}
                >
                  {groupData.totalMembers}
                </Text>
                <Text 
                  size="xs"
                  style={{ color: designColors.text.secondary }}
                >
                  Участников
                </Text>
              </Box>
              
              <Box style={{ textAlign: 'center' }}>
                <Text 
                  size="lg"
                  style={{ 
                    color: designColors.amounts.negative,
                    fontWeight: 600
                  }}
                >
                  {formatCurrency(groupData.totalExpenses)}
                </Text>
                <Text 
                  size="xs"
                  style={{ color: designColors.text.secondary }}
                >
                  Всего трат
                </Text>
              </Box>
              
              <Box style={{ textAlign: 'center' }}>
                <Text 
                  size="sm"
                  style={{ 
                    color: designColors.text.primary,
                    fontWeight: 600
                  }}
                >
                  {groupData.currency}
                </Text>
                <Text 
                  size="xs"
                  style={{ color: designColors.text.secondary }}
                >
                  Валюта
                </Text>
              </Box>
            </Group>
            

          </Stack>
        </Card>

        {/* Members Management */}
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text 
              size="lg"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              👥 Участники группы
            </Text>
            
            <Button
              size="sm"
              variant="light"
              leftSection={<IconUserPlus size={16} />}
              onClick={() => setInviteModalOpened(true)}
              styles={{
                root: {
                  backgroundColor: designColors.semantic.success + '20',
                  color: designColors.semantic.success,
                  paddingLeft: '40px' // Увеличиваем левый отступ для иконки
                }
              }}
            >
              Пригласить
            </Button>
          </Group>
          
          <Card
            radius="lg"
            p={0}
            style={{
              backgroundColor: designColors.backgrounds.cards,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden'
            }}
          >
            {groupMembers.map((member, index) => (
              <Box
                key={member.id}
                style={{
                  padding: '16px',
                  borderBottom: index < groupMembers.length - 1 ? 
                    `1px solid ${designColors.text.tertiary}` : 'none'
                }}
              >
                <Group justify="space-between" align="center">
                  <Group gap="sm">
                    <Box
                      style={{
                        fontSize: '24px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: designColors.text.tertiary,
                        borderRadius: '12px'
                      }}
                    >
                      {member.role === 'organizer' ? '👑' : '👤'}
                    </Box>
                    
                    <Stack gap={2}>
                      <Group gap="xs">
                        <Text 
                          size="md"
                          style={{ 
                            color: designColors.text.primary,
                            fontWeight: 500
                          }}
                        >
                          {member.name}
                        </Text>
                        {member.isYou && (
                          <Text 
                            size="xs"
                            style={{ 
                              color: designColors.accents.fabButton,
                              fontWeight: 500
                            }}
                          >
                            (Вы)
                          </Text>
                        )}
                      </Group>
                      
                      <Text 
                        size="sm"
                        style={{ color: designColors.text.secondary }}
                      >
                        {member.role === 'organizer' ? 'Организатор' : 'Участник'} • {member.joinedAt}
                      </Text>
                      
                      <Text 
                        size="xs"
                        style={{ color: designColors.text.tertiary }}
                      >
                        Потратил: {formatCurrency(member.totalSpent)}
                      </Text>
                    </Stack>
                  </Group>
                  
                  {!member.isYou && (
                    <Group gap="xs">
                      <Select
                        value={member.role}
                        onChange={(value) => value && onChangeUserRole(member.id, value as any)}
                        data={[
                          { value: 'participant', label: 'Участник' },
                          { value: 'organizer', label: 'Организатор' }
                        ]}
                        size="xs"
                        styles={{
                          input: {
                            backgroundColor: designColors.text.tertiary,
                            color: designColors.text.primary,
                            border: 'none',
                            fontSize: '12px'
                          }
                        }}
                      />
                      
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={() => onRemoveUser(member.id)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  )}
                </Group>
              </Box>
            ))}
          </Card>
        </Stack>

        {/* Invite Link */}
        <Card
          radius="lg"
          p="md"
          style={{
            backgroundColor: designColors.backgrounds.cards,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Text 
            size="md"
            mb="md"
            style={{ 
              color: designColors.text.primary,
              fontWeight: 600
            }}
          >
            🔗 Ссылка для приглашения
          </Text>
          
          <Group gap="sm">
            <TextInput
              value={groupData.inviteLink}
              readOnly
              style={{ flex: 1 }}
              styles={{
                input: {
                  backgroundColor: designColors.text.tertiary,
                  color: designColors.text.primary,
                  border: 'none'
                }
              }}
            />
            
            <Button
              size="sm"
              variant="light"
              leftSection={
                linkCopied ? 
                  <IconCheck size={16} style={{ color: designColors.semantic.success }} /> :
                  <IconCopy size={16} />
              }
              onClick={handleCopyLink}
              style={{
                backgroundColor: linkCopied ? designColors.semantic.success + '20' : designColors.text.tertiary,
                color: linkCopied ? designColors.semantic.success : designColors.text.primary
              }}
            >
              {linkCopied ? 'Скопировано' : 'Копировать'}
            </Button>
          </Group>
        </Card>

        {/* Group Settings */}
        <Card
          radius="lg"
          p="md"
          style={{
            backgroundColor: designColors.backgrounds.cards,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Text 
            size="md"
            mb="md"
            style={{ 
              color: designColors.text.primary,
              fontWeight: 600
            }}
          >
            🔧 Настройки группы
          </Text>
          
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Stack gap={2}>
                <Text style={{ color: designColors.text.primary }}>
                  Разрешить добавление расходов
                </Text>
                <Text size="xs" style={{ color: designColors.text.secondary }}>
                  Участники могут добавлять новые расходы
                </Text>
              </Stack>
              <Switch 
                checked={groupData.settings.allowAddExpenses}
                styles={{
                  track: {
                    backgroundColor: groupData.settings.allowAddExpenses ? designColors.semantic.success : undefined
                  }
                }}
              />
            </Group>
            
            <Divider style={{ borderColor: designColors.text.tertiary }} />
            
            <Group justify="space-between" align="center">
              <Stack gap={2}>
                <Text style={{ color: designColors.text.primary }}>
                  Требовать подтверждение
                </Text>
                <Text size="xs" style={{ color: designColors.text.secondary }}>
                  Расходы требуют подтверждения организатора
                </Text>
              </Stack>
              <Switch 
                checked={groupData.settings.requireApproval}
                styles={{
                  track: {
                    backgroundColor: groupData.settings.requireApproval ? designColors.semantic.success : undefined
                  }
                }}
              />
            </Group>
            
            <Divider style={{ borderColor: designColors.text.tertiary }} />
            
            <Group justify="space-between" align="center">
              <Stack gap={2}>
                <Text style={{ color: designColors.text.primary }}>
                  Автоматическое разделение
                </Text>
                <Text size="xs" style={{ color: designColors.text.secondary }}>
                  Расходы автоматически делятся поровну
                </Text>
              </Stack>
              <Switch 
                checked={groupData.settings.autoSplitExpenses}
                styles={{
                  track: {
                    backgroundColor: groupData.settings.autoSplitExpenses ? designColors.semantic.success : undefined
                  }
                }}
              />
            </Group>
          </Stack>
        </Card>
      </Stack>

      {/* Invite Modal */}
      <Modal
        opened={inviteModalOpened}
        onClose={() => setInviteModalOpened(false)}
        title="Пригласить участника"
        centered
        styles={{
          content: {
            backgroundColor: designColors.backgrounds.modalContent
          },
          header: {
            backgroundColor: 'transparent'
          }
        }}
      >
        <Stack gap="md">
          <Select
            label="Способ приглашения"
            value={inviteMethod}
            onChange={(value) => value && setInviteMethod(value as any)}
            data={[
              { value: 'link', label: '🔗 Ссылка' },
              { value: 'phone', label: '📱 Телефон' },
              { value: 'email', label: '📧 Email' }
            ]}
            styles={{
              input: {
                backgroundColor: designColors.text.tertiary,
                color: designColors.text.primary,
                border: 'none'
              }
            }}
          />
          
          {inviteMethod !== 'link' && (
            <TextInput
              label={inviteMethod === 'phone' ? 'Номер телефона' : 'Email адрес'}
              placeholder={inviteMethod === 'phone' ? '+7 999 123-45-67' : 'user@example.com'}
              value={inviteValue}
              onChange={(e) => setInviteValue(e.currentTarget.value)}
              leftSection={
                inviteMethod === 'phone' ? 
                  <IconPhone size={16} style={{ color: designColors.text.secondary }} /> :
                  <IconMail size={16} style={{ color: designColors.text.secondary }} />
              }
              styles={{
                input: {
                  backgroundColor: designColors.text.tertiary,
                  color: designColors.text.primary,
                  border: 'none'
                }
              }}
            />
          )}
          
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={() => setInviteModalOpened(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleInviteSubmit}
              disabled={inviteMethod !== 'link' && !inviteValue.trim()}
              style={{
                backgroundColor: designColors.accents.fabButton,
                color: designColors.text.primary
              }}
            >
              Пригласить
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
} 