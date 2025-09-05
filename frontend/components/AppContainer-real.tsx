'use client';

import { designColors } from '@/lib/design-system'
import { ActionIcon, Box } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

// Import hooks
import { useAuth } from '@/hooks/useApi'
import { useAppStore } from '@/stores/useAppStore'

// Import screens
import { AdminScreen } from './screens/AdminScreen'
import { ExpensesScreen } from './screens/ExpensesScreen'
import { GroupSettingsScreen } from './screens/GroupSettingsScreen'
import { HomeScreen } from './screens/HomeScreen'
import { MoneyScreen } from './screens/MoneyScreen'
import { ParticipantsScreen } from './screens/ParticipantsScreen'
import { RegistrationScreen } from './screens/RegistrationScreen'
import { ReportsScreen } from './screens/ReportsScreen'

// Import navigation
import { BottomNavigation } from './navigation/BottomNavigation'

// Import modals
import { AddExpenseModal } from './modals/AddExpenseModal'

// Import UI components
import { LoadingState } from './ui/LoadingState'

interface AppContainerProps {
  isRegistered: boolean;
  onCompleteRegistration: (userData: { firstName: string; lastName: string; rulesAccepted: boolean; }) => void;
}

export function AppContainer({ isRegistered, onCompleteRegistration }: AppContainerProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'debts' | 'participants' | 'admin'>('dashboard');
  const [currentScreen, setCurrentScreen] = useState<string>('main');
  const [addExpenseModalOpened, setAddExpenseModalOpened] = useState(false);

  // Mock user data similar to main AppContainer
  const [userData, setUserData] = useState({
    firstName: 'Иван',
    lastName: 'Петров',
    userRole: 'admin' as 'admin' | 'participant'
  });

  // Auth and store
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { 
    user, 
    currentGroup, 
    groups, 
    isLoading, 
    fetchUserProfile,
    fetchUserGroups,
    fetchGroupExpenses,
    fetchGroupBalances,
    setCurrentGroup,
  } = useAppStore();

  // Initialize data on auth
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserProfile();
      fetchUserGroups();
    }
  }, [isAuthenticated, user, fetchUserProfile, fetchUserGroups]);

  // Set default group
  useEffect(() => {
    if (groups.length > 0 && !currentGroup) {
      setCurrentGroup(groups[0]);
    }
  }, [groups, currentGroup, setCurrentGroup]);

  // Fetch group data when current group changes
      useEffect(() => {
      if (currentGroup?.group_id) {
        fetchGroupExpenses(currentGroup.group_id);
        fetchGroupBalances(currentGroup.group_id);
      }
    }, [currentGroup?.group_id, fetchGroupExpenses, fetchGroupBalances]);

  // Handler functions
  const handleAddExpense = () => {
    setAddExpenseModalOpened(true);
  };

  const handleViewExpenses = () => {
    setActiveTab('expenses');
  };

  const handleViewDebts = () => {
    setActiveTab('debts');
  };

  const handleViewParticipants = () => {
    setActiveTab('participants');
  };

  const handleOpenAdmin = () => {
    setActiveTab('admin');
  };



  const handleSendTransfer = async (toUserId: string, amount: number) => {
    if (!currentGroup) {
      console.error('No current group selected');
      return;
    }

    try {
              const transferData = {
          to_user_id: parseInt(toUserId),
          amount: amount,
          group_id: currentGroup.group_id,
          description: 'Перевод через WebApp'
        };

      const response = await useAppStore.getState().createExpense(transferData);
      if (response) {
        console.log('Transfer created successfully');
        // Обновляем балансы после создания перевода
        await useAppStore.getState().fetchGroupBalances(currentGroup.group_id);
      }
    } catch (error) {
      console.error('Error creating transfer:', error);
    }
  };



  const handleExpenseSubmit = async (expense: {
    amount: number;
    description: string;
    category: string;
    participants: string[];
    splitType: 'equal' | 'custom';
  }) => {
    if (!currentGroup) return;

          const expenseData = {
        group_id: currentGroup.group_id,
        amount: expense.amount,
        description: expense.description,
      category: expense.category,
      split_type: expense.splitType === 'equal' ? 'equal' : 'custom',
      participant_ids: expense.participants.map(p => parseInt(p))
    };

    const success = await useAppStore.getState().createExpense(expenseData);
    if (success) {
      console.log('Расход добавлен успешно');
      setAddExpenseModalOpened(false);
    } else {
      console.log('Ошибка добавления расхода');
    }
  };

  const handleCompleteRegistration = (regData: { 
    firstName: string; 
    lastName: string; 
    rulesAccepted: boolean; 
  }) => {
    setUserData(prev => ({
      ...prev,
      firstName: regData.firstName,
      lastName: regData.lastName
    }));
    
    onCompleteRegistration(regData);
  };



  const handleScreenNavigation = {
    onBackToProfile: () => setCurrentScreen('main'),
    onBackToMain: () => setCurrentScreen('main'),
  };

  // Admin handlers
  const adminHandlers = {
    onCollectionSettings: () => {
      setCurrentScreen('group-settings');
    },
    onParticipantManagement: () => {
      setCurrentScreen('group-settings');
    },
    onCompleteCollection: async () => {
      if (!currentGroup) return;
      
      try {
        const response = await useAppStore.getState().updateGroup(currentGroup.group_id, {
          status: 'completed'
        });
        if (response) {
          console.log('Group completed successfully');
          await useAppStore.getState().fetchUserGroups();
        }
      } catch (error) {
        console.error('Error completing group:', error);
      }
    },
    onRestartCollection: async () => {
      if (!currentGroup) return;
      
      try {
        const response = await useAppStore.getState().updateGroup(currentGroup.group_id, {
          status: 'active'
        });
        if (response) {
          console.log('Group restarted successfully');
          await useAppStore.getState().fetchUserGroups();
        }
      } catch (error) {
        console.error('Error restarting group:', error);
      }
    },
    onDeleteCollection: async () => {
      if (!currentGroup) return;
      
      const confirmed = window.confirm('Вы уверены, что хотите удалить эту группу? Это действие нельзя отменить.');
      if (!confirmed) return;
      
      try {
        const response = await useAppStore.getState().deleteGroup(currentGroup.group_id);
        if (response) {
          console.log('Group deleted successfully');
          setCurrentGroup(null);
          await useAppStore.getState().fetchUserGroups();
          setActiveTab('dashboard');
        }
      } catch (error) {
        console.error('Error deleting group:', error);
      }
    },
    onLogout: () => {
      // Очищаем токен и перенаправляем на регистрацию
      useAppStore.getState().clearAuth();
      setCurrentScreen('main');
      setActiveTab('dashboard');
    }
  };

  // Report handlers
  const reportHandlers = {
    onGenerateExcel: async (_period: string, _type: string) => {
      if (!currentGroup) return;
      
      try {
        const response = await useAppStore.getState().exportReport(currentGroup.group_id, 'excel');
        if (response) {
          console.log('Excel report generated successfully');
          // Здесь можно добавить скачивание файла
        }
      } catch (error) {
        console.error('Error generating Excel report:', error);
      }
    },
    onGeneratePdf: async (_period: string, _type: string) => {
      if (!currentGroup) return;
      
      try {
        const response = await useAppStore.getState().exportReport(currentGroup.group_id, 'pdf');
        if (response) {
          console.log('PDF report generated successfully');
          // Здесь можно добавить скачивание файла
        }
      } catch (error) {
        console.error('Error generating PDF report:', error);
      }
    }
  };

  // Group settings handlers
  const groupSettingsHandlers = {
    onInviteUser: async (data: { method: 'link' | 'phone' | 'email'; value: string }) => {
      if (!currentGroup) return;
      
      try {
        if (data.method === 'phone') {
          // Пока что просто логируем, в реальном приложении нужно найти пользователя по телефону
          console.log('Invite user by phone:', data.value);
        } else if (data.method === 'email') {
          // Пока что просто логируем, в реальном приложении нужно найти пользователя по email
          console.log('Invite user by email:', data.value);
        } else {
          // Для ссылки просто показываем уведомление
          console.log('Invite link shared');
        }
      } catch (error) {
        console.error('Error inviting user:', error);
      }
    },
    onRemoveUser: async (userId: string) => {
      if (!currentGroup) return;
      
      const confirmed = window.confirm('Вы уверены, что хотите удалить этого участника?');
      if (!confirmed) return;
      
      try {
        const response = await useAppStore.getState().removeGroupMember(currentGroup.group_id, parseInt(userId));
        if (response) {
          console.log('User removed successfully');
          await useAppStore.getState().fetchGroupBalances(currentGroup.group_id);
        }
      } catch (error) {
        console.error('Error removing user:', error);
      }
    },
    onChangeUserRole: async (userId: string, role: string) => {
      if (!currentGroup) return;
      
      try {
        const response = await useAppStore.getState().updateGroupMemberRole(currentGroup.group_id, parseInt(userId), role);
        if (response) {
          console.log('User role updated successfully');
          await useAppStore.getState().fetchGroupBalances(currentGroup.group_id);
        }
      } catch (error) {
        console.error('Error updating user role:', error);
      }
    }
  };

  // Money screen handlers
  const moneyHandlers = {
    onSendTransfer: handleSendTransfer,
    onConfirmTransfer: async (transferId: string) => {
      try {
        const response = await useAppStore.getState().confirmTransfer(parseInt(transferId));
        if (response && currentGroup) {
          console.log('Transfer confirmed successfully');
          await useAppStore.getState().fetchGroupBalances(currentGroup.group_id);
        }
      } catch (error) {
        console.error('Error confirming transfer:', error);
      }
    },
    onRejectTransfer: async (transferId: string) => {
      try {
        // Используем cancel метод для отклонения
        const response = await useAppStore.getState().cancelTransfer(parseInt(transferId));
        if (response && currentGroup) {
          console.log('Transfer rejected successfully');
          await useAppStore.getState().fetchGroupBalances(currentGroup.group_id);
        }
      } catch (error) {
        console.error('Error rejecting transfer:', error);
      }
    },
    onOptimizeDebts: async () => {
      if (!currentGroup) return;
      
      try {
        console.log('Optimizing debts for group:', currentGroup.group_id);
        // В реальном приложении здесь будет API для оптимизации долгов
        // Пока что просто обновляем балансы
        await useAppStore.getState().fetchGroupBalances(currentGroup.group_id);
      } catch (error) {
        console.error('Error optimizing debts:', error);
      }
    }
  };

  // If not registered, show registration screen
  if (!isRegistered) {
    return (
      <RegistrationScreen 
        onComplete={handleCompleteRegistration}
        groupRules="Добавляйте расходы честно и вовремя. Рассчитывайтесь согласно автоматическому расчету долгов."
      />
    );
  }

  // Loading state
  if (authLoading || isLoading) {
    return (
      <LoadingState 
        loading={true}
        error={null}
        data={null}
      />
    );
  }

  // Error state
  if (useAppStore.getState().error) {
    return (
      <LoadingState 
        loading={false}
        error={useAppStore.getState().error}
        data={null}
        onRetry={() => {
          useAppStore.getState().setError(null);
          if (isAuthenticated) {
            useAppStore.getState().fetchUserProfile();
            useAppStore.getState().fetchUserGroups();
          }
        }}
      />
    );
  }

  // Render current screen
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'reports':
        return (
          <ReportsScreen 
            onGenerateExcel={reportHandlers.onGenerateExcel}
            onGeneratePdf={reportHandlers.onGeneratePdf}
          />
        );
      case 'group-settings':
        return (
          <GroupSettingsScreen 
            {...handleScreenNavigation}
            onInviteUser={groupSettingsHandlers.onInviteUser}
            onRemoveUser={groupSettingsHandlers.onRemoveUser}
            onChangeUserRole={groupSettingsHandlers.onChangeUserRole}
          />
        );
      default:
        // Main app screens
        switch (activeTab) {
          case 'dashboard':
            return (
              <HomeScreen 
                onAddExpense={handleAddExpense}
                onViewExpenses={handleViewExpenses}
                onViewDebts={handleViewDebts}
                onViewParticipants={handleViewParticipants}
                onOpenAdmin={handleOpenAdmin}
              />
            );
          case 'expenses':
            return <ExpensesScreen onAddExpense={handleAddExpense} />;
          case 'debts':
            return (
              <MoneyScreen
                onSendTransfer={moneyHandlers.onSendTransfer}
                onConfirmTransfer={moneyHandlers.onConfirmTransfer}
                onRejectTransfer={moneyHandlers.onRejectTransfer}
                onOptimizeDebts={moneyHandlers.onOptimizeDebts}
              />
            );
          case 'participants':
            return <ParticipantsScreen />;
          case 'admin':
            return (
              <AdminScreen 
                userRole={userData.userRole}
                groupName={currentGroup?.group_name || 'Событие'}
                {...adminHandlers}
              />
            );
          default:
            return (
              <HomeScreen 
                onAddExpense={handleAddExpense}
                onViewExpenses={handleViewExpenses}
                onViewDebts={handleViewDebts}
                onViewParticipants={handleViewParticipants}
                onOpenAdmin={handleOpenAdmin}
              />
            );
        }
    }
  };

  return (
    <Box style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Main content area */}
      {renderCurrentScreen()}

      {/* Floating Action Button - only show on main screens */}
      {currentScreen === 'main' && (activeTab === 'dashboard' || activeTab === 'expenses') && (
        <ActionIcon
          size={60}
          radius="xl"
          style={{
            backgroundColor: designColors.accents.fabButton,
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
          onClick={handleAddExpense}
        >
          <IconPlus size={28} style={{ color: designColors.text.primary }} />
        </ActionIcon>
      )}

      {/* Bottom Navigation - only show on main screens */}
      {currentScreen === 'main' && (
        <BottomNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userRole={userData.userRole}
        />
      )}

      {/* Modals */}
      <AddExpenseModal
        opened={addExpenseModalOpened}
        onClose={() => setAddExpenseModalOpened(false)}
        onSubmit={handleExpenseSubmit}
      />
    </Box>
  );
} 