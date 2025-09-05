import {
  ApiResponse,
  CreateTelegramUserRequest,
  CreateUserRequest,
  Expense,
  ExpenseCreate,
  ExpenseFilters,
  Group,
  GroupCreate,
  GroupMember,
  Report,
  TokenResponse,
  Transfer,
  TransferCreate,
  User,
  UserBalance,
  UserProfileUpdate
} from '../types'

const API_BASE_URL = typeof window !== 'undefined' ? (window as any).ENV?.NEXT_PUBLIC_API_URL || 'https://finance-bot.ru/api/v1' : 'https://finance-bot.ru/api/v1';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log('=== API Request ===');
    console.log('URL:', url);
    console.log('Method:', options.method || 'GET');
    console.log('Base URL:', this.baseUrl);
    console.log('Endpoint:', endpoint);
    console.log('Has token:', !!this.token);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Add Authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    console.log('Request config:', {
      url,
      method: config.method,
      headers,
      body: options.body,
    });

    try {
      console.log('Making fetch request...');
      const response = await fetch(url, config);
      
      console.log('Response received:');
      console.log('- Status:', response.status);
      console.log('- StatusText:', response.statusText);
      console.log('- OK:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error response data:', errorData);
        
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          errors: errorData.errors,
        };
      }

      const data = await response.json();
      console.log('Success response data:', data);
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request network error:', error);
      return {
        success: false,
        message: 'Network error occurred',
      };
    }
  }

  // Auth endpoints
  async login(credentials: { telegram_id: number; username?: string }): Promise<ApiResponse<TokenResponse>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async validateTelegramAuth(initData: string): Promise<ApiResponse<TokenResponse>> {
    return this.request('/auth/telegram', {
      method: 'POST',
      body: JSON.stringify({ init_data: initData }),
    });
  }

  async refreshToken(): Promise<ApiResponse<TokenResponse>> {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  async registerUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    console.log('registerUser called with:', userData);
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // User endpoints
  async getMyProfile(groupId?: number): Promise<ApiResponse<User>> {
    const queryParams = groupId ? `?group_id=${groupId}` : '';
    return this.request(`/users/me${queryParams}`);
  }

  async updateMyProfile(profileData: UserProfileUpdate): Promise<ApiResponse<User>> {
    return this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  async getUserGroups(): Promise<ApiResponse<Group[]>> {
    return this.request('/users/me/groups');
  }

  async getUserById(userId: number): Promise<ApiResponse<User>> {
    return this.request(`/users/${userId}`);
  }

  async getUserByTelegramId(telegramId: number): Promise<ApiResponse<User>> {
    return this.request(`/users/telegram/${telegramId}`);
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Group endpoints
  async createGroup(groupData: GroupCreate): Promise<ApiResponse<Group>> {
    return this.request('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  async getAllGroups(): Promise<ApiResponse<Group[]>> {
    return this.request('/groups');
  }

  async getGroup(groupId: number): Promise<ApiResponse<Group>> {
    return this.request(`/groups/${groupId}`);
  }

  async updateGroup(groupId: number, groupData: { 
    name?: string; 
    description?: string; 
    rules?: string;
    currency?: string;
    currency_symbol?: string;
  }): Promise<ApiResponse<{
    group: Group;
    rules: {
      group_id: number;
      group_name: string;
      rules: string | null;
      has_rules: boolean;
    };
    message: string;
  }>> {
    return this.request(`/groups/${groupId}`, {
      method: 'PATCH',
      body: JSON.stringify(groupData),
    });
  }

  async deleteGroup(groupId: number): Promise<ApiResponse<void>> {
    return this.request(`/groups/${groupId}`, {
      method: 'DELETE',
    });
  }

  async getGroupMembers(groupId: number): Promise<ApiResponse<GroupMember[]>> {
    return this.request(`/groups/${groupId}/members`);
  }

  async inviteToGroup(groupId: number, userId: number): Promise<ApiResponse<void>> {
    return this.request(`/groups/${groupId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async joinGroup(groupId: number): Promise<ApiResponse<{ message: string }>> {
    // Убираю неиспользуемый параметр inviteCode
    return this.request(`/groups/${groupId}/join`, {
      method: 'POST'
    });
  }

  async leaveGroup(groupId: number): Promise<ApiResponse<void>> {
    return this.request(`/groups/${groupId}/leave`, {
      method: 'POST',
    });
  }

  async updateGroupMemberRole(groupId: number, userId: number, role: string): Promise<ApiResponse<void>> {
    return this.request(`/groups/${groupId}/members/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async removeGroupMember(groupId: number, userId: number): Promise<ApiResponse<void>> {
    return this.request(`/groups/${groupId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  // User merging
  async mergeUsers(groupId: number, userId: number, mainUserId: number): Promise<ApiResponse<any>> {
    return this.request(`/groups/${groupId}/merge-users`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        main_user_id: mainUserId
      }),
    });
  }

  async unmergeUsers(groupId: number, userId: number): Promise<ApiResponse<any>> {
    return this.request(`/groups/${groupId}/merge-users`, {
      method: 'DELETE',
      body: JSON.stringify({
        user_id: userId
      }),
    });
  }

  async getGroupRules(groupId: number): Promise<ApiResponse<{
    group_id: number;
    group_name: string;
    rules: string | null;
    has_rules: boolean;
  }>> {
    return this.request(`/groups/${groupId}/rules`);
  }

  async acceptGroupRules(groupId: number, rulesVersion: string = 'v1.0'): Promise<ApiResponse<{
    success: boolean;
    message: string;
    timeout_cancelled: boolean;
  }>> {
    return this.request('/rules/accept-rules', {
      method: 'POST',
      body: JSON.stringify({
        group_id: groupId,
        rules_version: rulesVersion
      }),
    });
  }



  // Expense endpoints
  async createExpense(expenseData: ExpenseCreate): Promise<ApiResponse<Expense>> {
    return this.request('/expenses/', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  async getGroupExpenses(groupId: number, filters?: ExpenseFilters): Promise<ApiResponse<Expense[]>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `/groups/${groupId}/expenses${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getExpense(expenseId: number): Promise<ApiResponse<Expense>> {
    return this.request(`/expenses/${expenseId}/`);
  }

  async deleteExpense(expenseId: number): Promise<ApiResponse<void>> {
    return this.request(`/expenses/${expenseId}/`, {
      method: 'DELETE',
    });
  }

  async exportExcel(groupId: number): Promise<ApiResponse<{
    download_url: string;
    filename: string;
  }>> {
    return this.request(`/expenses/${groupId}/export-excel`, {
      method: 'POST',
    });
  }

  async sendExcelToChat(groupId: number): Promise<ApiResponse<{
    status: string;
    message: string;
    telegram_message_id: number;
  }>> {
    return this.request(`/expenses/${groupId}/send-excel-to-chat`, {
      method: 'POST',
    });
  }

  async sendSummaryReportToChat(groupId: number): Promise<ApiResponse<{
    status: string;
    message: string;
    telegram_message_id: number;
  }>> {
    return this.request(`/expenses/${groupId}/send-summary-report-to-chat`, {
      method: 'POST',
    });
  }

  async sendTransfersReportToChat(groupId: number): Promise<ApiResponse<{
    status: string;
    message: string;
    telegram_message_id: number;
  }>> {
    return this.request(`/expenses/${groupId}/send-transfers-report-to-chat`, {
      method: 'POST',
    });
  }

  async sendPdfToChat(groupId: number): Promise<ApiResponse<{
    status: string;
    message: string;
    telegram_message_id: number;
  }>> {
    return this.request(`/expenses/${groupId}/send-pdf-to-chat`, {
      method: 'POST',
    });
  }

  async sendPdfSummaryReportToChat(groupId: number): Promise<ApiResponse<{
    status: string;
    message: string;
    telegram_message_id: number;
  }>> {
    return this.request(`/expenses/${groupId}/send-pdf-summary-report-to-chat`, {
      method: 'POST',
    });
  }

  async sendPdfTransfersReportToChat(groupId: number): Promise<ApiResponse<{
    status: string;
    message: string;
    telegram_message_id: number;
  }>> {
    return this.request(`/expenses/${groupId}/send-pdf-transfers-report-to-chat`, {
      method: 'POST',
    });
  }

  // Debt Reminder API methods
  async getDebtReminderSettings(groupId: number): Promise<ApiResponse<{
    enabled: boolean;
    interval_minutes: number;
    message_template: string;
    last_reminder_sent_at: string | null;
  }>> {
    return this.request(`/groups/${groupId}/debt-reminder-settings`, {
      method: 'GET',
    });
  }

  async updateDebtReminderSettings(
    groupId: number,
    settings: {
      enabled: boolean;
      interval_minutes: number;
      message_template?: string;
    }
  ): Promise<ApiResponse<{
    enabled: boolean;
    interval_minutes: number;
    message_template: string;
    last_reminder_sent_at: string | null;
  }>> {
    return this.request(`/groups/${groupId}/debt-reminder-settings`, {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  async sendDebtReminderNow(groupId: number): Promise<ApiResponse<{
    status: string;
    message: string;
  }>> {
    return this.request(`/groups/${groupId}/send-debt-reminder`, {
      method: 'POST',
    });
  }

  // Decision Time API methods
  async getDecisionTimeSettings(groupId: number): Promise<ApiResponse<{
    enabled: boolean;
    minutes: number;
  }>> {
    return this.request(`/groups/${groupId}/decision-time-settings`, {
      method: 'GET',
    });
  }

  async updateDecisionTimeSettings(
    groupId: number,
    settings: {
      enabled: boolean;
      minutes: number;
    }
  ): Promise<ApiResponse<{
    enabled: boolean;
    minutes: number;
  }>> {
    return this.request(`/groups/${groupId}/decision-time-settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async updateExpense(expenseId: number, expenseData: Partial<ExpenseCreate>): Promise<ApiResponse<Expense>> {
    return this.request(`/expenses/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  }

  // Transfer endpoints
  async createTransfer(transferData: TransferCreate): Promise<ApiResponse<Transfer>> {
    return this.request('/transfers/', {
      method: 'POST',
      body: JSON.stringify(transferData),
    });
  }

  async getMyTransfers(groupId?: number): Promise<ApiResponse<Transfer[]>> {
    const queryParams = groupId ? `?group_id=${groupId}` : '';
    return this.request(`/transfers/${queryParams}`);
  }

  async getTransfer(transferId: number): Promise<ApiResponse<Transfer>> {
    return this.request(`/transfers/${transferId}/`);
  }

  async confirmTransfer(transferId: number): Promise<ApiResponse<void>> {
    return this.request(`/transfers/${transferId}/confirm/`, {
      method: 'POST',
    });
  }

  async cancelTransfer(transferId: number): Promise<ApiResponse<void>> {
    return this.request(`/transfers/${transferId}/cancel/`, {
      method: 'POST',
    });
  }

  async sendTransferNotification(data: {
    group_id: number;
    to_user_id: number;
    amount: number;
    description?: string;
  }): Promise<ApiResponse<{
    success: boolean;
    message: string;
    transfer_id: number;
  }>> {
    return this.request('/transfers/send-notification', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reports endpoints
  async getGroupReport(groupId: number, period: string): Promise<ApiResponse<Report>> {
    return this.request(`/reports/${groupId}?period=${period}`);
  }

  async getUserReport(userId: number, period: string): Promise<ApiResponse<Report>> {
    return this.request(`/reports/user/${userId}?period=${period}`);
  }

  async exportReport(groupId: number, format: 'pdf' | 'excel'): Promise<ApiResponse<Blob>> {
    return this.request(`/reports/${groupId}/export?format=${format}`);
  }

  // Balance endpoints
  async getGroupBalances(groupId: number): Promise<ApiResponse<UserBalance[]>> {
    return this.request(`/groups/${groupId}/balances`);
  }

  async resetGroupDebts(groupId: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/groups/${groupId}/reset-debts`, {
      method: 'POST',
    });
  }

  async getMyBalance(groupId?: number): Promise<ApiResponse<UserBalance[]>> {
    // Use group balances endpoint and filter for current user
    if (groupId) {
      return this.request(`/groups/${groupId}/balances`);
    }
    // For multiple groups, would need to call multiple endpoints
    return this.request(`/users/me/groups`);
  }

  // Test API availability
  // Group status management
  async completeCollection(groupId: number): Promise<ApiResponse<{
    group_id: number;
    group_name: string;
    status: string;
    message: string;
  }>> {
    return this.request(`/groups/${groupId}/complete`, {
      method: 'POST',
    });
  }

  async resumeCollection(groupId: number): Promise<ApiResponse<{
    group_id: number;
    group_name: string;
    status: string;
    message: string;
  }>> {
    return this.request(`/groups/${groupId}/resume`, {
      method: 'POST',
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing API availability...');
      const response = await fetch(`${this.baseUrl.replace('/api/v1', '')}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const isOk = response.ok;
      console.log(`🏥 API health check: ${response.status} - ${isOk ? 'true' : 'false'}`);
      return isOk;
    } catch (error) {
      console.error('❌ API health check failed:', error);
      return false;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Initialize token from localStorage if available
if (typeof window !== 'undefined') {
  const savedToken = localStorage.getItem('auth_token');
  if (savedToken) {
    apiClient.setToken(savedToken);
    console.log('🔑 Token loaded from localStorage and set in API client');
  }
}

// Main API object with all methods
export const api = {
  setToken: (token: string | null) => apiClient.setToken(token),
  
  auth: {
    login: (credentials: { telegram_id: number; username?: string }) => apiClient.login(credentials),
    validateTelegram: (initData: string) => apiClient.validateTelegramAuth(initData),
    refresh: () => apiClient.refreshToken(),
    register: (userData: CreateUserRequest) => apiClient.registerUser(userData),
  },
  
  user: {
    getProfile: (groupId?: number) => apiClient.getMyProfile(groupId),
    updateProfile: (data: UserProfileUpdate) => apiClient.updateMyProfile(data),
    getGroups: () => apiClient.getUserGroups(),
    getById: (id: number) => apiClient.getUserById(id),
    getByTelegramId: (telegramId: number) => apiClient.getUserByTelegramId(telegramId),
    create: (userData: CreateUserRequest) => apiClient.createUser(userData),
    
    // Helper method for create or update
    createOrUpdate: async (userData: CreateTelegramUserRequest): Promise<User> => {
      // Try to get user by telegram ID first
      const getResult = await apiClient.getUserByTelegramId(userData.telegramId);
      
      if (getResult.success && getResult.data) {
        return getResult.data;
      } else {
        // User not found, create new
        const createUserData: CreateUserRequest = {
          telegram_id: userData.telegramId,
          first_name: userData.firstName,
          last_name: userData.lastName,
          username: userData.username,
          language_code: userData.languageCode || 'ru',
        };
        
        const createResult = await apiClient.createUser(createUserData);
        if (createResult.success && createResult.data) {
          return createResult.data;
        }
        throw new Error(createResult.message || 'Failed to create user');
      }
    },
  },
  
  group: {
    create: (data: GroupCreate) => apiClient.createGroup(data),
    getAll: () => apiClient.getAllGroups(),
    getById: (id: number) => apiClient.getGroup(id),
    update: (id: number, data: Partial<GroupCreate>) => apiClient.updateGroup(id, data),
    delete: (id: number) => apiClient.deleteGroup(id),
    
    // Members management
    getMembers: (groupId: number) => apiClient.getGroupMembers(groupId),
    invite: (groupId: number, userId: number) => apiClient.inviteToGroup(groupId, userId),
    join: (groupId: number, _inviteCode?: string) => apiClient.joinGroup(groupId),
    leave: (groupId: number) => apiClient.leaveGroup(groupId),
    updateMemberRole: (groupId: number, userId: number, role: string) => 
      apiClient.updateGroupMemberRole(groupId, userId, role),
    removeMember: (groupId: number, userId: number) => apiClient.removeGroupMember(groupId, userId),
    getRules: (groupId: number) => apiClient.getGroupRules(groupId),
    acceptRules: (groupId: number, rulesVersion?: string) => apiClient.acceptGroupRules(groupId, rulesVersion),
    updateRules: (groupId: number, rules: string) => apiClient.updateGroup(groupId, { rules }),
    
    // User merging
    mergeUsers: (groupId: number, userId: number, mainUserId: number) => apiClient.mergeUsers(groupId, userId, mainUserId),
    unmergeUsers: (groupId: number, userId: number) => apiClient.unmergeUsers(groupId, userId),
    
    // Collection status management
    completeCollection: (groupId: number) => apiClient.completeCollection(groupId),
    resumeCollection: (groupId: number) => apiClient.resumeCollection(groupId),
    
    // Balances
    getBalances: (groupId: number) => apiClient.getGroupBalances(groupId),
    resetDebts: (groupId: number) => apiClient.resetGroupDebts(groupId),
    
    // Debt Reminder settings
    getDebtReminderSettings: (groupId: number) => apiClient.getDebtReminderSettings(groupId),
    updateDebtReminderSettings: (groupId: number, settings: any) => apiClient.updateDebtReminderSettings(groupId, settings),
    sendDebtReminderNow: (groupId: number) => apiClient.sendDebtReminderNow(groupId),
    
    // Decision Time settings
    getDecisionTimeSettings: (groupId: number) => apiClient.getDecisionTimeSettings(groupId),
    updateDecisionTimeSettings: (groupId: number, settings: { enabled: boolean; minutes: number }) => 
      apiClient.updateDecisionTimeSettings(groupId, settings),
  },
  
  expense: {
    create: (data: ExpenseCreate) => apiClient.createExpense(data),
    getByGroup: (groupId: number, filters?: ExpenseFilters) => apiClient.getGroupExpenses(groupId, filters),
    getById: (id: number) => apiClient.getExpense(id),
    update: (id: number, data: Partial<ExpenseCreate>) => apiClient.updateExpense(id, data),
    delete: (id: number) => apiClient.deleteExpense(id),
    exportExcel: (groupId: number) => apiClient.exportExcel(groupId),
    sendExcelToChat: (groupId: number) => apiClient.sendExcelToChat(groupId),
    sendSummaryReportToChat: (groupId: number) => apiClient.sendSummaryReportToChat(groupId),
    sendTransfersReportToChat: (groupId: number) => apiClient.sendTransfersReportToChat(groupId),
    sendPdfToChat: (groupId: number) => apiClient.sendPdfToChat(groupId),
    sendPdfSummaryReportToChat: (groupId: number) => apiClient.sendPdfSummaryReportToChat(groupId),
    sendPdfTransfersReportToChat: (groupId: number) => apiClient.sendPdfTransfersReportToChat(groupId),
  },
  
  transfer: {
    create: (data: TransferCreate) => apiClient.createTransfer(data),
    getAll: (groupId?: number) => apiClient.getMyTransfers(groupId),
    getById: (id: number) => apiClient.getTransfer(id),
    confirm: (id: number) => apiClient.confirmTransfer(id),
    cancel: (id: number) => apiClient.cancelTransfer(id),
    sendNotification: (data: {
      group_id: number;
      to_user_id: number;
      amount: number;
      description?: string;
    }) => apiClient.sendTransferNotification(data),
  },
  
  report: {
    getGroupReport: (groupId: number, period: string) => apiClient.getGroupReport(groupId, period),
    getUserReport: (userId: number, period: string) => apiClient.getUserReport(userId, period),
    export: (groupId: number, format: 'pdf' | 'excel') => apiClient.exportReport(groupId, format),
  },
  
  balance: {
    getMyBalance: (groupId?: number) => apiClient.getMyBalance(groupId),
    getGroupBalances: (groupId: number) => apiClient.getGroupBalances(groupId),
  },
}; 