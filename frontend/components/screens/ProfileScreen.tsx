'use client';

import { designColors } from '@/lib/design-system';
import { ActionIcon, Box, Card, Divider, Group, Stack, Switch, Text } from '@mantine/core';
import {
    IconBell,
    IconChevronRight,
    IconCreditCard,
    IconCrown,
    IconEdit,
    IconLogout,
    IconMail,
    IconPhone,
    IconSettings,
    IconUser,
    IconUsers
} from '@tabler/icons-react';

interface ProfileScreenProps {
  onEditProfile: () => void;
  onGroupSettings: () => void;
  onNotificationSettings: () => void;
  onPaymentSettings: () => void;
  onLogout: () => void;
  user?: {
    first_name: string;
    last_name: string;
    phone_number?: string;
    email?: string;
    avatar_url?: string;
    profile_first_name?: string;
    profile_last_name?: string;
  };
}

export function ProfileScreen({ 
  onEditProfile, 
  onGroupSettings, 
  onNotificationSettings, 
  onPaymentSettings, 
  onLogout,
  user
}: ProfileScreenProps) {

    
  const userProfile = {
    name: user ? `${user.profile_first_name || user.first_name} ${user.profile_last_name || user.last_name}` : 'Александр Иванов',
    phone: user?.phone_number || '+7 999 123-45-67',
    email: user?.email || 'alex.ivanov@example.com',
    role: 'organizer' as 'organizer' | 'participant',
    avatar: user?.avatar_url || '👤',
    joinDate: '15 мая 2024',
    totalExpenses: 45800,
    groupPosition: 'Организатор группы'
  };

  const groupStats = {
    totalMembers: 5,
    totalExpenses: 127500,
    activeDebts: 3,
    completedTrips: 2
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0
    }).format(amount) + ' ₽';
  };

  const MenuButton = ({ 
    icon, 
    title, 
    subtitle, 
    onClick, 
    color = designColors.text.primary,
    rightElement 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onClick: () => void;
    color?: string;
    rightElement?: React.ReactNode;
  }) => (
    <Box
      onClick={onClick}
      style={{
        padding: '16px',
        cursor: 'pointer',
        borderRadius: '12px',
        transition: 'background-color 150ms ease'
      }}
    >
      <Group justify="space-between" align="center">
        <Group gap="sm">
          <Box style={{ color }}>{icon}</Box>
          <Stack gap={2}>
            <Text 
              size="md"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 500
              }}
            >
              {title}
            </Text>
            {subtitle && (
              <Text 
                size="sm"
                style={{ color: designColors.text.secondary }}
              >
                {subtitle}
              </Text>
            )}
          </Stack>
        </Group>
        {rightElement || <IconChevronRight size={16} style={{ color: designColors.text.tertiary }} />}
      </Group>
    </Box>
  );

  return (
    <Box
      style={{
        backgroundColor: designColors.backgrounds.primary,
        minHeight: '100vh',
        paddingBottom: '100px' // Space for bottom navigation
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
          👤 Профиль
        </Text>
        
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          onClick={onEditProfile}
        >
          <IconEdit size={20} style={{ color: designColors.text.secondary }} />
        </ActionIcon>
      </Group>

      <Stack gap="lg" p="md">
        {/* User Profile Card */}
        <Card
          radius="lg"
          p="lg"
          style={{
            backgroundColor: designColors.backgrounds.cards,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Group gap="md" align="flex-start">
            {/* Avatar */}
            {userProfile.avatar && userProfile.avatar !== '👤' ? (
              <Box
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundImage: `url(${userProfile.avatar})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '20px',
                  border: `2px solid ${designColors.accents.fabButton}`
                }}
              />
            ) : (
              <Box
                style={{
                  fontSize: '48px',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: designColors.text.tertiary,
                  borderRadius: '20px'
                }}
              >
                <IconUser size={40} style={{ color: designColors.text.primary }} />
              </Box>
            )}
            
            <Stack gap="xs" style={{ flex: 1 }}>
              <Group gap="xs" align="center">
                <Text 
                  size="lg"
                  style={{ 
                    color: designColors.text.primary,
                    fontWeight: 600
                  }}
                >
                  {userProfile.name}
                </Text>
                {userProfile.role === 'organizer' && (
                  <IconCrown size={18} style={{ color: designColors.semantic.warning }} />
                )}
              </Group>
              
              <Text 
                size="sm"
                style={{ color: designColors.text.secondary }}
              >
                {userProfile.groupPosition}
              </Text>
              
              <Group gap="md" mt="xs">
                <Group gap="xs">
                  <IconPhone size={14} style={{ color: designColors.text.tertiary }} />
                  <Text 
                    size="xs"
                    style={{ color: designColors.text.tertiary }}
                  >
                    {userProfile.phone}
                  </Text>
                </Group>
                
                <Group gap="xs">
                  <IconMail size={14} style={{ color: designColors.text.tertiary }} />
                  <Text 
                    size="xs"
                    style={{ color: designColors.text.tertiary }}
                  >
                    {userProfile.email}
                  </Text>
                </Group>
              </Group>
              
              <Text 
                size="xs"
                style={{ color: designColors.text.tertiary }}
              >
                В группе с {userProfile.joinDate}
              </Text>
            </Stack>
          </Group>
        </Card>

        {/* Group Statistics */}
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
            📊 Статистика группы
          </Text>
          
          <Group gap="md">
            <Box style={{ flex: 1, textAlign: 'center' }}>
              <Text 
                size="xl"
                style={{ 
                  color: designColors.accents.fabButton,
                  fontWeight: 600
                }}
              >
                {groupStats.totalMembers}
              </Text>
              <Text 
                size="xs"
                style={{ color: designColors.text.secondary }}
              >
                Участников
              </Text>
            </Box>
            
            <Box style={{ flex: 1, textAlign: 'center' }}>
              <Text 
                size="lg"
                style={{ 
                  color: designColors.amounts.negative,
                  fontWeight: 600
                }}
              >
                {formatCurrency(groupStats.totalExpenses)}
              </Text>
              <Text 
                size="xs"
                style={{ color: designColors.text.secondary }}
              >
                Всего трат
              </Text>
            </Box>
            
            <Box style={{ flex: 1, textAlign: 'center' }}>
              <Text 
                size="xl"
                style={{ 
                  color: designColors.semantic.warning,
                  fontWeight: 600
                }}
              >
                {groupStats.activeDebts}
              </Text>
              <Text 
                size="xs"
                style={{ color: designColors.text.secondary }}
              >
                Активных долгов
              </Text>
            </Box>
          </Group>
        </Card>

        {/* Settings Menu */}
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
          <MenuButton
            icon={<IconUsers size={20} />}
            title="Управление группой"
            subtitle="Участники, настройки, права доступа"
            onClick={onGroupSettings}
          />
          
          <Divider style={{ borderColor: designColors.text.tertiary }} />
          
          <MenuButton
            icon={<IconBell size={20} />}
            title="Уведомления"
            subtitle="Push, email, Telegram"
            onClick={onNotificationSettings}
            rightElement={
              <Switch 
                checked={true}
                size="sm"
                styles={{
                  track: {
                    backgroundColor: designColors.semantic.success
                  }
                }}
              />
            }
          />
          
          <Divider style={{ borderColor: designColors.text.tertiary }} />
          
          <MenuButton
            icon={<IconCreditCard size={20} />}
            title="Способы оплаты"
            subtitle="Карты, кошельки, переводы"
            onClick={onPaymentSettings}
          />
          
          <Divider style={{ borderColor: designColors.text.tertiary }} />
          
          <MenuButton
            icon={<IconSettings size={20} />}
            title="Настройки приложения"
            subtitle="Язык, валюта, темная тема"
            onClick={() => {}}
          />
        </Card>

        {/* Account Actions */}
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
          <MenuButton
            icon={<IconUser size={20} />}
            title="Редактировать профиль"
            subtitle="Имя, телефон, email"
            onClick={onEditProfile}
          />
          
          <Divider style={{ borderColor: designColors.text.tertiary }} />
          
          <MenuButton
            icon={<IconLogout size={20} />}
            title="Выйти из аккаунта"
            onClick={onLogout}
            color={designColors.semantic.error}
          />
        </Card>

        {/* App Info */}
        <Box style={{ textAlign: 'center', marginTop: '20px' }}>
          <Text 
            size="xs"
            style={{ color: designColors.text.tertiary }}
          >
            Budget Mini Bot v1.0.0
          </Text>
          <Text 
            size="xs"
            style={{ color: designColors.text.tertiary }}
          >
            © 2024 Все права защищены
          </Text>
        </Box>
      </Stack>
    </Box>
  );
} 