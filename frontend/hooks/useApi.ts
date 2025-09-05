import { api } from '@/lib/api'
import {
  ExpenseCreate,
  GroupCreate,
  TransferCreate,
  UserProfileUpdate
} from '@/types'
import { useCallback, useEffect, useState } from 'react'

// Generic API hook
export function useApi<T>(
  apiCall: () => Promise<{ success: boolean; data?: T; message?: string }>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.message || 'API call failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// User hooks
export function useUser(groupId?: number) {
  const { data: user, loading, error, refetch } = useApi(() => api.user.getProfile(groupId), [groupId]);
  
  const updateProfile = useCallback(async (profileData: UserProfileUpdate) => {
    const result = await api.user.updateProfile(profileData);
    if (result.success) {
      refetch();
    }
    return result;
  }, [refetch]);

  return { user, loading, error, refetch, updateProfile };
}

export function useUserGroups() {
  return useApi(() => api.user.getGroups());
}

// Group hooks
export function useGroups() {
  const { data: groups, loading, error, refetch } = useApi(() => api.group.getAll());
  
  const createGroup = useCallback(async (groupData: GroupCreate) => {
    const result = await api.group.create(groupData);
    if (result.success) {
      refetch();
    }
    return result;
  }, [refetch]);

  const updateGroup = useCallback(async (id: number, groupData: Partial<GroupCreate>) => {
    const result = await api.group.update(id, groupData);
    if (result.success) {
      refetch();
    }
    return result;
  }, [refetch]);

  const deleteGroup = useCallback(async (id: number) => {
    const result = await api.group.delete(id);
    if (result.success) {
      refetch();
    }
    return result;
  }, [refetch]);

  return { groups, loading, error, refetch, createGroup, updateGroup, deleteGroup };
}

export function useGroup(groupId: number) {
  return useApi(() => api.group.getById(groupId), [groupId]);
}

export function useGroupMembers(groupId: number) {
  const { data: members, loading, error, refetch } = useApi(() => api.group.getMembers(groupId), [groupId]);
  
  const inviteMember = useCallback(async (userId: number) => {
    const result = await api.group.invite(groupId, userId);
    if (result.success) {
      refetch();
    }
    return result;
  }, [groupId, refetch]);

  const removeMember = useCallback(async (userId: number) => {
    const result = await api.group.removeMember(groupId, userId);
    if (result.success) {
      refetch();
    }
    return result;
  }, [groupId, refetch]);

  const updateMemberRole = useCallback(async (userId: number, role: string) => {
    const result = await api.group.updateMemberRole(groupId, userId, role);
    if (result.success) {
      refetch();
    }
    return result;
  }, [groupId, refetch]);

  return { members, loading, error, refetch, inviteMember, removeMember, updateMemberRole };
}

// Expense hooks
export function useExpenses(groupId: number) {
  const { data: expenses, loading, error, refetch } = useApi(() => api.expense.getByGroup(groupId), [groupId]);
  
  const createExpense = useCallback(async (expenseData: ExpenseCreate) => {
    const result = await api.expense.create(expenseData);
    if (result.success) {
      refetch();
    }
    return result;
  }, [refetch]);

  const updateExpense = useCallback(async (id: number, expenseData: Partial<ExpenseCreate>) => {
    const result = await api.expense.update(id, expenseData);
    if (result.success) {
      refetch();
    }
    return result;
  }, [refetch]);

  const deleteExpense = useCallback(async (id: number) => {
    const result = await api.expense.delete(id);
    if (result.success) {
      refetch();
    }
    return result;
  }, [refetch]);

  return { expenses, loading, error, refetch, createExpense, updateExpense, deleteExpense };
}

export function useExpense(expenseId: number) {
  return useApi(() => api.expense.getById(expenseId), [expenseId]);
}

// Transfer hooks
export function useTransfers(groupId?: number) {
  const { data: transfers, loading, error, refetch } = useApi(() => api.transfer.getAll(groupId), [groupId]);
  
  const createTransfer = useCallback(async (transferData: TransferCreate) => {
    const result = await api.transfer.create(transferData);
    if (result.success) {
      refetch();
    }
    return result;
  }, [refetch]);

  const confirmTransfer = useCallback(async (id: number) => {
    const result = await api.transfer.confirm(id);
    if (result.success) {
      refetch();
    }
    return result;
  }, [refetch]);

  const cancelTransfer = useCallback(async (id: number) => {
    const result = await api.transfer.cancel(id);
    if (result.success) {
      refetch();
    }
    return result;
  }, [refetch]);

  return { transfers, loading, error, refetch, createTransfer, confirmTransfer, cancelTransfer };
}

export function useTransfer(transferId: number) {
  return useApi(() => api.transfer.getById(transferId), [transferId]);
}

// Balance hooks
export function useBalances(groupId?: number) {
  return useApi(() => api.balance.getMyBalance(groupId), [groupId]);
}

export function useGroupBalances(groupId: number) {
  return useApi(() => api.balance.getGroupBalances(groupId), [groupId]);
}

// Report hooks
export function useGroupReport(groupId: number, period: string) {
  return useApi(() => api.report.getGroupReport(groupId, period), [groupId, period]);
}

export function useUserReport(userId: number, period: string) {
  return useApi(() => api.report.getUserReport(userId, period), [userId, period]);
}

// Authentication hooks
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const login = useCallback(async (credentials: { telegram_id: number; username?: string }) => {
    setLoading(true);
    try {
      const result = await api.auth.login(credentials);
      if (result.success && result.data) {
        api.setToken(result.data.access_token);
        setIsAuthenticated(true);
        localStorage.setItem('auth_token', result.data.access_token);
      }
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const validateTelegram = useCallback(async (initData: string) => {
    setLoading(true);
    try {
      const result = await api.auth.validateTelegram(initData);
      if (result.success && result.data) {
        api.setToken(result.data.access_token);
        setIsAuthenticated(true);
        localStorage.setItem('auth_token', result.data.access_token);
      }
      return result;
    } catch (error) {
      console.error('Telegram validation error:', error);
      return { success: false, message: 'Telegram validation failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      api.setToken(token);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  return { isAuthenticated, loading, login, validateTelegram, logout };
}

// Generic mutation hook for async operations
export function useMutation<T, P = any>(
  mutationFn: (params: P) => Promise<{ success: boolean; data?: T; message?: string }>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = useCallback(async (params: P) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await mutationFn(params);
      if (result.success && result.data) {
        setData(result.data);
        options?.onSuccess?.(result.data);
      } else {
        const errorMessage = result.message || 'Mutation failed';
        setError(errorMessage);
        options?.onError?.(errorMessage);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [mutationFn, options]);

  return { mutate, loading, error, data };
} 

// HomeScreen data hook
export function useHomeScreenData(groupId?: number) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [homeData, setHomeData] = useState<{
    group: any;
    expenses: any[];
    balances: any[];
    members: any[];
    user: any;
    userBalance: any;
    recentExpenses: any[];
    myDebts: any[];
    transfers: any[];
  } | null>(null);

  const fetchHomeData = useCallback(async () => {
    if (!groupId) {
      setLoading(false);
      setError('Группа не выбрана');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel
      const [
        groupResult,
        expensesResult, 
        balancesResult,
        membersResult,
        userResult,
        transfersResult
      ] = await Promise.all([
        api.group.getById(groupId),
        api.expense.getByGroup(groupId),
        api.group.getBalances(groupId),
        api.group.getMembers(groupId),
        api.user.getProfile(groupId),
        api.transfer.getAll(groupId)
      ]);

      // Debug logging
      console.log('API Results:', {
        groupResult: groupResult.success,
        expensesResult: expensesResult.success,
        balancesResult: balancesResult.success,
        membersResult: membersResult.success,
        userResult: userResult.success,
        transfersResult: transfersResult.success
      });

      if (!groupResult.success) {
        throw new Error(`Failed to fetch group data: ${groupResult.message}`);
      }
      if (!expensesResult.success) {
        throw new Error(`Failed to fetch expenses: ${expensesResult.message}`);
      }
      if (!balancesResult.success) {
        throw new Error(`Failed to fetch balances: ${balancesResult.message}`);
      }
      if (!membersResult.success) {
        throw new Error(`Failed to fetch members: ${membersResult.message}`);
      }
      if (!userResult.success) {
        throw new Error(`Failed to fetch user: ${userResult.message}`);
      }

      const group = groupResult.data;
      const expenses = expensesResult.data || [];
      const balances = balancesResult.data || [];
      const members = membersResult.data || [];
      const user = userResult.data;
      const transfers = transfersResult.data || [];

      // Find current user's balance
      const userBalance = balances.find(b => b.user_id === user?.id);
      
      // Get recent expenses (last 5)
      const recentExpenses = expenses
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      // Calculate user's debts (simplified calculation)
      const myDebts = balances.filter(b => 
        b.user_id !== user?.id && 
        b.balance > 0 && 
        b.user
      ).map(b => ({
        toUser: `${b.user!.first_name} ${b.user!.last_name || ''}`.trim(),
        amount: b.balance,
        reason: 'За общие расходы'
      }));

      setHomeData({
        group,
        expenses,
        balances,
        members,
        user,
        userBalance,
        recentExpenses,
        myDebts,
        transfers
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch home data');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  return { 
    data: homeData, 
    loading, 
    error, 
    refetch: fetchHomeData 
  };
} 