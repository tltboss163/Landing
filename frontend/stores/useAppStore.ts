import { api } from '@/lib/api'
import { AppState, Expense, GroupMember, User, UserBalance, UserGroup } from '@/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface AppStore extends AppState {
  // Actions
  setUser: (user: User | null) => void;
  setCurrentGroup: (group: UserGroup | null) => void;
  setGroups: (groups: UserGroup[]) => void;
  setGroupMembers: (members: GroupMember[]) => void;
  setExpenses: (expenses: Expense[]) => void;
  setUserBalances: (balances: UserBalance[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // API Actions
  login: (credentials: { telegram_id: number; username?: string }) => Promise<boolean>;
  validateTelegram: (initData: string) => Promise<boolean>;
  logout: () => void;
  clearAuth: () => void;
  
  // Data fetching
  fetchUserProfile: () => Promise<void>;
  fetchUserGroups: () => Promise<void>;
  fetchGroupExpenses: (groupId: number) => Promise<void>;
  fetchGroupBalances: (groupId: number) => Promise<void>;
  fetchGroupMembers: (groupId: number) => Promise<void>;
  fetchUserTransfers: (groupId?: number) => Promise<any[]>;
  
  // Data mutations
  createGroup: (groupData: any) => Promise<boolean>;
  createExpense: (expenseData: any) => Promise<boolean>;
  updateExpense: (id: number, expenseData: any) => Promise<boolean>;
  deleteExpense: (id: number) => Promise<boolean>;
  
  // Group management
  updateGroup: (groupId: number, groupData: any) => Promise<boolean>;
  deleteGroup: (groupId: number) => Promise<boolean>;
  completeCollection: (groupId: number) => Promise<boolean>;
  resumeCollection: (groupId: number) => Promise<boolean>;
  removeGroupMember: (groupId: number, userId: number) => Promise<boolean>;
  updateGroupMemberRole: (groupId: number, userId: number, role: string) => Promise<boolean>;
  
  // Transfers
  createTransfer: (transferData: any) => Promise<boolean>;
  confirmTransfer: (transferId: number) => Promise<boolean>;
  cancelTransfer: (transferId: number) => Promise<boolean>;
  
  // Reports
  exportReport: (groupId: number, format: 'pdf' | 'excel') => Promise<boolean>;
  
  // Utils
  reset: () => void;
}

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  currentGroup: null,
  groups: [],
  groupMembers: [],
  expenses: [],
  userBalances: [],
  isLoading: false,
  error: null,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Basic setters
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setCurrentGroup: (currentGroup) => set({ currentGroup }),
      setGroups: (groups) => set({ groups }),
      setGroupMembers: (groupMembers) => set({ groupMembers }),
      setExpenses: (expenses) => set({ expenses }),
      setUserBalances: (userBalances) => set({ userBalances }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // Authentication
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.auth.login(credentials);
          if (result.success && result.data) {
            api.setToken(result.data.access_token);
            set({ 
              isAuthenticated: true,
              isLoading: false 
            });
            return true;
          } else {
            set({ error: result.message || 'Login failed', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed', 
            isLoading: false 
          });
          return false;
        }
      },
      
      validateTelegram: async (initData) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.auth.validateTelegram(initData);
          if (result.success && result.data) {
            api.setToken(result.data.access_token);
            set({ 
              isAuthenticated: true,
              isLoading: false 
            });
            return true;
          } else {
            set({ error: result.message || 'Telegram validation failed', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Telegram validation failed', 
            isLoading: false 
          });
          return false;
        }
      },
      
      logout: () => {
        api.setToken(null);
        set({ ...initialState });
      },
      
      clearAuth: () => {
        api.setToken(null);
        set({ ...initialState });
      },
      
      // Data fetching
      fetchUserProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.user.getProfile();
          if (result.success && result.data) {
            set({ user: result.data, isLoading: false });
          } else {
            set({ error: result.message || 'Failed to fetch profile', isLoading: false });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch profile', 
            isLoading: false 
          });
        }
      },
      
      fetchUserGroups: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.user.getGroups();
          if (result.success && result.data) {
            const groups = result.data as unknown as UserGroup[];
            const state = get();
            
            // Обновляем currentGroup если ее ID совпадает с обновленной группой
            let updatedCurrentGroup = state.currentGroup;
            if (state.currentGroup) {
              const updatedGroup = groups.find(g => g.group_id === state.currentGroup!.group_id);
              if (updatedGroup) {
                updatedCurrentGroup = updatedGroup;
              }
            }
            
            set({ 
              groups, 
              currentGroup: updatedCurrentGroup,
              isLoading: false 
            });
          } else {
            set({ error: result.message || 'Failed to fetch groups', isLoading: false });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch groups', 
            isLoading: false 
          });
        }
      },
      
      fetchGroupExpenses: async (groupId) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.expense.getByGroup(groupId);
          if (result.success && result.data) {
            set({ expenses: result.data, isLoading: false });
          } else {
            set({ error: result.message || 'Failed to fetch expenses', isLoading: false });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch expenses', 
            isLoading: false 
          });
        }
      },
      
      fetchGroupBalances: async (groupId) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.balance.getGroupBalances(groupId);
          if (result.success && result.data) {
            set({ userBalances: result.data, isLoading: false });
          } else {
            set({ error: result.message || 'Failed to fetch balances', isLoading: false });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch balances', 
            isLoading: false 
          });
        }
      },
      
      fetchGroupMembers: async (groupId) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.group.getMembers(groupId);
          if (result.success && result.data) {
            set({ groupMembers: result.data, isLoading: false });
          } else {
            set({ error: result.message || 'Failed to fetch members', isLoading: false });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch members', 
            isLoading: false 
          });
        }
      },
      
      fetchUserTransfers: async (groupId?: number) => {
        try {
          const result = await api.transfer.getAll(groupId);
          if (result.success && result.data) {
            return result.data;
          } else {
            set({ error: result.message || 'Failed to fetch transfers' });
            return [];
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch transfers'
          });
          return [];
        }
      },
      
      // Data mutations
      createGroup: async (groupData) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.group.create(groupData);
          if (result.success && result.data) {
            // Refresh groups list
            await get().fetchUserGroups();
            return true;
          } else {
            set({ error: result.message || 'Failed to create group', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create group', 
            isLoading: false 
          });
          return false;
        }
      },
      
      createExpense: async (expenseData) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.expense.create(expenseData);
          if (result.success && result.data) {
            // Refresh expenses and balances
            const { currentGroup } = get();
            if (currentGroup) {
              await get().fetchGroupExpenses(currentGroup.group_id);
              await get().fetchGroupBalances(currentGroup.group_id);
            }
            return true;
          } else {
            set({ error: result.message || 'Failed to create expense', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create expense', 
            isLoading: false 
          });
          return false;
        }
      },
      
      updateExpense: async (id, expenseData) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.expense.update(id, expenseData);
          if (result.success && result.data) {
            // Refresh expenses and balances
            const { currentGroup } = get();
            if (currentGroup) {
              await get().fetchGroupExpenses(currentGroup.group_id);
              await get().fetchGroupBalances(currentGroup.group_id);
            }
            return true;
          } else {
            set({ error: result.message || 'Failed to update expense', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update expense', 
            isLoading: false 
          });
          return false;
        }
      },
      
      deleteExpense: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.expense.delete(id);
          if (result.success) {
            // Refresh expenses and balances
            const { currentGroup } = get();
            if (currentGroup) {
              await get().fetchGroupExpenses(currentGroup.group_id);
              await get().fetchGroupBalances(currentGroup.group_id);
            }
            return true;
          } else {
            set({ error: result.message || 'Failed to delete expense', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete expense', 
            isLoading: false 
          });
          return false;
        }
      },
      
      // Group management
      updateGroup: async (groupId, groupData) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.group.update(groupId, groupData);
          if (result.success && result.data) {
            // Refresh groups and balances
            await get().fetchUserGroups();
            const { currentGroup } = get();
            if (currentGroup) {
              await get().fetchGroupBalances(currentGroup.group_id);
            }
            return true;
          } else {
            set({ error: result.message || 'Failed to update group', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update group', 
            isLoading: false 
          });
          return false;
        }
      },
      
      deleteGroup: async (groupId) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.group.delete(groupId);
          if (result.success) {
            await get().fetchUserGroups();
            set({ currentGroup: null });
            return true;
          } else {
            set({ error: result.message || 'Failed to delete group', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete group', 
            isLoading: false 
          });
          return false;
        }
      },

      completeCollection: async (groupId) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.group.completeCollection(groupId);
          if (result.success) {
            // Refresh group data to update status
            await get().fetchUserGroups();
            return true;
          } else {
            set({ error: result.message || 'Failed to complete collection', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to complete collection', 
            isLoading: false 
          });
          return false;
        }
      },

      resumeCollection: async (groupId) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.group.resumeCollection(groupId);
          if (result.success) {
            // Refresh group data to update status
            await get().fetchUserGroups();
            return true;
          } else {
            set({ error: result.message || 'Failed to resume collection', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to resume collection', 
            isLoading: false 
          });
          return false;
        }
      },
      
      removeGroupMember: async (groupId, userId) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.group.removeMember(groupId, userId);
          if (result.success) {
            // Refresh members and balances
            await get().fetchGroupMembers(groupId);
            const { currentGroup } = get();
            if (currentGroup) {
              await get().fetchGroupBalances(currentGroup.group_id);
            }
            return true;
          } else {
            set({ error: result.message || 'Failed to remove member', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to remove member', 
            isLoading: false 
          });
          return false;
        }
      },
      
      updateGroupMemberRole: async (groupId, userId, role) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.group.updateMemberRole(groupId, userId, role);
          if (result.success) {
            // Refresh members and balances
            await get().fetchGroupMembers(groupId);
            const { currentGroup } = get();
            if (currentGroup) {
              await get().fetchGroupBalances(currentGroup.group_id);
            }
            return true;
          } else {
            set({ error: result.message || 'Failed to update member role', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update member role', 
            isLoading: false 
          });
          return false;
        }
      },
      
      // Transfers
      createTransfer: async (transferData) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.transfer.create(transferData);
          if (result.success) {
            const { currentGroup } = get();
            if (currentGroup) {
              await get().fetchGroupBalances(currentGroup.group_id);
            }
            return true;
          } else {
            set({ error: result.message || 'Failed to create transfer', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create transfer', 
            isLoading: false 
          });
          return false;
        }
      },
      
      confirmTransfer: async (transferId) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.transfer.confirm(transferId);
          if (result.success) {
            const { currentGroup } = get();
            if (currentGroup) {
              await get().fetchGroupBalances(currentGroup.group_id);
            }
            return true;
          } else {
            set({ error: result.message || 'Failed to confirm transfer', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to confirm transfer', 
            isLoading: false 
          });
          return false;
        }
      },
      
      cancelTransfer: async (transferId) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.transfer.cancel(transferId);
          if (result.success) {
            const { currentGroup } = get();
            if (currentGroup) {
              await get().fetchGroupBalances(currentGroup.group_id);
            }
            return true;
          } else {
            set({ error: result.message || 'Failed to cancel transfer', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to cancel transfer', 
            isLoading: false 
          });
          return false;
        }
      },
      
      // Reports
      exportReport: async (groupId, format) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.report.export(groupId, format);
          if (result.success) {
            set({ isLoading: false });
            return true;
          } else {
            set({ error: result.message || 'Failed to export report', isLoading: false });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to export report', 
            isLoading: false 
          });
          return false;
        }
      },
      
      // Utils
      reset: () => set({ ...initialState }),
    }),
    {
      name: 'budget-app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentGroup: state.currentGroup,
        groups: state.groups,
      }),
    }
  )
);

// Селекторы для удобства
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useCurrentGroup = () => useAppStore((state) => state.currentGroup);
export const useGroups = () => useAppStore((state) => state.groups);
export const useExpenses = () => useAppStore((state) => state.expenses);
export const useUserBalances = () => useAppStore((state) => state.userBalances);
export const useAppLoading = () => useAppStore((state) => state.isLoading);
export const useAppError = () => useAppStore((state) => state.error);

// Инициализация токена при загрузке
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('auth_token');
  if (token) {
    api.setToken(token);
  }
} 