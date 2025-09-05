'use client';

import { api, apiClient } from '@/lib/api'
import { designColors } from '@/lib/design-system'
import { ActionIcon, Box, LoadingOverlay } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTelegram } from './providers/TelegramProvider'

// Import screens
import { AdminScreen } from './screens/AdminScreen'
import { DebtsScreen } from './screens/DebtsScreen'
import { ExpensesScreen } from './screens/ExpensesScreen'
import { HomeScreen } from './screens/HomeScreen'
import { ParticipantsScreen } from './screens/ParticipantsScreen'
import { RegistrationScreen } from './screens/RegistrationScreen'
import { SuccessScreen } from './screens/SuccessScreen'

// Import navigation
import { BottomNavigation } from './navigation/BottomNavigation'

// Import modals
import { useUser } from '@/hooks/useApi'
import { useAppStore, useCurrentGroup } from '@/stores/useAppStore'
import { AddExpenseModal } from './modals/AddExpenseModal'
import { GroupSettingsModal } from './modals/GroupSettingsModal'

interface AppContainerProps {
  initialGroupId?: number;
  initialUserId?: number;
  startParam?: string;
}

export function AppContainer({ initialGroupId, initialUserId, startParam }: AppContainerProps) {
  const telegram = useTelegram();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'debts' | 'participants' | 'admin'>('dashboard');
  const [registrationStep, setRegistrationStep] = useState<'register' | 'rules' | 'success' | 'complete'>('register');
  const [addExpenseModalOpened, setAddExpenseModalOpened] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState<number | null>(initialGroupId || null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Store refetch function from HomeScreen
  const refetchDataRef = useRef<(() => void) | null>(null);
  const refetchExpensesRef = useRef<(() => void) | null>(null);
  const refetchDebtsRef = useRef<(() => void) | null>(null);

  // Store hooks
  const { setCurrentGroup, fetchUserGroups } = useAppStore();
  const currentGroup = useCurrentGroup()
  
  // Get user with group role information
  const { user: userWithGroupRole } = useUser(currentGroupId || undefined);

  // Function to load user groups and set current group
  const setCurrentGroupFromId = async (targetGroupId?: number) => {
    try {
      // Use provided targetGroupId, or fall back to currentGroupId, then initialGroupId
      const groupIdToUse = targetGroupId || currentGroupId || initialGroupId;
      
      console.log('🔍 [setCurrentGroupFromId] Starting...');
      console.log('🔍 [setCurrentGroupFromId] targetGroupId:', targetGroupId);
      console.log('🔍 [setCurrentGroupFromId] currentGroupId:', currentGroupId);
      console.log('🔍 [setCurrentGroupFromId] initialGroupId:', initialGroupId);
      console.log('🔍 [setCurrentGroupFromId] groupIdToUse:', groupIdToUse);
      
      if (groupIdToUse) {
        // Get actual group data from user's groups for the specific group ID
        console.log('🔍 [setCurrentGroupFromId] Loading user groups to find group:', groupIdToUse);
        
        await fetchUserGroups();
        const groupsResponse = await api.user.getGroups();
        console.log('🔍 [setCurrentGroupFromId] groupsResponse:', groupsResponse);
        
        if (groupsResponse.success && groupsResponse.data && groupsResponse.data.length > 0) {
          const userGroups = groupsResponse.data as any;
          const targetGroup = userGroups.find((g: any) => g.group_id === groupIdToUse);
          
          if (targetGroup) {
            console.log('🔍 [setCurrentGroupFromId] Found target group with real data:', targetGroup);
            setCurrentGroup(targetGroup);
            setCurrentGroupId(groupIdToUse);
            return;
          } else {
            console.log('❌ [setCurrentGroupFromId] Group not found in user groups, using first group as fallback');
            const firstGroup = userGroups[0];
            setCurrentGroup(firstGroup);
            setCurrentGroupId(firstGroup.group_id);
            return;
          }
        } else {
          console.log('❌ [setCurrentGroupFromId] No groups data available');
          return;
        }
      }
      
      // Only if we don't have any groupId, load all groups and pick first
      console.log('🔍 [setCurrentGroupFromId] No groupId available, loading user groups...');
      await fetchUserGroups();
      
      const groupsResponse = await api.user.getGroups();
      console.log('🔍 [setCurrentGroupFromId] groupsResponse:', groupsResponse);
      
      if (groupsResponse.success && groupsResponse.data && groupsResponse.data.length > 0) {
        const userGroups = groupsResponse.data as any;
        const firstGroup = userGroups[0];
        
        console.log('🔍 [setCurrentGroupFromId] Using first group from user groups:', firstGroup);
        setCurrentGroup(firstGroup);
        
        // Update currentGroupId to match the selected group
        setCurrentGroupId(firstGroup.group_id);
      } else {
        console.log('❌ [setCurrentGroupFromId] No groups data or empty groups');
      }
    } catch (error) {
      console.error('❌ [setCurrentGroupFromId] Error setting current group:', error);
    }
  };

  // Инициализация и аутентификация
  useEffect(() => {
    console.log('=== App initialization started ===');
    
    async function initializeApp() {
      try {
        console.log('🟦 Telegram initialized:', telegram.isInitialized);
        console.log('🟦 Telegram userId:', telegram.userId);
        console.log('🟦 API Base URL:', '"https://finance-bot.ru/api/v1"');

        // Debug Telegram WebApp state
        console.log('🔍 Debugging Telegram WebApp state:');
        console.log('- telegram.isInitialized:', telegram.isInitialized);
        console.log('- telegram.userId:', telegram.userId);
        console.log('- telegram.firstName:', telegram.firstName);
        console.log('- telegram.lastName:', telegram.lastName);
        console.log('- telegram.username:', telegram.username);
        console.log('🔍 === TELEGRAM INIT DATA DEBUG ===');
        console.log('- window exists:', typeof window !== 'undefined');
        console.log('- window.Telegram exists:', typeof window !== 'undefined' && !!window.Telegram);
        console.log('- window.Telegram.WebApp exists:', typeof window !== 'undefined' && !!window.Telegram?.WebApp);
        console.log('- window.Telegram.WebApp.initData:', typeof window !== 'undefined' ? window.Telegram?.WebApp?.initData : 'N/A');
        console.log('- window.Telegram.WebApp.initDataUnsafe:', typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe : 'N/A');
        console.log('- telegram.isInitialized:', telegram.isInitialized);
        console.log('🔍 === END DEBUG ===');

        // Test API connectivity first
        console.log('🟦 Testing API availability...');
        const isApiAvailable = await apiClient.testConnection();
        console.log('🟦 API health check:', isApiAvailable ? '✅' : '❌', isApiAvailable);

        if (!isApiAvailable) {
          console.warn('⚠️ API not available, but continuing...');
        }

        // Always try Telegram authentication first (if WebApp is available)
        if (telegram.isInitialized && typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
          console.log('🟦 Attempting Telegram authentication...');
          
          try {
            const authResponse = await api.auth.validateTelegram(window.Telegram.WebApp.initData);
            if (authResponse.success && authResponse.data) {
              console.log('✅ Telegram auth successful:', authResponse.data);
              console.log('📝 Received token:', authResponse.data.access_token ? authResponse.data.access_token.substring(0, 20) + '...' : 'MISSING');
              
              localStorage.setItem('auth_token', authResponse.data.access_token);
              api.setToken(authResponse.data.access_token);
              console.log('📝 Token saved to localStorage and set in API client');
              
              // Get full user profile to check registration status
              console.log('🔍 Making /users/me request...');
              console.log('🔍 initialGroupId:', initialGroupId);
              console.log('🔍 initialGroupId type:', typeof initialGroupId);
              console.log('🔍 initialUserId:', initialUserId);
              console.log('🔍 startParam:', startParam);
              
              // Use initialGroupId for group-specific information
              const profileResponse = await api.user.getProfile(initialGroupId || currentGroupId || undefined);
              console.log('📋 Profile response:', profileResponse);
              
              if (profileResponse.success && profileResponse.data) {
                console.log('📋 User profile loaded:', profileResponse.data);
                console.log('🔍 User details:');
                console.log('- ID:', profileResponse.data.id);
                console.log('- telegram_id:', profileResponse.data.telegram_id);
                console.log('- first_name (Telegram):', profileResponse.data.first_name);
                console.log('- last_name (Telegram):', profileResponse.data.last_name);
                console.log('- profile_first_name (User):', profileResponse.data.profile_first_name);
                console.log('- profile_last_name (User):', profileResponse.data.profile_last_name);
                console.log('- username:', profileResponse.data.username);
                console.log('- phone_number:', profileResponse.data.phone_number);
                console.log('- avatar_url:', profileResponse.data.avatar_url);
                console.log('- is_profile_completed:', profileResponse.data.is_profile_completed);
                console.log('- is_registered_in_group:', profileResponse.data.is_registered_in_group);
                console.log('- group_role:', profileResponse.data.group_role);
                console.log('- rules_accepted:', profileResponse.data.rules_accepted);
                console.log('- include_in_expenses:', profileResponse.data.include_in_expenses);
                
                setUser(profileResponse.data);
                
                // SIMPLIFIED LOGIC: Check if profile is completed by checking profile_first_name and profile_last_name
                const isProfileComplete = profileResponse.data.profile_first_name !== null && 
                                        profileResponse.data.profile_last_name !== null;
                
                console.log('🔍 Simple registration check:');
                console.log('- profile_first_name:', profileResponse.data.profile_first_name);
                console.log('- profile_last_name:', profileResponse.data.profile_last_name);
                console.log('- isProfileComplete:', isProfileComplete);
                
                if (isProfileComplete) {
                  console.log('✅ User profile is complete - checking group rules...');
                  
                  // Check if user needs to accept group rules before entering main app
                  if (initialGroupId) {
                    console.log('🔍 Checking group rules for group:', initialGroupId);
                    try {
                      // First, try to join the group if user is not a member yet
                      if (profileResponse.data.is_registered_in_group === false || profileResponse.data.is_registered_in_group === null) {
                        console.log('🔗 User not in group, attempting to join group:', initialGroupId);
                        try {
                          const joinResponse = await api.group.join(initialGroupId);
                          console.log('✅ Initial group join response:', joinResponse);
                          
                          // Refresh profile data after joining
                          const updatedProfileResponse = await api.user.getProfile(initialGroupId);
                          if (updatedProfileResponse.success && updatedProfileResponse.data) {
                            console.log('🔄 Updated profile after join:', updatedProfileResponse.data);
                            setUser(updatedProfileResponse.data);
                            // Use updated data for rules checking
                            Object.assign(profileResponse.data, updatedProfileResponse.data);
                          }
                        } catch (error) {
                          console.error('❌ Error joining group:', error);
                        }
                      }
                      
                      // Check if user has accepted rules for this group
                      const hasAcceptedRules = profileResponse.data.rules_accepted;
                      console.log('📋 User has accepted rules for this group:', hasAcceptedRules);
                      console.log('📋 User is registered in group:', profileResponse.data.is_registered_in_group);
                      console.log('📋 User include in expenses:', profileResponse.data.include_in_expenses);
                      
                      // If user is already registered in group and included in expenses, skip rules check
                      if (profileResponse.data.is_registered_in_group && profileResponse.data.include_in_expenses) {
                        console.log('✅ User is fully registered in group, skipping rules check');
                      } else if (profileResponse.data.is_registered_in_group === false || hasAcceptedRules === false) {
                        // Get group rules to check if group has rules
                        console.log('🔍 Fetching group rules...');
                        const rulesResponse = await api.group.getRules(initialGroupId);
                        console.log('📋 Group rules response:', rulesResponse);
                        
                        if (rulesResponse.success && rulesResponse.data && rulesResponse.data.has_rules) {
                          console.log('⚠️ Group has rules and user hasn\'t accepted them - showing rules screen');
                          setIsAuthenticated(false);
                          setRegistrationStep('rules');
                          setIsLoading(false);
                          return;
                        } else {
                          console.log('ℹ️ No group rules or rules already accepted');
                        }
                      } else {
                        console.log('ℹ️ User registration status unclear, continuing to main app');
                      }
                    } catch (error) {
                      console.error('❌ Error checking group rules:', error);
                      // Continue to main app if rules check fails
                    }
                  }
                  
                  setIsAuthenticated(true);
                  setRegistrationStep('complete');
                  
                  // Join group if initialGroupId is provided (user already registered, but first time in this group)
                  if (initialGroupId) {
                    console.log('🔗 User already registered, joining group:', initialGroupId);
                    try {
                      const joinResponse = await api.group.join(initialGroupId);
                      console.log('✅ Group join response:', joinResponse);
                      
                      if (joinResponse.success) {
                        console.log('✅ Successfully joined group');
                      } else {
                        console.error('❌ Failed to join group:', joinResponse.message);
                      }
                    } catch (error) {
                      console.error('❌ Error joining group:', error);
                    }
                  }
                  
                  // Set current group from initialGroupId
                  await setCurrentGroupFromId(initialGroupId);
                } else {
                  console.log('⚠️ User profile incomplete - showing registration screen');
                  setIsAuthenticated(false);
                  setRegistrationStep('register');
                }
              } else {
                console.log('❌ Failed to load user profile');
                setIsAuthenticated(false);
                setRegistrationStep('register');
              }
              
              setIsLoading(false);
              return;
            } else {
              console.log('❌ Telegram auth failed:', authResponse.message);
            }
          } catch (error) {
            console.error('❌ Telegram auth error:', error);
          }
        } else {
          console.log('⚠️ Telegram not properly initialized or no initData');
          console.log('- telegram.isInitialized:', telegram.isInitialized);
          console.log('- window.Telegram?.WebApp?.initData exists:', typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData);
        }

        // Fallback: check for existing token
        const existingToken = localStorage.getItem('auth_token');
        if (existingToken) {
          console.log('🟦 Found existing token, validating...');
          api.setToken(existingToken);
          
          try {
            const userResponse = await api.user.getProfile(currentGroupId || undefined);
                          if (userResponse.success && userResponse.data) {
                console.log('✅ Token valid, user authenticated:', userResponse.data);
                setUser(userResponse.data);
                
                // Use the same simplified logic for token validation
                const isProfileComplete = userResponse.data.profile_first_name !== null && 
                                        userResponse.data.profile_last_name !== null;
                
                console.log('🔍 Token user profile check:');
                console.log('- profile_first_name:', userResponse.data.profile_first_name);
                console.log('- profile_last_name:', userResponse.data.profile_last_name);
                console.log('- isProfileComplete:', isProfileComplete);
                
                if (isProfileComplete) {
                  console.log('✅ Token user profile is complete - going to main app');
                  setIsAuthenticated(true);
                  setRegistrationStep('complete');
                  
                  // Join group if initialGroupId is provided (user already registered, but first time in this group)
                  if (initialGroupId) {
                    console.log('🔗 Token user already registered, joining group:', initialGroupId);
                    try {
                      const joinResponse = await api.group.join(initialGroupId);
                      console.log('✅ Group join response:', joinResponse);
                      
                      if (joinResponse.success) {
                        console.log('✅ Successfully joined group');
                      } else {
                        console.error('❌ Failed to join group:', joinResponse.message);
                      }
                    } catch (error) {
                      console.error('❌ Error joining group:', error);
                    }
                  }
                  
                  // Set current group from initialGroupId
                  await setCurrentGroupFromId(initialGroupId);
                } else {
                  console.log('⚠️ Token user profile incomplete - showing registration screen');
                  setIsAuthenticated(false);
                  setRegistrationStep('register');
                }
                
                setIsLoading(false);
                return;
            } else {
              console.log('❌ Token invalid, clearing...');
              localStorage.removeItem('auth_token');
              api.setToken(null);
            }
          } catch (error) {
            console.error('❌ Error validating token:', error);
            localStorage.removeItem('auth_token');
            api.setToken(null);
          }
        } else {
          console.log('ℹ️ No existing token found.');
        }

        // If we reach here, authentication failed
        console.log('🟦 Authentication failed, showing registration');
        setIsAuthenticated(false);
        setRegistrationStep('register');
        setIsLoading(false);

      } catch (error) {
        console.error('❌ App initialization error:', error);
        setIsAuthenticated(false);
        setRegistrationStep('register');
        setIsLoading(false);
      }
    }

    // Wait for telegram to be initialized
    if (telegram.isInitialized) {
      initializeApp();
    } else {
      // If telegram is not initialized yet, wait a bit
      const timeout = setTimeout(() => {
        initializeApp();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [telegram.isInitialized]);

  // Set currentGroupId from initialGroupId
  useEffect(() => {
    if (initialGroupId && !currentGroupId) {
      console.log('Setting currentGroupId from initialGroupId:', initialGroupId);
      setCurrentGroupId(initialGroupId);
    }
  }, [initialGroupId, currentGroupId]);

  // Обработка стартовых параметров
  const handleStartParam = (param: string) => {
    console.log('Handling start param:', param);
    
    if (param.startsWith('register_') || param.startsWith('admin_register_')) {
      setIsAuthenticated(false);
      setRegistrationStep('register');
      
      // Извлекаем group_id из параметров типа register_group_2_user_321196003
      const groupMatches = param.match(/group_(\d+)/);
      if (groupMatches) {
        const groupId = parseInt(groupMatches[1]);
        console.log('Extracted group_id from register param:', groupId);
        setCurrentGroupId(groupId);
      }
      
      if (param.startsWith('admin_register_')) {
        setActiveTab('admin');
      }
    } else if (param.startsWith('group_settings_')) {
      const matches = param.match(/group_(\d+)/);
      if (matches) {
        setCurrentGroupId(parseInt(matches[1]));
        setActiveTab('admin');
      }
    } else if (param.startsWith('add_expense_group_')) {
      const matches = param.match(/group_(\d+)/);
      if (matches) {
        setCurrentGroupId(parseInt(matches[1]));
        // Only open modal if collection is not completed
        if (currentGroup?.status?.toUpperCase() !== 'COMPLETED') {
          setAddExpenseModalOpened(true);
        }
      }
    } else if (param.startsWith('transfer_group_')) {
      const matches = param.match(/group_(\d+)/);
      if (matches) {
        setCurrentGroupId(parseInt(matches[1]));
        setActiveTab('debts');
      }
    } else if (param === 'main') {
      setActiveTab('dashboard');
    }
  };

  // Обработка стартовых параметров из URL
  useEffect(() => {
    if (startParam) {
      console.log('Handling startParam:', startParam);
      handleStartParam(startParam);
    }
  }, [startParam]);

  // Завершение регистрации
  const handleCompleteRegistration = async (regData: { 
    firstName: string; 
    lastName: string; 
    phone?: string;
    rulesAccepted: boolean;
    groupId?: number; // Add groupId parameter
  }) => {
    console.log('=== handleCompleteRegistration started ===');
    console.log('regData:', regData);
    console.log('currentGroupId:', currentGroupId);
    console.log('initialGroupId:', initialGroupId);
    
    // Determine the effective group ID
    const effectiveGroupId = regData.groupId || currentGroupId || initialGroupId;
    console.log('effectiveGroupId:', effectiveGroupId);
    
    // If we have a group ID, join the group
    if (effectiveGroupId) {
      console.log('🔗 Joining group:', effectiveGroupId);
      try {
        const joinResponse = await api.group.join(effectiveGroupId);
        console.log('✅ Group join response:', joinResponse);
        
        if (joinResponse.success) {
          console.log('✅ Successfully joined group');
        } else {
          console.error('❌ Failed to join group:', joinResponse.message);
        }
      } catch (error) {
        console.error('❌ Error joining group:', error);
      }
    } else {
      console.log('ℹ️ No group ID provided, skipping group join');
    }
    
    setRegistrationStep('success');
    
    // Обновляем локальные данные пользователя
    if (user) {
      setUser({
        ...user,
        first_name: regData.firstName,
        last_name: regData.lastName,
        phone_number: regData.phone,
        is_registered_in_group: effectiveGroupId ? true : undefined // Mark as registered in group
      });
    }
    
    // Показываем экран успеха на 3 секунды
    setTimeout(() => {
      setRegistrationStep('complete');
      setIsAuthenticated(true);
      
      // Set current group from effectiveGroupId
      setCurrentGroupFromId(effectiveGroupId);
      
      // Уведомляем Telegram WebApp о готовности
      telegram.sendData({
        type: 'registration_complete',
        user: regData,
        group_id: effectiveGroupId // Include group_id in the data
      });
    }, 3000);
  };

  const handleCloseSuccess = () => {
    setRegistrationStep('complete');
    setIsAuthenticated(true);
    
    // Load user groups and set current group
    setCurrentGroupFromId();
  };

  // Обработка принятия правил для зарегистрированных пользователей
  const handleRulesAcceptance = async (rulesData: { 
    firstName: string; 
    lastName: string; 
    phone?: string;
    rulesAccepted: boolean;
    groupId?: number;
  }) => {
    console.log('=== handleRulesAcceptance started ===');
    console.log('rulesData:', rulesData);
    
    const targetGroupId = rulesData.groupId || initialGroupId || currentGroupId;
    console.log('targetGroupId:', targetGroupId);
    
    if (targetGroupId && rulesData.rulesAccepted) {
      console.log('✅ Rules accepted - setting up user for main app');
      
      // Rules were already accepted in RegistrationScreen, so just set up the user
      setIsAuthenticated(true);
      setRegistrationStep('complete');
      
      // Set current group from targetGroupId
      await setCurrentGroupFromId(targetGroupId || undefined);
      
      // Update user data
      if (user) {
        setUser({
          ...user,
          rules_accepted: true,
          is_registered_in_group: true
        });
      }
      
      // Notify Telegram WebApp
      telegram.sendData({
        type: 'rules_accepted',
        group_id: targetGroupId
      });
    } else {
      console.log('⚠️ Rules not accepted or no group ID');
      // Return to main app anyway
      setIsAuthenticated(true);
      setRegistrationStep('complete');
      await setCurrentGroupFromId(targetGroupId || undefined);
    }
  };

  // Handlers для расходов
  const handleAddExpense = () => {
    // Only open modal if collection is not completed
    if (currentGroup?.status?.toUpperCase() !== 'COMPLETED') {
      setAddExpenseModalOpened(true);
    }
  };

  const handleExpenseSubmit = async (expense: {
    amount: number;
    description: string;
    category: string;
    participants: string[];
    splitType: 'equal' | 'custom';
  }) => {
    try {
      if (!currentGroupId) {
        return;
      }

      const result = await api.expense.create({
        group_id: currentGroupId,
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        split_type: expense.splitType,
        participant_ids: expense.participants.map(id => parseInt(id)),
      });

      if (result.success) {
        setAddExpenseModalOpened(false);
        
        // Обновляем данные на главной странице
        if (refetchDataRef.current) {
          refetchDataRef.current();
        }
        
        // Обновляем данные на странице расходов
        if (refetchExpensesRef.current) {
          refetchExpensesRef.current();
        }
      }
    } catch (error) {
      // Errors handled silently
    }
  };

  // Handler for storing refetch function from HomeScreen
  const handleRefetchData = useCallback((refetchFn: () => void) => {
    refetchDataRef.current = refetchFn;
  }, []);

  // Handler for storing refetch function from ExpensesScreen
  const handleRefetchExpenses = useCallback((refetchFn: () => void) => {
    refetchExpensesRef.current = refetchFn;
  }, []);

  // Handler for storing refetch function from DebtsScreen
  const handleRefetchDebts = useCallback((refetchFn: () => void) => {
    refetchDebtsRef.current = refetchFn;
  }, []);

  // Navigation handlers
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

  // Debt management handlers
  const handleSendTransfer = async (toUserId: string, amount: number, description?: string) => {
    try {
      if (!currentGroupId) {
        return;
      }

      const result = await api.transfer.create({
        to_user_id: parseInt(toUserId),
        amount: amount,
        group_id: currentGroupId,
        description: description || 'Перевод средств'
      });
    } catch (error) {
      // Errors handled silently
    }
  };

  const handleConfirmReceived = async (fromUserId: string, amount: number) => {
    try {
      telegram.showAlert('Получение подтверждено!');
    } catch (error) {
      telegram.showAlert('Ошибка при подтверждении');
    }
  };

  // Modal states
  const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false)

  // Admin handlers
  const adminHandlers = {
    onBackToProfile: () => {
      setActiveTab('dashboard');
    },
    onParticipantManagement: () => {
      setActiveTab('participants');
    },
    onCollectionSettings: () => {
      if (currentGroupId) {
        setShowGroupSettingsModal(true);
      }
    },

    onRestartCollection: async () => {
      const confirmed = await telegram.showConfirm('Вы уверены, что хотите сбросить все долги? Это действие нельзя отменить!');
      if (confirmed && currentGroupId) {
        try {
          const result = await api.group.resetDebts(currentGroupId);
          if (result.success) {
            // Send 3 reports to Telegram group before reset
            try {
              console.log('Sending reports to Telegram group before reset...');
              
              // Send Report 1: All Transactions
              await api.expense.sendExcelToChat(currentGroupId);
              console.log('Report 1 (Transactions) sent successfully');
              
              // Send Report 2: Summary Table
              await api.expense.sendSummaryReportToChat(currentGroupId);
              console.log('Report 2 (Summary) sent successfully');
              
              // Send Report 3: Transfers
              await api.expense.sendTransfersReportToChat(currentGroupId);
              console.log('Report 3 (Transfers) sent successfully');
              
            } catch (reportError) {
              console.error('Failed to send reports:', reportError);
              // Don't fail the reset if reports fail
            }
            
            // Refresh all data
            if (refetchDataRef.current) {
              refetchDataRef.current();
            }
            if (refetchExpensesRef.current) {
              refetchExpensesRef.current();
            }
            if (refetchDebtsRef.current) {
              refetchDebtsRef.current();
            }
          }
        } catch (error) {
          // Errors handled silently
        }
      }
    },
    onDeleteCollection: async () => {
      const confirmed = await telegram.showConfirm('Вы уверены, что хотите удалить группу? Это действие нельзя отменить!');
      if (confirmed && currentGroupId) {
        try {
          const result = await api.group.delete(currentGroupId);
          if (result.success) {
            // Clear current group and reload
            setCurrentGroupId(null);
            await setCurrentGroupFromId();
            setActiveTab('dashboard');
          }
        } catch (error) {
          // Errors handled silently
        }
      }
    },
    onLogout: async () => {
      const confirmed = await telegram.showConfirm('Вы уверены, что хотите выйти из аккаунта?');
      if (confirmed) {
        localStorage.removeItem('auth_token');
        telegram.close();
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Box style={{ position: 'relative', minHeight: '100vh' }}>
        <LoadingOverlay visible={true} />
      </Box>
    );
  }

  // Registration flow
  if (!isAuthenticated) {
    if (registrationStep === 'register') {
      return (
        <RegistrationScreen 
          groupId={currentGroupId || undefined}
          onComplete={handleCompleteRegistration}
        />
      );
    }
    
    if (registrationStep === 'rules') {
      return (
        <RegistrationScreen 
          groupId={initialGroupId || currentGroupId || undefined}
          rulesOnly={true}
          onComplete={handleRulesAcceptance}
        />
      );
    }
    
    if (registrationStep === 'success') {
      return (
        <SuccessScreen 
          firstName={user?.first_name || telegram.firstName || 'Пользователь'}
          lastName={user?.last_name || telegram.lastName || ''}
          onClose={handleCloseSuccess}
        />
      );
    }
  }

  // Main app content
  const renderCurrentScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <HomeScreen 
            onAddExpense={handleAddExpense}
            onViewExpenses={handleViewExpenses}
            onViewDebts={handleViewDebts}
            onViewParticipants={handleViewParticipants}
            onOpenAdmin={handleOpenAdmin}
            onRefetchData={handleRefetchData}
          />
        );
      case 'expenses':
        return (
          <ExpensesScreen 
            onAddExpense={handleAddExpense}
            onRefetchExpenses={handleRefetchExpenses}
          />
        );
      case 'debts':
        return (
          <DebtsScreen 
            onSendTransfer={handleSendTransfer}
            onConfirmReceived={handleConfirmReceived}
            onRefetchDebts={handleRefetchDebts}
          />
        );
      case 'participants':
        return (
          <ParticipantsScreen user={user} />
        );
      case 'admin':
        return (
          <AdminScreen 
            userRole={'admin'}
            groupName={`Группа ${currentGroupId}`}
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
            onRefetchData={handleRefetchData}
          />
        );
    }
  };

  return (
    <Box style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Main content area */}
      {renderCurrentScreen()}

      {/* Floating Action Button - только на Dashboard и Expenses */}
      {(activeTab === 'dashboard' || activeTab === 'expenses') && (
        <ActionIcon
          size={60}
          radius="xl"
          disabled={currentGroup?.status?.toUpperCase() === 'COMPLETED'}
          style={{
            backgroundColor: currentGroup?.status?.toUpperCase() === 'COMPLETED' 
              ? designColors.backgrounds.secondary 
              : designColors.accents.fabButton,
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            opacity: currentGroup?.status?.toUpperCase() === 'COMPLETED' ? 0.5 : 1
          }}
          onClick={handleAddExpense}
        >
          <IconPlus size={28} style={{ color: designColors.text.primary }} />
        </ActionIcon>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={userWithGroupRole?.group_role === 'admin' ? 'admin' : 'participant'}
      />

      {/* Modals */}
      <AddExpenseModal
        opened={addExpenseModalOpened}
        onClose={() => setAddExpenseModalOpened(false)}
        onSubmit={handleExpenseSubmit}
        groupId={currentGroupId}
      />

      <GroupSettingsModal
        isOpen={showGroupSettingsModal}
        onClose={() => setShowGroupSettingsModal(false)}
        groupId={currentGroupId || 0}
        currentGroupName={currentGroup?.group_name || ''}
        currentGroupStatus={currentGroup?.status || 'ACTIVE'}
        userRole="admin"
        onUpdateSuccess={async () => {
          await setCurrentGroupFromId(currentGroupId || undefined);
        }}
      />
    </Box>
  );
} 