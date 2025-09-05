'use client';

import { useGroupBalances, useGroupMembers, useTransfers, useUser } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { designColors } from '@/lib/design-system';
import { useCurrentGroup } from '@/stores/useAppStore';
import { Alert, Badge, Box, Button, Card, Group, Loader, Stack, Text } from '@mantine/core';
import {
    IconAlertCircle,
    IconArrowUp,
    IconCalculator,
    IconClock,
    IconUsers
} from '@tabler/icons-react';
import React, { useCallback, useMemo, useState } from 'react';

interface DebtsScreenProps {
  onSendTransfer?: (toUserId: string, amount: number) => void;
  onConfirmReceived?: (fromUserId: string, amount: number) => void;
  onRefetchDebts?: (refetchFn: () => void) => void;
}

export function DebtsScreen({ 
  onSendTransfer: _onSendTransfer, 
  onConfirmReceived: _onConfirmReceived, 
  onRefetchDebts 
}: DebtsScreenProps) {
  const [selectedTransfer, setSelectedTransfer] = useState<string | null>(null);

  const currentGroup = useCurrentGroup();
  const groupId = currentGroup?.group_id;

  // API hooks
  const { data: balances, loading: balancesLoading, error: balancesError, refetch: refetchBalances } = useGroupBalances(groupId || 0);
  const { transfers, loading: transfersLoading, error: transfersError, refetch: refetchTransfers } = useTransfers(groupId);
  const { members, loading: membersLoading, error: membersError } = useGroupMembers(groupId || 0);
  const { user, loading: userLoading, error: _userError } = useUser(groupId);

  // IMPORTANT: All hooks must be called before any early returns
  const handleRefresh = useCallback(() => {
    refetchBalances();
    refetchTransfers();
  }, [refetchBalances, refetchTransfers]);

  // Передаем функцию refetch в AppContainer
  React.useEffect(() => {
    if (onRefetchDebts) {
      onRefetchDebts(handleRefresh);
    }
  }, [onRefetchDebts, handleRefresh]);

  // Calculate derived data - must be called before any early returns
  const eventSummary = useMemo(() => {
    if (!balances || !members || !currentGroup) return null;
    
    const totalExpenses = balances.reduce((sum, balance) => {
      return sum + Math.abs(balance.balance);
    }, 0);
    
    return {
      title: currentGroup.group_name,
      totalExpenses,
      participantsCount: members.length,
      sharePerPerson: totalExpenses / (members.length || 1)
    };
  }, [balances, members, currentGroup]);

  const userBalance = useMemo(() => {
    if (!balances || !eventSummary || !user) return null;
    
    // Find current user's balance
    const currentUserBalance = balances.find(balance => balance.user_id === user.id);
    if (!currentUserBalance) return null;

    const balance = currentUserBalance.balance;
    // Убираю неиспользуемые переменные
    // const owesAmount = Math.abs(Math.min(myBalance || 0, 0));
    // const owedAmount = Math.max(myBalance || 0, 0);

    return {
      totalSpent: eventSummary.sharePerPerson + balance, // What they should pay plus their balance
      shareAmount: eventSummary.sharePerPerson,
      balance,
      status: balance === 0 ? 'settled' as const : 'pending' as const
    };
  }, [balances, eventSummary, user]);

  const optimalTransfers = useMemo(() => {
    if (!balances || !members || !user) return [];
    
    const debtors = balances.filter(b => b.balance < 0);
    const creditors = balances.filter(b => b.balance > 0);
    
    const transfersData = [];
    let transferId = 1;

    // Create a member lookup map for efficient username resolution
    const memberMap = new Map();
    members.forEach(member => {
      memberMap.set(member.user_id, member);
    });

    for (const debtor of debtors) {
      const debtAmount = Math.abs(debtor.balance);
      
      for (const creditor of creditors) {
        const creditAmount = creditor.balance;
        
        if (debtAmount > 0 && creditAmount > 0) {
          const transferAmount = Math.min(debtAmount, creditAmount);
          
          // Get user names from member map, fallback to balance data
          const debtorMember = memberMap.get(debtor.user_id);
          const creditorMember = memberMap.get(creditor.user_id);
          
          const debtorName = debtorMember 
            ? `${debtorMember.profile_first_name || debtorMember.first_name} ${debtorMember.profile_last_name || debtorMember.last_name || ''}`.trim()
            : `${debtor.profile_first_name || debtor.first_name || 'Unknown'} ${debtor.profile_last_name || debtor.last_name || ''}`.trim();
            
          const creditorName = creditorMember
            ? `${creditorMember.profile_first_name || creditorMember.first_name} ${creditorMember.profile_last_name || creditorMember.last_name || ''}`.trim()
            : `${creditor.profile_first_name || creditor.first_name || 'Unknown'} ${creditor.profile_last_name || creditor.last_name || ''}`.trim();
          
          transfersData.push({
            id: transferId.toString(),
            fromUser: debtorName,
            fromUserId: debtor.user_id.toString(),
            toUser: creditorName,
            toUserId: creditor.user_id.toString(),
            amount: transferAmount,
            reason: 'Доплата за общие расходы',
            status: 'pending' as const,
            isCurrentUserSender: debtor.user_id === user.id // Current user is the debtor (sender)
          });
          
          transferId++;
          break;
        }
      }
    }

    // Filter to show only transfers where current user is the sender (debtor)
    return transfersData.filter(transfer => transfer.isCurrentUserSender);
  }, [balances, members, user]);

  // Loading state
  if (balancesLoading || transfersLoading || membersLoading || userLoading) {
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
          <Loader size="lg" color="blue" />
          <Text style={{ color: designColors.text.secondary }}>
            Загрузка данных о долгах...
          </Text>
        </Stack>
      </Box>
    );
  }

  // Error state
  if (balancesError || transfersError || membersError) {
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
          icon={<IconAlertCircle size={16} />}
          title="Ошибка загрузки"
          color="red"
          style={{ marginTop: '20px' }}
        >
          {balancesError || transfersError || membersError}
        </Alert>
      </Box>
    );
  }

  // No group selected
  if (!groupId || !currentGroup) {
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
          icon={<IconAlertCircle size={16} />}
          title="Группа не выбрана"
          color="yellow"
          style={{ marginTop: '20px' }}
        >
          Выберите группу для просмотра долгов
        </Alert>
      </Box>
    );
  }

  const allBalances = balances || [];
  const allTransfers = transfers || [];
  const groupMembers = members || [];

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'sent': return 'blue';
      case 'confirmed': return 'green';
      default: return 'gray';
    }
  };

  const handleSendTransfer = async (transferId: string, toUserId: string, amount: number) => {
    if (!currentGroup || !user) return;
    
    setSelectedTransfer(transferId);
    
    try {
      const result = await api.transfer.sendNotification({
        group_id: currentGroup.group_id,
        to_user_id: parseInt(toUserId),
        amount: amount,
        description: 'Доплата за общие расходы'
      });
      
      if (result.success) {
        // Обновляем данные
        refetchBalances();
        refetchTransfers();
        
        // Показываем успешное сообщение
        console.log('Transfer notification sent successfully');
      } else {
        console.error('Failed to send transfer notification:', result.message);
      }
    } catch (error) {
      console.error('Error sending transfer notification:', error);
    } finally {
      setSelectedTransfer(null);
    }
  };

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
          💰 Долги и переводы
        </Text>
        
        <Button
          variant="subtle"
          size="sm"
          onClick={handleRefresh}
          styles={{
            root: {
              color: designColors.text.secondary
            }
          }}
        >
          <IconCalculator size={20} />
        </Button>
      </Group>

      <Stack gap="lg" p="md">
        {/* Event Balance Summary */}
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
            <IconUsers size={20} style={{ color: designColors.accents.fabButton }} />
            <Text 
              size="md"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              Общий расчет
            </Text>
          </Group>
          
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text 
                size="sm"
                style={{ color: designColors.text.secondary }}
              >
                {eventSummary?.title || 'Группа'}
              </Text>
              <Text 
                size="lg"
                style={{ 
                  color: designColors.text.primary,
                  fontWeight: 600
                }}
              >
                {formatCurrency(eventSummary?.totalExpenses || 0)}
              </Text>
            </Group>
            
            <Group justify="space-between" align="center">
              <Text 
                size="sm"
                style={{ color: designColors.text.secondary }}
              >
                С каждого участника:
              </Text>
              <Text 
                size="md"
                style={{ 
                  color: designColors.accents.fabButton,
                  fontWeight: 600
                }}
              >
                {formatCurrency(eventSummary?.sharePerPerson || 0)}
              </Text>
            </Group>
          </Stack>
        </Card>


        {/* All Balances */}
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
            <IconCalculator size={20} style={{ color: designColors.accents.fabButton }} />
            <Text 
              size="md"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              Балансы участников
            </Text>
          </Group>
          
          <Stack gap="md">
            {allBalances.map((balance, index) => {
              const balanceAmount = balance.balance;
              
              return (
                <Group key={balance.user_id} justify="space-between" align="center">
                  <Group gap="sm">
                    <Text 
                      style={{ fontSize: '20px' }}
                    >
                      {balanceAmount > 0 ? '💰' : balanceAmount < 0 ? '💸' : '✅'}
                    </Text>
                    <Stack gap={2}>
                      <Text 
                        size="sm"
                        style={{ 
                          color: designColors.text.primary,
                          fontWeight: 500
                        }}
                      >
                        {`${balance.profile_first_name || balance.first_name} ${balance.profile_last_name || balance.last_name || ''}`.trim()}
                      </Text>
                      <Text 
                        size="xs"
                        style={{ color: designColors.text.secondary }}
                      >
                        {balance.username ? `@${balance.username}` : 'Без username'}
                      </Text>
                    </Stack>
                  </Group>
                  
                  <Stack gap={2} align="flex-end">
                    <Text 
                      size="md"
                      style={{ 
                        color: getBalanceColor(balanceAmount),
                        fontWeight: 600
                      }}
                    >
                      {balance.balance_formatted}
                    </Text>
                    <Badge 
                      size="xs"
                      color={balanceAmount > 0 ? 'green' : balanceAmount < 0 ? 'red' : 'gray'}
                    >
                      {balanceAmount > 0 ? 'Получит' : balanceAmount < 0 ? 'Должен' : 'Рассчитан'}
                    </Badge>
                  </Stack>
                </Group>
              );
            })}
          </Stack>
        </Card>

        {/* Optimal Transfers */}
        {optimalTransfers.length > 0 && (
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
              <IconClock size={20} style={{ color: designColors.accents.fabButton }} />
              <Text 
                size="md"
                style={{ 
                  color: designColors.text.primary,
                  fontWeight: 600
                }}
              >
                Предлагаемые переводы
              </Text>
            </Group>
            
            <Stack gap="md">
              {optimalTransfers.map((transfer) => (
                <Card
                  key={transfer.id}
                  radius="md"
                  p="md"
                  style={{
                    backgroundColor: transfer.isCurrentUserSender ? 
                      designColors.accents.fabButton + '15' : 
                      designColors.text.tertiary,
                    border: 'none'
                  }}
                >
                  <Group justify="space-between" align="center">
                    <Group gap="sm">
                      <IconArrowUp 
                        size={16} 
                        style={{ 
                          color: transfer.isCurrentUserSender ? 
                            designColors.semantic.error : 
                            designColors.amounts.positive 
                        }} 
                      />
                      <Stack gap={2}>
                        <Text 
                          size="sm"
                          style={{ 
                            color: designColors.text.primary,
                            fontWeight: 500
                          }}
                        >
                          {transfer.fromUser} → {transfer.toUser}
                        </Text>
                        <Text 
                          size="xs"
                          style={{ color: designColors.text.secondary }}
                        >
                          {transfer.reason}
                        </Text>
                      </Stack>
                    </Group>
                    
                    <Group gap="sm">
                      <Text 
                        size="md"
                        style={{ 
                          color: designColors.amounts.positive,
                          fontWeight: 600
                        }}
                      >
                        {formatCurrency(transfer.amount)}
                      </Text>
                      
                      {transfer.isCurrentUserSender && (
                        <Button
                          size="xs"
                          onClick={() => handleSendTransfer(transfer.id, transfer.toUserId, transfer.amount)}
                          loading={selectedTransfer === transfer.id}
                          styles={{
                            root: {
                              backgroundColor: designColors.accents.fabButton,
                              color: designColors.text.primary
                            }
                          }}
                        >
                          Отправить
                        </Button>
                      )}
                      
                      <Badge 
                        size="xs"
                        color={getStatusColor(transfer.status)}
                      >
                        {transfer.status === 'pending' ? 'Ожидает' : 
                         transfer.status === 'sent' ? 'Отправлен' : 'Подтвержден'}
                      </Badge>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Card>
        )}
      </Stack>
    </Box>
  );
} 