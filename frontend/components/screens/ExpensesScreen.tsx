'use client';

import { AddExpenseModal } from '@/components/modals/AddExpenseModal';
import { useTelegram } from '@/components/providers/TelegramProvider';
import { useExpenses, useGroupMembers, useUser } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { designColors } from '@/lib/design-system';
import { useAppStore } from '@/stores/useAppStore';
import { ActionIcon, Alert, Badge, Box, Button, Card, Group, Loader, Select, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconCalendar, IconDownload, IconEdit, IconFilter, IconPlus, IconReceipt, IconTrash, IconUsers, IconFileDescription } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';

interface ExpensesScreenProps {
  onAddExpense: () => void;
  onRefetchExpenses?: (refetchFn: () => void) => void;
}

export function ExpensesScreen({ onAddExpense, onRefetchExpenses }: ExpensesScreenProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [exportLoading, setExportLoading] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editModalOpened, setEditModalOpened] = useState(false);
  
  const currentGroup = useAppStore(state => state.currentGroup);
  const groupId = currentGroup?.group_id;
  
  // Check if collection is completed
  const isCollectionCompleted = currentGroup?.status === 'COMPLETED';
  const telegram = useTelegram();
  
  // API hooks - всегда вызываются до любых условных returns
  const { expenses, loading: expensesLoading, error: expensesError, refetch: refetchExpenses } = useExpenses(groupId || 0);
  const { members, loading: membersLoading, error: membersError } = useGroupMembers(groupId || 0);
  const { user, loading: userLoading, error: userError } = useUser(groupId);

  // Excel export function
  const handleExportExcel = async () => {
    if (!groupId || exportLoading) return;
    
    setExportLoading(true);
    try {
      const result = await api.expense.exportExcel(groupId);
      
      if (result.success && result.data) {
        // Download file through Telegram
        if (result.data.download_url && result.data.filename) {
          telegram.downloadFile(result.data.download_url, result.data.filename);
        }
      } else {
        console.error('Excel export error:', result.message);
        // TODO: Show error notification
      }
      
    } catch (error) {
      console.error('Excel export error:', error);
      // TODO: Show error notification
    } finally {
      setExportLoading(false);
    }
  };

  // PDF export function
  const handleExportPdf = async () => {
    if (!groupId || exportLoading) return;
    
    setExportLoading(true);
    try {
      const result = await api.report.export(groupId, 'pdf');
      
      if (result.success && result.data) {
        // Download file through Telegram
        if (result.data.download_url && result.data.filename) {
          telegram.downloadFile(result.data.download_url, result.data.filename);
        }
      } else {
        console.error('PDF export error:', result.message);
        // TODO: Show error notification
      }
      
    } catch (error) {
      console.error('PDF export error:', error);
      // TODO: Show error notification
    } finally {
      setExportLoading(false);
    }
  };

  // Edit expense function
  const handleEditExpense = async (expenseId: number, updates: any) => {
    try {
      const result = await api.expense.update(expenseId, updates);
      
      if (result.success) {
        // Refresh expenses list
        refetchExpenses();
        setEditModalOpened(false);
        setEditingExpense(null);
      } else {
        console.error('Edit expense error:', result.message);
        // TODO: Show error notification
      }
      
    } catch (error) {
      console.error('Edit expense error:', error);
      // TODO: Show error notification
    }
  };

  // Delete expense function
  const handleDeleteExpense = async (expenseId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот расход?')) return;
    
    try {
      const result = await api.expense.delete(expenseId);
      
      if (result.success) {
        // Refresh expenses list
        refetchExpenses();
      } else {
        console.error('Delete expense error:', result.message);
        // TODO: Show error notification
      }
      
    } catch (error) {
      console.error('Delete expense error:', error);
      // TODO: Show error notification
    }
  };

  // Open edit modal
  const handleOpenEditModal = (expense: any) => {
    console.log('Opening edit modal for expense:', expense);
    setEditingExpense(expense);
    setEditModalOpened(true);
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setEditModalOpened(false);
    setEditingExpense(null);
  };

  // Register refetch function with parent component
  useEffect(() => {
    if (onRefetchExpenses) {
      onRefetchExpenses(refetchExpenses);
    }
  }, [onRefetchExpenses, refetchExpenses]);

  // Prepare data
  const allExpenses = expenses || [];
  const groupMembers = members || [];
  const currentUser = user;

  // Calculate event data and user expenses together
  const { eventData, userExpenses } = useMemo(() => {
    const totalExpenses = allExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    const userExpensesList = allExpenses.filter(expense => 
      expense.is_paid_by_current_user
    );
    const totalSpent = userExpensesList.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const shareOfTotal = totalExpenses > 0 ? (totalSpent / totalExpenses * 100) : 0;
    
    return {
      eventData: {
        title: currentGroup?.group_name || '',
        totalExpenses,
        expensesCount: allExpenses.length,
        participantsCount: groupMembers.length
      },
      userExpenses: {
        totalSpent,
        expensesCount: userExpensesList.length,
        shareOfTotal: Math.round(shareOfTotal)
      }
    };
  }, [allExpenses, groupMembers, currentGroup, currentUser]);

  // Фильтрация расходов
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(expense => {
      const isCurrentUser = expense.is_paid_by_current_user;
      const matchesFilter = selectedFilter === 'all' || 
                           (selectedFilter === 'my' && isCurrentUser) ||
                           (selectedFilter === 'others' && !isCurrentUser);
      
      const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
      
      return matchesFilter && matchesCategory;
    });
  }, [allExpenses, selectedFilter, selectedCategory]);

  // Sort expenses by date (newest first)
  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [filteredExpenses]);

  // Условные returns только после всех hooks
  // Loading state
  if (expensesLoading || membersLoading || userLoading) {
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
            Загрузка расходов...
          </Text>
        </Stack>
      </Box>
    );
  }

  // Error state
  if (expensesError || membersError || userError) {
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
          {expensesError || membersError || userError}
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
          Выберите группу для просмотра расходов
        </Alert>
      </Box>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0
    }).format(amount) + ' ₽';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return '🍖';
      case 'drinks': return '🍺';
      case 'transport': return '🚗';
      case 'accommodation': return '🏠';
      case 'entertainment': return '🎉';
      default: return '💰';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'food': return 'Еда';
      case 'drinks': return 'Напитки';
      case 'transport': return 'Транспорт';
      case 'accommodation': return 'Проживание';
      case 'entertainment': return 'Развлечения';
      default: return 'Прочее';
    }
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Сегодня, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const filterOptions = [
    { value: 'all', label: 'Все расходы' },
    { value: 'my', label: 'Мои расходы' },
    { value: 'others', label: 'Других участников' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'Все категории' },
    { value: 'food', label: 'Еда' },
    { value: 'drinks', label: 'Напитки' },
    { value: 'transport', label: 'Транспорт' },
    { value: 'accommodation', label: 'Проживание' },
    { value: 'entertainment', label: 'Развлечения' }
  ];

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
          💰 Расходы
        </Text>
        
        <Button
          variant="subtle"
          size="sm"
          onClick={refetchExpenses}
          styles={{
            root: {
              color: designColors.text.secondary
            }
          }}
        >
          <IconFilter size={20} />
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
            <IconReceipt size={20} style={{ color: designColors.accents.fabButton }} />
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
                {formatCurrency(eventData.totalExpenses)}
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
                size="sm"
                style={{ color: designColors.text.secondary }}
              >
                Всего расходов: {eventData.expensesCount}
              </Text>
              <Text 
                size="sm"
                style={{ color: designColors.text.secondary }}
              >
                На {eventData.participantsCount} участников
              </Text>
            </Group>
          </Stack>
        </Card>

        {/* User Expenses Summary */}
        <Card
          radius="lg"
          p="lg"
          style={{
            backgroundColor: designColors.backgrounds.cards,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Group justify="space-between" align="center" mb="md">
            <Text 
              size="md"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              📊 Мои расходы
            </Text>
            <Badge 
              color="blue"
              size="sm"
            >
              {userExpenses.shareOfTotal}% от общих
            </Badge>
          </Group>
          
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Text 
                size="lg"
                style={{ 
                  color: designColors.amounts.positive,
                  fontWeight: 600
                }}
              >
                {formatCurrency(userExpenses.totalSpent)}
              </Text>
              <Text 
                size="sm"
                style={{ color: designColors.text.secondary }}
              >
                {userExpenses.expensesCount} расход{userExpenses.expensesCount > 1 ? 'а' : ''}
              </Text>
            </Stack>
            
            <Button 
              leftSection={<IconPlus size={16} />}
              onClick={isCollectionCompleted ? undefined : onAddExpense}
              disabled={isCollectionCompleted}
              styles={{
                root: {
                  backgroundColor: isCollectionCompleted ? designColors.backgrounds.secondary : designColors.accents.fabButton,
                  color: isCollectionCompleted ? designColors.text.secondary : designColors.text.primary,
                  paddingLeft: '44px', // Увеличиваем левый отступ для иконки
                  opacity: isCollectionCompleted ? 0.6 : 1
                }
              }}
            >
              {isCollectionCompleted ? 'Сбор завершён' : 'Добавить'}
            </Button>
          </Group>
        </Card>

        {/* Filters */}
        <Group gap="md" align="center">
          <Text 
            size="sm"
            style={{ color: designColors.text.secondary }}
          >
            Показать:
          </Text>
          
          <Select
            value={selectedFilter}
            onChange={(value) => value && setSelectedFilter(value)}
            data={filterOptions}
            styles={{
              input: {
                backgroundColor: designColors.text.tertiary,
                color: designColors.text.primary,
                border: 'none',
                borderRadius: '8px',
                minWidth: '140px'
              }
            }}
          />

          <Select
            value={selectedCategory}
            onChange={(value) => value && setSelectedCategory(value)}
            data={categoryOptions}
            styles={{
              input: {
                backgroundColor: designColors.text.tertiary,
                color: designColors.text.primary,
                border: 'none',
                borderRadius: '8px',
                minWidth: '140px'
              }
            }}
          />
        </Group>

        {/* Expenses List */}
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text 
              size="md"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              История расходов
            </Text>
            
            <Group gap="sm" align="center">
              <Text 
                size="sm"
                style={{ color: designColors.text.secondary }}
              >
                {sortedExpenses.length} из {allExpenses.length}
              </Text>
              
              {sortedExpenses.length > 0 && (
                <>
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconDownload size={14} />}
                    onClick={handleExportExcel}
                    loading={exportLoading}
                    style={{
                      backgroundColor: designColors.accents.fabButton + '20',
                      color: designColors.accents.fabButton,
                      border: 'none'
                    }}
                  >
                    Excel
                  </Button>
                  
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconFileDescription size={14} />}
                    onClick={handleExportPdf}
                    loading={exportLoading}
                    style={{
                      backgroundColor: designColors.semantic.error + '20',
                      color: designColors.semantic.error,
                      border: 'none'
                    }}
                  >
                    PDF
                  </Button>
                </>
              )}
            </Group>
          </Group>
          
          {sortedExpenses.length > 0 ? (
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
              {sortedExpenses.map((expense, index) => {
                const isCurrentUser = expense.is_paid_by_current_user;
                const isAdmin = user?.group_role === 'admin';
                const canEdit = isCurrentUser || isAdmin;
                
                // Debug logging
                console.log('🔍 Expense debug:', {
                  expenseId: expense.id,
                  isCurrentUser,
                  isAdmin,
                  canEdit,
                  userRole: user?.group_role,
                  paidByCurrentUser: expense.is_paid_by_current_user
                });
                const participantCount = expense.participants_count || groupMembers.length;
                const amountPerPerson = parseFloat(expense.amount) / participantCount;
                
                return (
                  <Box
                    key={expense.id}
                    style={{
                      padding: '16px',
                      borderBottom: index < sortedExpenses.length - 1 ? 
                        `1px solid ${designColors.text.tertiary}` : 'none',
                      backgroundColor: isCurrentUser ? 
                        designColors.accents.fabButton + '10' : 'transparent'
                    }}
                  >
                    <Group justify="space-between" align="flex-start">
                      <Group gap="sm" align="flex-start">
                        {/* Category Icon */}
                        <Box
                          style={{
                            fontSize: '20px',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isCurrentUser ? 
                              designColors.accents.fabButton + '20' : 
                              designColors.amounts.positive + '20',
                            borderRadius: '12px',
                            marginTop: '2px'
                          }}
                        >
                          {getCategoryIcon(expense.category)}
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
                              {expense.description}
                            </Text>
                            {isCurrentUser && (
                              <Badge color="blue" size="xs">
                                Ваш расход
                              </Badge>
                            )}
                          </Group>
                          
                          <Text 
                            size="sm"
                            style={{ color: designColors.text.secondary }}
                          >
                            Оплатил: {expense.paid_by_name || 'Неизвестно'}
                          </Text>
                          
                          <Group gap="xs">
                            <IconCalendar size={12} style={{ color: designColors.text.tertiary }} />
                            <Text 
                              size="xs"
                              style={{ color: designColors.text.tertiary }}
                            >
                              {getTimeAgo(expense.created_at)}
                            </Text>
                            <Badge size="xs" color="gray">
                              {getCategoryName(expense.category)}
                            </Badge>
                          </Group>
                          
                          <Group gap="xs">
                            <IconUsers size={12} style={{ color: designColors.text.tertiary }} />
                            <Text 
                              size="xs"
                              style={{ color: designColors.text.tertiary }}
                            >
                              Поровну на {participantCount} чел.
                            </Text>
                            <Text 
                              size="xs"
                              style={{ 
                                color: designColors.amounts.positive,
                                fontWeight: 500
                              }}
                            >
                              {formatCurrency(amountPerPerson)} с каждого
                            </Text>
                          </Group>
                        </Stack>
                      </Group>
                      
                      <Stack gap={2} align="flex-end">
                        <Group gap="xs" align="center">
                          <Text 
                            size="lg"
                            style={{ 
                              color: designColors.amounts.positive,
                              fontWeight: 600
                            }}
                          >
                            {formatCurrency(parseFloat(expense.amount))}
                          </Text>
                          
                          {/* Action buttons for editable expenses */}
                          {canEdit && (
                            <Group gap="xs" align="center">
                              <ActionIcon
                                variant="filled"
                                size="md"
                                color="blue"
                                onClick={() => handleOpenEditModal(expense)}
                                style={{
                                  backgroundColor: '#4A90E2',
                                  color: '#FFFFFF',
                                  border: '2px solid #4A90E2',
                                  boxShadow: '0 2px 8px rgba(74, 144, 226, 0.3)',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    backgroundColor: '#357ABD',
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 4px 12px rgba(74, 144, 226, 0.4)'
                                  }
                                }}
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                              
                              <ActionIcon
                                variant="filled"
                                size="md"
                                color="red"
                                onClick={() => handleDeleteExpense(expense.id)}
                                style={{
                                  backgroundColor: '#FF6B6B',
                                  color: '#FFFFFF',
                                  border: '2px solid #FF6B6B',
                                  boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    backgroundColor: '#E55A5A',
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.4)'
                                  }
                                }}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Group>
                          )}
                        </Group>
                        
                        <Badge 
                          color="green"
                          size="xs"
                        >
                          {participantCount === groupMembers.length ? 'На всех' : `На ${participantCount} чел.`}
                        </Badge>
                        
                        <Text 
                          size="xs"
                          style={{ color: designColors.text.tertiary }}
                        >
                          {formatDate(expense.created_at)}
                        </Text>
                      </Stack>
                    </Group>
                  </Box>
                );
              })}
            </Card>
          ) : (
            <Card
              radius="lg"
              p="lg"
              style={{
                backgroundColor: designColors.backgrounds.cards,
                border: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                textAlign: 'center'
              }}
            >
              <Stack gap="md" align="center">
                <Text 
                  style={{ fontSize: '48px' }}
                >
                  📝
                </Text>
                <Text 
                  size="lg"
                  style={{ 
                    color: designColors.text.primary,
                    fontWeight: 600
                  }}
                >
                  Расходы не найдены
                </Text>
                <Text 
                  size="sm"
                  style={{ color: designColors.text.secondary }}
                >
                  Попробуйте изменить фильтры или добавить первый расход
                </Text>
                <Button 
                  leftSection={<IconPlus size={16} />}
                  onClick={isCollectionCompleted ? undefined : onAddExpense}
                  disabled={isCollectionCompleted}
                  styles={{
                    root: {
                      backgroundColor: isCollectionCompleted ? designColors.backgrounds.secondary : designColors.accents.fabButton,
                      color: isCollectionCompleted ? designColors.text.secondary : designColors.text.primary,
                      opacity: isCollectionCompleted ? 0.6 : 1
                    }
                  }}
                >
                  {isCollectionCompleted ? 'Сбор завершён' : 'Добавить расход'}
                </Button>
              </Stack>
            </Card>
          )}
        </Stack>

        {/* Add Expense Button */}
        <Button 
          size="lg"
          radius="md"
          leftSection={<IconPlus size={20} />}
          onClick={isCollectionCompleted ? undefined : onAddExpense}
          disabled={isCollectionCompleted}
          styles={{
            root: {
              backgroundColor: isCollectionCompleted ? designColors.backgrounds.secondary : designColors.accents.fabButton,
              color: isCollectionCompleted ? designColors.text.secondary : designColors.text.primary,
              marginTop: '20px',
              opacity: isCollectionCompleted ? 0.6 : 1,
              paddingLeft: '48px' // Увеличиваем левый отступ для иконки
            }
          }}
        >
          {isCollectionCompleted ? 'Сбор завершён' : 'Добавить новый расход'}
        </Button>
      </Stack>
      
      {/* Edit Expense Modal */}
      <AddExpenseModal
        opened={editModalOpened}
        onClose={handleCloseEditModal}
        groupId={groupId}
        editingExpense={editingExpense}
        mode="edit"
        onSubmit={async (expenseData: any) => {
          if (editingExpense?.id) {
            await handleEditExpense(editingExpense.id, {
              description: expenseData.description,
              amount: expenseData.amount,
              category: expenseData.category
            });
          }
        }}
      />
    </Box>
  );
} 