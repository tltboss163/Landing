'use client';

import { useHomeScreenData } from '@/hooks/useApi';
import { designColors } from '@/lib/design-system';
import { useCurrentGroup } from '@/stores/useAppStore';
import { Alert, Badge, Box, Button, Card, Group, Loader, Stack, Text } from '@mantine/core';
import {
    IconAlertCircle,
    IconArrowDown,
    IconArrowUp,
    IconCrown,
    IconPlus,
    IconUsers,
    IconWallet
} from '@tabler/icons-react';
import React from 'react';

interface HomeScreenProps {
  onAddExpense: () => void;
  onViewExpenses: () => void;
  onViewDebts: () => void;
  onViewParticipants: () => void;
  onOpenAdmin: () => void;
  onRefetchData?: (refetchFn: () => void) => void;
}

export function HomeScreen({ 
  onAddExpense, 
  onViewExpenses,
  onViewDebts, 
  onViewParticipants, 
  onOpenAdmin,
  onRefetchData
}: HomeScreenProps) {
  const currentGroup = useCurrentGroup();
  
  // Check if collection is completed
  const isCollectionCompleted = currentGroup?.status === 'COMPLETED';
  const { data, loading, error, refetch } = useHomeScreenData(currentGroup?.group_id);

  // Передаем функцию refetch в AppContainer
  React.useEffect(() => {
    if (onRefetchData) {
      onRefetchData(refetch);
    }
  }, [onRefetchData, refetch]);

  // Loading state
  if (loading) {
    return (
      <Box
        style={{
          backgroundColor: designColors.backgrounds.primary,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: '100px'
        }}
      >
        <Stack align="center" gap="md">
          <Loader color={designColors.accents.fabButton} />
          <Text style={{ color: designColors.text.secondary }}>
            Загрузка данных...
          </Text>
        </Stack>
      </Box>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <Box
        style={{
          backgroundColor: designColors.backgrounds.primary,
          minHeight: '100vh',
          padding: '20px',
          paddingBottom: '100px'
        }}
      >
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Ошибка загрузки"
          color="red"
          variant="light"
          style={{ marginBottom: '20px' }}
        >
          {error || 'Не удалось загрузить данные'}
        </Alert>
        <Button
          onClick={refetch}
          style={{
            backgroundColor: designColors.accents.fabButton,
            color: designColors.text.primary
          }}
        >
          Повторить попытку
        </Button>
      </Box>
    );
  }

  const { group, user, userBalance, recentExpenses, myDebts, expenses, members } = data;

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, expense) => {
    return sum + parseFloat(expense.amount);
  }, 0);

  const sharePerPerson = members.length > 0 ? totalExpenses / members.length : 0;

  // Get user balance info
  const userBalanceAmount = userBalance?.balance || 0;
  const userExpenses = expenses.filter(expense => expense.is_paid_by_current_user);
  const userSpent = userExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0
    }).format(amount) + ' ₽';
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return designColors.semantic.success; // ему должны
    if (balance < 0) return designColors.semantic.error; // он должен
    return designColors.text.primary; // баланс 0
  };

  const getBalanceText = (balance: number) => {
    if (balance > 0) return `Вам должны: ${formatCurrency(balance)}`;
    if (balance < 0) return `Вы должны: ${formatCurrency(Math.abs(balance))}`;
    return 'Баланс сведен';
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'food': return 'Еда';
      case 'drinks': return 'Напитки';
      case 'transport': return 'Транспорт';
      case 'accommodation': return 'Проживание';
      case 'entertainment': return 'Развлечения';
      case 'shopping': return 'Покупки';
      case 'vacation': return 'Отпуск';
      case 'health': return 'Здоровье';
      case 'other': return 'Другое';
      default: return 'Прочее';
    }
  };

  const isAdmin = user?.group_role === 'admin';

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
        <Stack gap={2}>
          <Group gap="xs">
            <Text 
              size="lg"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              {group?.name || 'Группа'}
            </Text>
            {isAdmin && (
              <IconCrown size={16} style={{ color: designColors.semantic.warning }} />
            )}
          </Group>
          <Group gap="xs">
            <IconUsers size={14} style={{ color: designColors.text.secondary }} />
            <Text 
              size="sm"
              style={{ color: designColors.text.secondary }}
            >
              {members.length} участников
            </Text>
            <Badge 
              color={group?.status === 'active' ? "green" : "gray"}
              size="sm"
            >
              {group?.status === 'active' ? 'Активно' : 'Завершено'}
            </Badge>
          </Group>
        </Stack>
      </Group>

      <Stack gap="lg" p="md">
        {/* Event Summary */}
        <Card
          radius="lg"
          p="lg"
          style={{
            backgroundColor: designColors.backgrounds.cards,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Group gap="xs" mb="md">
            <IconWallet size={20} style={{ color: designColors.accents.fabButton }} />
            <Text 
              size="md"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              Общие расходы события
            </Text>
          </Group>
          
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text 
                size="xl"
                style={{ 
                  color: designColors.text.primary,
                  fontWeight: 600
                }}
              >
                {formatCurrency(totalExpenses)}
              </Text>
              <Text 
                size="sm"
                style={{ color: designColors.text.secondary }}
              >
                потрачено всего
              </Text>
            </Group>
            
            <Group justify="space-between" align="center">
              <Text 
                size="xs"
                style={{ color: designColors.text.tertiary }}
              >
                Создано: {group?.created_at ? new Date(group.created_at).toLocaleDateString('ru-RU') : 'Недавно'}
              </Text>
              <Text 
                size="xs"
                style={{ color: designColors.text.tertiary }}
              >
                {expenses.length} трат добавлено
              </Text>
            </Group>
          </Stack>
        </Card>

        {/* Personal Balance */}
        <Card
          radius="lg"
          p="lg"
          style={{
            backgroundColor: designColors.backgrounds.cards,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Group gap="xs" mb="md">
            <Text 
              style={{ fontSize: '20px' }}
            >
              📊
            </Text>
            <Text 
              size="md"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              Мой баланс
            </Text>
          </Group>
          
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Stack gap={2}>
                <Text 
                  size="sm"
                  style={{ color: designColors.text.secondary }}
                >
                  Я потратил:
                </Text>
                <Text 
                  size="lg"
                  style={{ 
                    color: designColors.amounts.positive,
                    fontWeight: 600
                  }}
                >
                  {formatCurrency(userSpent)}
                </Text>
                <Text 
                  size="xs"
                  style={{ color: designColors.text.tertiary }}
                >
                  {userExpenses.length} расход{userExpenses.length > 1 ? 'а' : ''}
                </Text>
              </Stack>
              
              <Stack gap={2} align="flex-end">
                <Text 
                  size="sm"
                  style={{ color: designColors.text.secondary }}
                >
                  Моя доля:
                </Text>
                <Text 
                  size="lg"
                  style={{ 
                    color: designColors.text.primary,
                    fontWeight: 600
                  }}
                >
                  {formatCurrency(sharePerPerson)}
                </Text>
              </Stack>
            </Group>
            
            <Box
              style={{
                padding: '12px',
                backgroundColor: userBalanceAmount < 0 ? 
                  designColors.semantic.error + '20' : 
                  userBalanceAmount > 0 ?
                    designColors.semantic.success + '20' :
                    designColors.text.tertiary + '20',
                borderRadius: '8px',
                marginTop: '8px'
              }}
            >
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  {userBalanceAmount < 0 ? (
                    <IconArrowUp size={16} style={{ color: designColors.semantic.error }} />
                  ) : userBalanceAmount > 0 ? (
                    <IconArrowDown size={16} style={{ color: designColors.semantic.success }} />
                  ) : null}
                  <Text 
                    size="md"
                    style={{ 
                      color: getBalanceColor(userBalanceAmount),
                      fontWeight: 600
                    }}
                  >
                    {getBalanceText(userBalanceAmount)}
                  </Text>
                </Group>
                
                {userBalanceAmount !== 0 && (
                  <Button 
                    size="xs"
                    variant="subtle"
                    onClick={onViewDebts}
                    style={{
                      color: getBalanceColor(userBalanceAmount)
                    }}
                  >
                    {userBalanceAmount < 0 ? 'Доплатить' : 'Получить'}
                  </Button>
                )}
              </Group>
            </Box>
          </Stack>
        </Card>

        {/* Quick Actions */}
        <Group gap="md">
          <Button
            fullWidth
            size="md"
            leftSection={<IconPlus size={16} />}
            onClick={isCollectionCompleted ? undefined : onAddExpense}
            disabled={isCollectionCompleted}
            styles={{
              root: {
                backgroundColor: isCollectionCompleted ? designColors.backgrounds.secondary : designColors.text.tertiary,
                color: isCollectionCompleted ? designColors.text.secondary : designColors.text.primary,
                border: 'none',
                borderRadius: '12px',
                height: '48px',
                paddingLeft: '48px',
                opacity: isCollectionCompleted ? 0.6 : 1
              }
            }}
          >
            {isCollectionCompleted ? 'Сбор завершён' : 'Добавить расход'}
          </Button>
          
          {userBalanceAmount !== 0 && (
            <Button 
              variant="outline"
              leftSection={userBalanceAmount < 0 ? 
                <IconArrowUp size={16} /> : 
                <IconArrowDown size={16} />
              }
              style={{ 
                flex: 1,
                borderColor: getBalanceColor(userBalanceAmount),
                color: getBalanceColor(userBalanceAmount)
              }}
              onClick={onViewDebts}
            >
              {userBalanceAmount < 0 ? 'Долги' : 'Получить'}
            </Button>
          )}
        </Group>

        {/* Navigation Links */}
        <Group gap="md">
          <Button 
            variant="light"
            leftSection={<IconWallet size={16} />}
            style={{ 
              flex: 1,
              backgroundColor: designColors.amounts.positive + '20',
              color: designColors.amounts.positive,
              border: 'none'
            }}
            onClick={onViewExpenses}
          >
            Расходы
          </Button>
          
          <Button 
            variant="light"
            leftSection={<IconUsers size={16} />}
            style={{ 
              flex: 1,
              backgroundColor: designColors.semantic.transfer + '20',
              color: designColors.semantic.transfer,
              border: 'none'
            }}
            onClick={onViewParticipants}
          >
            Участники
          </Button>
          
          {isAdmin && (
            <Button 
              variant="light"
              leftSection={<IconCrown size={16} />}
              style={{ 
                flex: 1,
                backgroundColor: designColors.semantic.warning + '20',
                color: designColors.semantic.warning,
                border: 'none'
              }}
              onClick={onOpenAdmin}
            >
              Админ
            </Button>
          )}
        </Group>

        {/* Recent Expenses */}
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text 
              size="lg"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              📝 Последние расходы
            </Text>
            <Button
              variant="subtle"
              size="xs"
              onClick={onViewExpenses}
              style={{ color: designColors.text.secondary }}
            >
              Все расходы
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
            {recentExpenses.map((expense, index) => {
              const isCurrentUser = expense.paid_by_name === (user?.profile_first_name || user?.first_name);
              const timeAgo = new Date(expense.created_at).toLocaleDateString('ru-RU');
              
              return (
                <Box
                  key={expense.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: index < recentExpenses.length - 1 ? 
                      `1px solid ${designColors.text.tertiary}` : 'none',
                    backgroundColor: isCurrentUser ? 
                      designColors.accents.fabButton + '10' : 'transparent'
                  }}
                >
                  <Group justify="space-between" align="center">
                    <Group gap="sm">
                      {/* Expense Icon */}
                      <Box
                        style={{
                          fontSize: '18px',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isCurrentUser ? 
                            designColors.accents.fabButton + '20' : 
                            designColors.amounts.positive + '20',
                          borderRadius: '8px'
                        }}
                      >
                        💰
                      </Box>
                      
                      <Stack gap={2}>
                        <Text 
                          size="sm"
                          style={{ 
                            color: designColors.text.primary,
                            fontWeight: 500
                          }}
                        >
                          {expense.paid_by_name} • {expense.description}
                        </Text>
                        <Group gap="xs">
                          <Text 
                            size="xs"
                            style={{ color: designColors.text.secondary }}
                          >
                            {timeAgo}
                          </Text>
                          <Badge size="xs" color="gray">
                            {getCategoryName(expense.category)}
                          </Badge>
                        </Group>
                      </Stack>
                    </Group>
                    
                    <Stack gap={2} align="flex-end">
                      <Text 
                        size="sm"
                        style={{ 
                          color: designColors.amounts.positive,
                          fontWeight: 600
                        }}
                      >
                        {expense.amount}
                      </Text>
                      {isCurrentUser && (
                        <Badge color="blue" size="xs">
                          Ваш расход
                        </Badge>
                      )}
                    </Stack>
                  </Group>
                </Box>
              );
            })}
          </Card>
          
          {recentExpenses.length === 0 && (
            <Card
              radius="lg"
              p="md"
              style={{
                backgroundColor: designColors.backgrounds.cards,
                border: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                textAlign: 'center'
              }}
            >
              <Text 
                size="sm"
                style={{ color: designColors.text.secondary }}
              >
                Расходы ещё не добавлены
              </Text>
              <Button 
                variant="subtle"
                size="sm"
                onClick={onAddExpense}
                style={{ marginTop: '8px' }}
              >
                Добавить первый расход
              </Button>
            </Card>
          )}
        </Stack>
      </Stack>
    </Box>
  );
} 