'use client';

import { useGroupBalances, useGroupMembers, useTransfers, useUser } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { designColors } from '@/lib/design-system';
import { useCurrentGroup } from '@/stores/useAppStore';
import { NewTransferModal } from '@/components/modals/NewTransferModal';
import { ActionIcon, Badge, Box, Button, Card, Group, Loader, Stack, Tabs, Text, Alert } from '@mantine/core';
import {
    IconArrowDownRight,
    IconArrowUpRight,
    IconCheck,
    IconClockHour4,
    IconPlus,
    IconUsers,
    IconX,
    IconAlertCircle
} from '@tabler/icons-react';
import React, { useState, useCallback, useMemo } from 'react';

interface MoneyScreenProps {
  onSendTransfer?: (toUserId: string, amount: number) => void;
  onConfirmReceived?: (fromUserId: string, amount: number) => void;
  onRefetchDebts?: (refetchFn: () => void) => void;
}

export function MoneyScreen({ 
  onSendTransfer: _onSendTransfer, 
  onConfirmReceived: _onConfirmReceived, 
  onRefetchDebts 
}: MoneyScreenProps) {
  const [activeTab, setActiveTab] = useState<'debts' | 'transfers'>('debts');
  const [newTransferModalOpened, setNewTransferModalOpened] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<string | null>(null);

  const currentGroup = useCurrentGroup();
  const groupId = currentGroup?.group_id;

  // API hooks
  const { data: balances, loading: balancesLoading, error: balancesError, refetch: refetchBalances } = useGroupBalances(groupId || 0);
  const { transfers, loading: transfersLoading, error: transfersError, refetch: refetchTransfers, createTransfer, confirmTransfer, cancelTransfer } = useTransfers(groupId);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0
    }).format(Math.abs(amount)) + ' ₽';
  };

  const getStatusBadge = (status: 'pending' | 'confirmed' | 'cancelled') => {
    const colors = {
      pending: 'yellow',
      confirmed: 'green',
      cancelled: 'red'
    };
    
    const labels = {
      pending: 'На подтверждении',
      confirmed: 'Принято',
      cancelled: 'Отклонено'
    };

    return (
      <Badge color={colors[status]} size="sm">
        {labels[status]}
      </Badge>
    );
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

  const handleNewTransfer = async (data: { toUserId: number; amount: number; description: string }) => {
    if (!currentGroup || !user) return;
    
    try {
      const result = await createTransfer({
        group_id: currentGroup.group_id,
        to_user_id: data.toUserId,
        amount: data.amount,
        description: data.description
      });
      
      if (result.success) {
        // Отправляем уведомление в Telegram
        await api.transfer.sendNotification({
          group_id: currentGroup.group_id,
          to_user_id: data.toUserId,
          amount: data.amount,
          description: data.description
        });
        
        // Обновляем данные после создания перевода
        refetchBalances();
        refetchTransfers();
        setNewTransferModalOpened(false);
      } else {
        console.error('Failed to create transfer:', result.message);
      }
    } catch (error) {
      console.error('Error creating transfer:', error);
    }
  };

  const handleConfirmTransfer = async (transferId: string) => {
    try {
      const result = await confirmTransfer(parseInt(transferId));
      if (result.success) {
        refetchBalances();
        refetchTransfers();
      }
    } catch (error) {
      console.error('Error confirming transfer:', error);
    }
  };

  const handleRejectTransfer = async (transferId: string) => {
    try {
      const result = await cancelTransfer(parseInt(transferId));
      if (result.success) {
        refetchBalances();
        refetchTransfers();
      }
    } catch (error) {
      console.error('Error rejecting transfer:', error);
    }
  };

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
            Загрузка данных...
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

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return designColors.semantic.success; // ему должны
    if (balance < 0) return designColors.semantic.error; // он должен
    return designColors.text.primary; // баланс 0
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
          💰 Деньги
        </Text>
        
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
        >
          <IconUsers size={20} style={{ color: designColors.text.secondary }} />
        </ActionIcon>
      </Group>

      <Stack gap="lg" p="md">
        {/* Balance Overview */}
        {userBalance && (
        <Card
          radius="lg"
          p="lg"
          style={{
            backgroundColor: designColors.backgrounds.cards,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Stack gap="md" align="center">
            <Text 
              size="sm" 
              style={{ 
                color: designColors.text.secondary,
                textAlign: 'center'
              }}
            >
              Ваш общий баланс
            </Text>
            <Text 
              style={{ 
                  color: userBalance.balance < 0 ? designColors.amounts.negative : designColors.amounts.positive,
                fontSize: '32px',
                fontWeight: 300,
                textAlign: 'center'
              }}
            >
                {userBalance.balance < 0 ? '-' : '+'}{formatCurrency(userBalance.balance)}
            </Text>
            <Text 
              size="sm"
              style={{ 
                color: designColors.text.secondary,
                textAlign: 'center'
              }}
            >
                {userBalance.balance < 0 ? 'Вы должны' : 'Вам должны'}
            </Text>
          </Stack>
        </Card>
        )}

        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onChange={(value) => setActiveTab(value as 'debts' | 'transfers')}
          styles={{
            list: {
              backgroundColor: designColors.backgrounds.cards,
              borderRadius: '12px',
              padding: '4px'
            },
            tab: {
              borderRadius: '8px',
              color: designColors.text.secondary,
              '&[data-active]': {
                backgroundColor: designColors.accents.fabButton,
                color: designColors.text.primary
              }
            }
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="debts">💳 Долги</Tabs.Tab>
            <Tabs.Tab value="transfers">🔄 Переводы</Tabs.Tab>
          </Tabs.List>

          {/* Debts Tab */}
          <Tabs.Panel value="debts">
            <Stack gap="md" mt="md">
              <Group justify="space-between" align="center">
                <Text 
                  size="md"
                  style={{ 
                    color: designColors.text.primary,
                    fontWeight: 600
                  }}
                >
                  Расчеты с участниками
                </Text>
                <Text 
                  size="sm"
                  style={{ color: designColors.text.secondary }}
                >
                  {allBalances.length} человек
                </Text>
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
                {allBalances.map((balance, index) => {
                  const balanceAmount = balance.balance;
                  const isCurrentUser = user && balance.user_id === user.id;
                  
                  if (isCurrentUser) return null; // Не показываем текущего пользователя
                  
                  return (
                    <Box
                      key={balance.user_id}
                    style={{
                      padding: '16px',
                        borderBottom: index < allBalances.length - 1 ? 
                        `1px solid ${designColors.text.tertiary}` : 'none'
                    }}
                  >
                    <Group justify="space-between" align="center">
                      <Group gap="sm">
                        {/* Avatar */}
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
                            {balanceAmount > 0 ? '💰' : balanceAmount < 0 ? '💸' : '✅'}
                        </Box>
                        
                        <Stack gap={2}>
                          <Text 
                            size="md"
                            style={{ 
                              color: designColors.text.primary,
                              fontWeight: 500
                            }}
                          >
                              {`${balance.profile_first_name || balance.first_name} ${balance.profile_last_name || balance.last_name || ''}`.trim()}
                          </Text>
                          <Text 
                            size="sm"
                            style={{ color: designColors.text.secondary }}
                          >
                              {balance.username ? `@${balance.username}` : 'Без username'}
                          </Text>
                        </Stack>
                      </Group>
                      
                      <Stack gap="xs" align="flex-end">
                        <Text 
                          size="lg"
                          style={{ 
                              color: getBalanceColor(balanceAmount),
                              fontWeight: 600
                            }}
                          >
                            {balance.balance_formatted}
                          </Text>
                        </Stack>
                      </Group>
                    </Box>
                  );
                })}
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
                    <IconClockHour4 size={20} style={{ color: designColors.accents.fabButton }} />
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
                            <IconArrowUpRight 
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
                              color="orange"
                            >
                              Ожидает
                            </Badge>
                          </Group>
                    </Group>
                      </Card>
                ))}
                  </Stack>
              </Card>
              )}
            </Stack>
          </Tabs.Panel>

          {/* Transfers Tab */}
          <Tabs.Panel value="transfers">
            <Stack gap="md" mt="md">
              <Group justify="space-between" align="center">
                <Text 
                  size="md"
                  style={{ 
                    color: designColors.text.primary,
                    fontWeight: 600
                  }}
                >
                  История переводов
                </Text>
                <Text 
                  size="sm"
                  style={{ color: designColors.text.secondary }}
                >
                  {allTransfers.length} операций
                </Text>
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
                {allTransfers.length === 0 ? (
                  <Box p="md" style={{ textAlign: 'center' }}>
                    <Text style={{ color: designColors.text.secondary }}>
                      Пока нет переводов
                    </Text>
                  </Box>
                ) : (
                  allTransfers.map((transfer, index) => {
                    const isCurrentUserSender = user && transfer.from_user_id === user.id;
                    const isCurrentUserReceiver = user && transfer.to_user_id === user.id;
                    
                    // Получаем имена пользователей из transfer или members
                    const fromMember = groupMembers.find(m => m.user_id === transfer.from_user_id);
                    const toMember = groupMembers.find(m => m.user_id === transfer.to_user_id);
                    
                    const fromUserName = fromMember 
                      ? `${fromMember.profile_first_name || fromMember.first_name} ${fromMember.profile_last_name || fromMember.last_name || ''}`.trim()
                      : transfer.from_user 
                        ? `${transfer.from_user.profile_first_name || transfer.from_user.first_name} ${transfer.from_user.profile_last_name || transfer.from_user.last_name || ''}`.trim()
                        : 'Unknown';
                      
                    const toUserName = toMember
                      ? `${toMember.profile_first_name || toMember.first_name} ${toMember.profile_last_name || toMember.last_name || ''}`.trim()
                      : transfer.to_user
                        ? `${transfer.to_user.profile_first_name || transfer.to_user.first_name} ${transfer.to_user.profile_last_name || transfer.to_user.last_name || ''}`.trim()
                        : 'Unknown';
                    
                    return (
                  <Box
                    key={transfer.id}
                    style={{
                      padding: '16px',
                          borderBottom: index < allTransfers.length - 1 ? 
                        `1px solid ${designColors.text.tertiary}` : 'none'
                    }}
                  >
                    <Group justify="space-between" align="flex-start">
                      <Group gap="sm" align="flex-start">
                        {/* Direction Icon */}
                        <ActionIcon
                          size="md"
                          style={{
                                backgroundColor: isCurrentUserSender ? 
                              designColors.amounts.negative + '20' : 
                              designColors.amounts.positive + '20',
                                color: isCurrentUserSender ? 
                              designColors.amounts.negative : 
                              designColors.amounts.positive,
                            marginTop: '2px'
                          }}
                        >
                              {isCurrentUserSender ? 
                            <IconArrowUpRight size={16} /> : 
                            <IconArrowDownRight size={16} />
                          }
                        </ActionIcon>
                        
                        <Stack gap={2}>
                          <Text 
                            size="md"
                            style={{ 
                              color: designColors.text.primary,
                              fontWeight: 500
                            }}
                          >
                                {fromUserName} → {toUserName}
                          </Text>
                          <Text 
                            size="sm"
                            style={{ color: designColors.text.secondary }}
                          >
                                {transfer.description || 'Перевод'}
                          </Text>
                          <Group gap="xs">
                            <IconClockHour4 size={12} style={{ color: designColors.text.tertiary }} />
                            <Text 
                              size="xs"
                              style={{ color: designColors.text.tertiary }}
                            >
                                  {new Date(transfer.created_at).toLocaleString('ru-RU')}
                            </Text>
                          </Group>
                        </Stack>
                      </Group>
                      
                      <Stack gap="xs" align="flex-end">
                        <Text 
                          size="lg"
                          style={{ 
                                color: isCurrentUserSender ? 
                              designColors.amounts.negative : 
                              designColors.amounts.positive,
                            fontWeight: 600
                          }}
                        >
                              {isCurrentUserSender ? '-' : '+'}{transfer.amount}
                        </Text>
                        
                        {getStatusBadge(transfer.status)}
                        
                            {transfer.status === 'pending' && isCurrentUserReceiver && (
                          <Group gap="xs">
                            <ActionIcon
                              size="sm"
                              color="green"
                                  onClick={() => handleConfirmTransfer(transfer.id.toString())}
                            >
                              <IconCheck size={14} />
                            </ActionIcon>
                            <ActionIcon
                              size="sm"
                              color="red"
                                  onClick={() => handleRejectTransfer(transfer.id.toString())}
                            >
                              <IconX size={14} />
                            </ActionIcon>
                          </Group>
                        )}
                      </Stack>
                    </Group>
                  </Box>
                    );
                  })
                )}
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* New Transfer Button */}
        <Button
          fullWidth
          size="lg"
          leftSection={<IconPlus size={20} />}
          onClick={() => setNewTransferModalOpened(true)}
          styles={{
            root: {
              backgroundColor: designColors.accents.fabButton,
              color: designColors.text.primary,
              border: 'none',
              borderRadius: '16px',
              height: '56px',
              fontSize: '16px',
              fontWeight: 600
            }
          }}
        >
          Новый перевод
        </Button>
      </Stack>

      {/* New Transfer Modal */}
      <NewTransferModal
        opened={newTransferModalOpened}
        onClose={() => setNewTransferModalOpened(false)}
        onSubmit={handleNewTransfer}
      />
    </Box>
  );
} 