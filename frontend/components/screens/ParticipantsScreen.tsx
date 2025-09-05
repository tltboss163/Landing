'use client';

import { useExpenses, useGroupBalances, useGroupMembers } from '@/hooks/useApi';
import { designColors } from '@/lib/design-system';
import { useCurrentGroup } from '@/stores/useAppStore';
import { api } from '@/lib/api';
import { Alert, Badge, Box, Button, Card, Group, Loader, Stack, Text, Modal, Select, ActionIcon } from '@mantine/core';
import {
    IconAlertCircle,
    IconCalculator,
    IconCrown,
    IconUsers,
    IconWallet,
    IconLink,
    IconUnlink
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';

interface ParticipantsScreenProps {
  onViewProfile?: (userId: string) => void;
  user?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
    profile_first_name?: string;
    profile_last_name?: string;
  };
}

export function ParticipantsScreen({ onViewProfile, user }: ParticipantsScreenProps) {
  const currentGroup = useCurrentGroup();
  const groupId = currentGroup?.group_id;

  // State for merge functionality
  const [mergeModalOpened, setMergeModalOpened] = useState(false);
  const [selectedUserForMerge, setSelectedUserForMerge] = useState<string | null>(null);
  const [selectedMainUser, setSelectedMainUser] = useState<string | null>(null);
  const [mergeLoading, setMergeLoading] = useState(false);

  // API hooks
  const { members, loading: membersLoading, error: membersError, refetch: refetchMembers } = useGroupMembers(groupId || 0);
  const { data: balances, loading: balancesLoading, error: balancesError } = useGroupBalances(groupId || 0);
  const { expenses, loading: expensesLoading, error: expensesError } = useExpenses(groupId || 0);

  // Calculate derived data - must be called before any early returns
  const eventData = useMemo(() => {
    if (!members || !balances || !expenses || !currentGroup) return null;
    
    const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const totalMembers = members.length;
    const averagePerPerson = totalExpenses / (totalMembers || 1);
    
    return {
      title: currentGroup.group_name,
      totalExpenses,
      sharePerPerson: averagePerPerson,
      participantsCount: totalMembers,
      expensesCount: expenses.length
    };
  }, [members, balances, expenses, currentGroup]);

  const participants = useMemo(() => {
    if (!members || !balances || !expenses || !eventData) return [];
    
    return members.map(member => {
      const balance = balances.find(b => b.user_id === member.user_id);
      const memberExpenses = expenses.filter(expense => expense.paid_by_user?.id === member.user_id);
      
      const totalSpent = memberExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      const memberBalance = balance ? balance.balance : 0;
      const lastExpense = memberExpenses.length > 0 ? memberExpenses[memberExpenses.length - 1] : null;
      
      const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
          return 'только что';
        } else if (diffInHours < 24) {
          return `${diffInHours} час${diffInHours > 1 ? 'а' : ''} назад`;
        } else {
          const diffInDays = Math.floor(diffInHours / 24);
          return `${diffInDays} день${diffInDays > 1 ? 'а' : ''} назад`;
        }
      };
      
      return {
        id: member.user_id.toString(),
        name: `${member.profile_first_name || member.first_name} ${member.profile_last_name || member.last_name || ''}`.trim(),
        totalSpent,
                 shareAmount: eventData.sharePerPerson,
        balance: memberBalance,
        expensesCount: memberExpenses.length,
        lastExpense: lastExpense?.description || null,
        lastExpenseTime: lastExpense ? getTimeAgo(lastExpense.created_at) : null,
        isAdmin: member.role === 'admin',
        isCurrentUser: false, // Simplified - would need current user ID comparison
        status: memberBalance === 0 ? 'settled' as const : 
                memberBalance > 0 ? 'owed' as const : 'owes' as const,
        avatar_url: undefined
      };
    });
  }, [members, balances, expenses, eventData]);

  // Loading state
  if (membersLoading || balancesLoading || expensesLoading) {
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
            Загрузка участников...
          </Text>
        </Stack>
      </Box>
    );
  }

  // Error state
  if (membersError || balancesError || expensesError) {
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
          {membersError || balancesError || expensesError}
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
          Выберите группу для просмотра участников
        </Alert>
      </Box>
    );
  }

  const groupMembers = members || [];
  const allBalances = balances || [];
  const allExpenses = expenses || [];

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

  const getStatusIcon = (status: string, balance: number) => {
    if (status === 'settled' || balance === 0) return '✅';
    if (status === 'owed' || balance > 0) return '💰';
    return '💸';
  };

  const getStatusText = (status: string, balance: number) => {
    if (balance === 0) return 'Рассчитан';
    if (balance > 0) return 'Получит';
    return 'Должен';
  };

  const handleRefresh = () => {
    refetchMembers();
  };

  const handleMergeUsers = async () => {
    if (!selectedUserForMerge || !selectedMainUser || !currentGroup) return;
    
    setMergeLoading(true);
    try {
      const result = await api.group.mergeUsers(
        currentGroup.group_id,
        parseInt(selectedUserForMerge),
        parseInt(selectedMainUser)
      );
      
      if (result.success) {
        // Close modal and refresh data
        setMergeModalOpened(false);
        setSelectedUserForMerge(null);
        setSelectedMainUser(null);
        refetchMembers();
      } else {
        console.error('Failed to merge users:', result.message);
      }
    } catch (error) {
      console.error('Error merging users:', error);
    } finally {
      setMergeLoading(false);
    }
  };

  const openMergeModal = (userId: string) => {
    setSelectedUserForMerge(userId);
    setMergeModalOpened(true);
  };

  // Получаем второго пользователя для объединения (админ)
  const getSecondUserForMerge = () => {
    if (!selectedUserForMerge) return null;
    // Находим админа (пользователя с ролью admin)
    const adminUser = participants.find(p => p.isAdmin);
    return adminUser;
  };

  // Получаем информацию об объединениях
  const getMergeInfo = (userId: string) => {
    const member = members?.find(m => m.user_id.toString() === userId);
    if (member?.merged_with_user_id) {
      const mergedWithMember = members?.find(m => m.user_id === member.merged_with_user_id);
      return mergedWithMember ? `${mergedWithMember.profile_first_name || mergedWithMember.first_name} ${mergedWithMember.profile_last_name || mergedWithMember.last_name || ''}`.trim() : 'Unknown';
    }
    return null;
  };

  // Проверяем, можно ли объединиться с пользователем
  const canMergeWith = (userId: string) => {
    const member = members?.find(m => m.user_id.toString() === userId);
    // Нельзя объединиться если уже объединен или если кто-то объединен с ним
    const isNotMerged = !member?.merged_with_user_id && !members?.some(m => m.merged_with_user_id === member?.user_id);
    
    // Проверяем, что это НЕ текущий пользователь (нельзя объединиться с самим собой)
    // Нужно получить текущего пользователя из контекста или props
    const currentUserId = user?.id || currentGroup?.admin_user_id;
    const isNotCurrentUser = member?.user_id.toString() !== currentUserId?.toString();
    
    return isNotMerged && isNotCurrentUser;
  };

  const sortedParticipants = [...participants].sort((a, b) => b.balance - a.balance);

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
          👥 Участники
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
          <IconUsers size={20} />
        </Button>
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
              Общая информация
            </Text>
          </Group>
          
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text 
                size="sm"
                style={{ color: designColors.text.secondary }}
              >
                Общие расходы:
              </Text>
              <Text 
                size="lg"
                style={{ 
                  color: designColors.text.primary,
                  fontWeight: 600
                }}
              >
                {formatCurrency(eventData?.totalExpenses || 0)}
              </Text>
            </Group>
            
            <Group justify="space-between" align="center">
              <Text 
                size="sm"
                style={{ color: designColors.text.secondary }}
              >
                Доля каждого:
              </Text>
              <Text 
                size="md"
                style={{ 
                  color: designColors.accents.fabButton,
                  fontWeight: 600
                }}
              >
                {formatCurrency(eventData?.sharePerPerson || 0)}
              </Text>
            </Group>
            
            <Group justify="space-between" align="center">
              <Text 
                size="sm"
                style={{ color: designColors.text.secondary }}
              >
                Участников / Расходов:
              </Text>
              <Text 
                size="sm"
                style={{ color: designColors.text.secondary }}
              >
                {eventData?.participantsCount || 0} участников • {eventData?.expensesCount || 0} расходов
              </Text>
            </Group>
          </Stack>
        </Card>

        {/* Participants Statistics */}
        <Group gap="md" align="stretch">
          <Card
            radius="lg"
            p="md"
            style={{
              backgroundColor: designColors.backgrounds.cards,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              flex: 1,
              height: '90px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Group gap="xs" style={{ flexWrap: 'nowrap' }}>
              <Text size="sm" style={{ color: designColors.text.secondary, lineHeight: 1.2 }}>
                Должны получить
              </Text>
            </Group>
            <Text 
              size="lg"
              style={{ 
                color: designColors.semantic.success,
                fontWeight: 600
              }}
            >
              {participants.filter(p => p.balance > 0).length}
            </Text>
          </Card>

          <Card
            radius="lg"
            p="md"
            style={{
              backgroundColor: designColors.backgrounds.cards,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              flex: 1,
              height: '90px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Group gap="xs" style={{ flexWrap: 'nowrap' }}>
              <Text size="sm" style={{ color: designColors.text.secondary, lineHeight: 1.2 }}>
                Должны доплатить
              </Text>
            </Group>
            <Text 
              size="lg"
              style={{ 
                color: designColors.semantic.error,
                fontWeight: 600
              }}
            >
              {participants.filter(p => p.balance < 0).length}
            </Text>
          </Card>

          <Card
            radius="lg"
            p="md"
            style={{
              backgroundColor: designColors.backgrounds.cards,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              flex: 1,
              height: '90px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Group gap="xs" style={{ flexWrap: 'nowrap' }}>
              <Text size="sm" style={{ color: designColors.text.secondary, lineHeight: 1.2 }}>
                Рассчитаны
              </Text>
            </Group>
            <Text 
              size="lg"
              style={{ 
                color: designColors.semantic.success,
                fontWeight: 600
              }}
            >
              {participants.filter(p => p.balance === 0).length}
            </Text>
          </Card>
        </Group>

        {/* Participants List */}
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text 
              size="md"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              Список участников
            </Text>
            <Text 
              size="sm"
              style={{ color: designColors.text.secondary }}
            >
              {participants.length} участник{participants.length > 1 ? 'а' : ''}
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
            {sortedParticipants.map((participant, index) => (
              <Box
                key={participant.id}
                style={{
                  padding: '16px',
                  borderBottom: index < sortedParticipants.length - 1 ? 
                    `1px solid ${designColors.text.tertiary}` : 'none',
                  backgroundColor: participant.isCurrentUser ? 
                    designColors.accents.fabButton + '10' : 'transparent',
                  cursor: 'pointer'
                }}
                onClick={() => onViewProfile?.(participant.id)}
              >
                <Group justify="space-between" align="flex-start">
                  <Group gap="sm" align="flex-start">
                    {/* Avatar */}
                    <Box
                      style={{
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: designColors.amounts.positive + '20',
                        borderRadius: '50%',
                        fontSize: '20px'
                      }}
                    >
                      {participant.avatar_url ? (
                        <img 
                          src={participant.avatar_url} 
                          alt={participant.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }} 
                        />
                      ) : (
                        getStatusIcon(participant.status, participant.balance)
                      )}
                    </Box>
                    
                    <Stack gap={2} style={{ flex: 1 }}>
                      <Group gap="xs" align="center">
                        <Text 
                          size="md"
                          style={{ 
                            color: designColors.text.primary,
                            fontWeight: 500
                          }}
                        >
                          {participant.name}
                        </Text>
                        {participant.isAdmin && (
                          <IconCrown 
                            size={16} 
                            style={{ color: designColors.accents.fabButton }} 
                          />
                        )}
                        {participant.isCurrentUser && (
                          <Badge color="blue" size="xs">
                            Вы
                          </Badge>
                        )}
                      </Group>
                      
                      <Text 
                        size="sm"
                        style={{ color: designColors.text.secondary }}
                      >
                        Потратил: {formatCurrency(participant.totalSpent)} • 
                        Доля: {formatCurrency(participant.shareAmount)}
                      </Text>
                      
                      {participant.lastExpense && (
                        <Group gap="xs">
                          <Text 
                            size="xs"
                            style={{ 
                              color: designColors.text.tertiary,
                              fontStyle: 'italic'
                            }}
                          >
                            Последний расход: {participant.lastExpense}
                          </Text>
                          <Text 
                            size="xs"
                            style={{ color: designColors.text.tertiary }}
                          >
                            • {participant.lastExpenseTime}
                          </Text>
                        </Group>
                      )}
                      
                      <Group gap="xs">
                        <Text 
                          size="xs"
                          style={{ color: designColors.text.tertiary }}
                        >
                          Расходов: {participant.expensesCount}
                        </Text>
                      </Group>
                    </Stack>
                  </Group>
                  
                  <Stack gap={2} align="flex-end">
                    <Group gap="xs" align="center">
                      {canMergeWith(participant.id) && (
                        <Button
                          size="xs"
                          variant="filled"
                          onClick={(e) => {
                            e.stopPropagation();
                            openMergeModal(participant.id);
                          }}
                          style={{
                            backgroundColor: designColors.accents.fabButton,
                            color: 'white',
                            fontWeight: 500
                          }}
                          title="Объединить с другим пользователем"
                        >
                          Объединиться
                        </Button>
                      )}
                      {getMergeInfo(participant.id) && (
                        <Badge color="blue" size="xs">
                          Объединен с {getMergeInfo(participant.id)}
                        </Badge>
                      )}
                    </Group>
                    
                    <Text 
                      size="lg"
                      style={{ 
                        color: getBalanceColor(participant.balance),
                        fontWeight: 600
                      }}
                    >
                      {participant.balance === 0 ? '±0' :
                       participant.balance > 0 ? 
                         `+${formatCurrency(participant.balance)}` :
                         `-${formatCurrency(Math.abs(participant.balance))}`
                      }
                    </Text>
                    
                    <Badge 
                      color={participant.balance === 0 ? 'green' :
                             participant.balance > 0 ? 'green' : 'red'}
                      size="xs"
                    >
                      {getStatusText(participant.status, participant.balance)}
                    </Badge>
                  </Stack>
                </Group>
              </Box>
            ))}
          </Card>
        </Stack>

        {/* Balance Explanation */}
        <Card
          radius="lg"
          p="md"
          style={{
            backgroundColor: designColors.backgrounds.cards,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Group gap="xs" mb="sm">
            <IconCalculator size={16} style={{ color: designColors.text.secondary }} />
            <Text 
              size="sm"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              Как рассчитывается баланс
            </Text>
          </Group>
          
          <Text 
            size="sm"
            style={{ 
              color: designColors.text.secondary,
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap'
            }}
          >
            💡 <strong>Формула:</strong> Баланс = Потратил - Доля участника{'\n'}
            💰 <strong>Положительный баланс</strong> = участник переплатил, ему должны{'\n'}
            💸 <strong>Отрицательный баланс</strong> = участник должен доплатить{'\n'}
            ✅ <strong>Нулевой баланс</strong> = участник полностью рассчитался
          </Text>
        </Card>
      </Stack>

      {/* Merge Users Modal */}
      <Modal
        opened={mergeModalOpened}
        onClose={() => {
          setMergeModalOpened(false);
          setSelectedUserForMerge(null);
          setSelectedMainUser(null);
        }}
        title="Объединить пользователей"
        size="md"
        centered
      >
        <Stack gap="md">
          {selectedUserForMerge && (
            <>
              <Text size="sm" style={{ color: designColors.text.secondary }}>
                Выберите, кто будет главным пользователем:
              </Text>
              
              <Group gap="md">
                <Button
                  variant={selectedMainUser === selectedUserForMerge ? "filled" : "outline"}
                  onClick={() => setSelectedMainUser(selectedUserForMerge)}
                  style={{ flex: 1 }}
                >
                  {participants.find(p => p.id === selectedUserForMerge)?.name}
                </Button>
                
                <Text size="sm" style={{ color: designColors.text.secondary }}>
                  или
                </Text>
                
                <Button
                  variant={selectedMainUser === getSecondUserForMerge()?.id ? "filled" : "outline"}
                  onClick={() => setSelectedMainUser(getSecondUserForMerge()?.id || null)}
                  style={{ flex: 1 }}
                >
                  {getSecondUserForMerge()?.name} (Админ)
                </Button>
              </Group>
              
              {selectedMainUser && (
                <Alert color="blue" title="Подтверждение объединения">
                  <Text size="sm">
                    Все расходы {participants.find(p => p.id === selectedUserForMerge)?.name} будут привязаны к {participants.find(p => p.id === selectedMainUser)?.name}
                  </Text>
                </Alert>
              )}
            </>
          )}
          
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={() => {
                setMergeModalOpened(false);
                setSelectedUserForMerge(null);
                setSelectedMainUser(null);
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleMergeUsers}
              loading={mergeLoading}
              disabled={!selectedMainUser}
              color="blue"
            >
              Подтвердить объединение
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
} 