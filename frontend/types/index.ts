// Пользователь
export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name: string;          // Из Telegram
  last_name?: string;          // Из Telegram
  
  // Профиль пользователя (заполняется при регистрации)
  profile_first_name?: string; // Введенное пользователем
  profile_last_name?: string;  // Введенное пользователем
  avatar_url?: string;         // Аватарка из Telegram
  is_profile_completed: boolean; // Завершен ли профиль
  
  email?: string;
  phone_number?: string;
  language_code: string;
  timezone: string;
  is_active: boolean;
  currency_symbol: string;
  notification_enabled: boolean;
  created_at: string;
  last_active_at: string;
  
  // Динамические поля (заполняются в эндпоинте /users/me)
  is_registered_in_group?: boolean;
  group_role?: string;
  rules_accepted?: boolean;
  include_in_expenses?: boolean;
}

// Группа
export interface Group {
  id: number;
  name: string;
  description?: string;
  status: string;
  currency: string;
  currency_symbol: string;
  created_at: string;
  member_count: number;
}

// Информация о группе для текущего пользователя (из /users/me/groups)
export interface UserGroup {
  group_id: number;
  group_name: string;
  role: string;
  is_active: boolean;
  joined_at: string;
  debt_amount: string; // ОТКАТ: отформатированная валюта как в backend
  status: string; // Group status (ACTIVE/COMPLETED/ARCHIVED) - ИСПРАВЛЕНИЕ: сделано обязательным
}

// Участник группы
export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  profile_first_name?: string;
  profile_last_name?: string;
  role: string;
  is_active: boolean;
  joined_at: string;
  rules_accepted_at: string | null;
  has_accepted_rules: boolean;
  user?: User;
  group?: Group;
}

// Расход
export interface Expense {
  id: number;
  group_id: number;
  amount: string;
  description: string;
  category: string;
  paid_by_name: string;
  created_at: string;
  is_paid_by_current_user: boolean;
  participants_count: number;
  paid_by_user?: User;
  group?: Group;
  splits?: ExpenseSplit[];
}

// Деление расхода
export interface ExpenseSplit {
  id: number;
  expense_id: number;
  user_id: number;
  amount: number;
  created_at: string;
  user?: User;
  expense?: Expense;
}

// Перевод
export interface Transfer {
  id: number;
  from_user_id: number;
  to_user_id: number;
  amount: string;
  description?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  group_id?: number;  // Add group_id to track which group the transfer belongs to
  created_at: string;
  confirmed_at?: string;
  from_user: {
    id: number;
    first_name: string;
    last_name: string | null;
    profile_first_name: string | null;
    profile_last_name: string | null;
    display_name: string;
  };
  to_user: {
    id: number;
    first_name: string;
    last_name: string | null;
    profile_first_name: string | null;
    profile_last_name: string | null;
    display_name: string;
  };
}

// Отчет
export interface Report {
  id: number;
  group_id: number;
  period: string;
  total_expenses: string;
  total_income: string;
  category_breakdown: CategoryBreakdown[];
  member_breakdown: MemberBreakdown[];
  created_at: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: string;
  percentage: number;
}

export interface MemberBreakdown {
  user_id: number;
  user_name: string;
  total_spent: string;
  percentage: number;
}

// Настройки уведомлений
export interface NotificationSettings {
  id: number;
  user_id: number;
  push_enabled: boolean;
  email_enabled: boolean;
  telegram_enabled: boolean;
  new_expense_notifications: boolean;
  debt_reminder_notifications: boolean;
  payment_notifications: boolean;
  weekly_summary: boolean;
  do_not_disturb_start?: string;
  do_not_disturb_end?: string;
}

// Способ оплаты
export interface PaymentMethod {
  id: number;
  user_id: number;
  type: 'card' | 'phone' | 'wallet';
  name: string;
  details: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

// Баланс пользователя в группе
export interface UserBalance {
  user_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  profile_first_name?: string;
  profile_last_name?: string;
  balance: number;  // Numeric balance
  owes_amount: number;  // Numeric amount owed
  owed_amount: number;  // Numeric amount to be received
  balance_formatted: string;  // Formatted currency string
  owes_amount_formatted: string;  // Formatted currency string
  owed_amount_formatted: string;  // Formatted currency string
}

// API Response типы
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// OAuth2 Token Response
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// Legacy auth response (if needed)
export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// Request типы
export interface CreateUserRequest {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  profile_first_name?: string;
  profile_last_name?: string;
  username?: string;
  language_code?: string;
  email?: string;
  phone_number?: string;
  timezone?: string;
  currency_symbol?: string;
  // group_id?: number;  // REMOVED: Registration is now global, not group-specific
}

export interface UserProfileUpdate {
  first_name?: string;
  last_name?: string;
  profile_first_name?: string;
  profile_last_name?: string;
  email?: string;
  phone_number?: string;
  timezone?: string;
  currency_symbol?: string;
  notification_enabled?: boolean;
}

export interface CreateTelegramUserRequest {
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  photoUrl?: string;
}

export interface GroupCreate {
  name: string;
  description?: string;
  currency?: string;
  currency_symbol?: string;
}

export interface ExpenseCreate {
  group_id: number;
  amount: number;
  description: string;
  category?: string;
  split_type?: 'equal' | 'selected' | 'custom';
  participant_ids?: number[];
}

export interface TransferCreate {
  to_user_id: number;
  amount: number;
  description?: string;
  group_id: number;
}

export interface CreateExpenseRequest {
  amount: number;
  description: string;
  participants: number[]; // user_ids
  split_type?: 'equal' | 'manual' | 'percentage';
  split_data?: Record<string, number>; // для manual и percentage
}

export interface ExpenseFilters {
  group_id?: number;
  paid_by_user_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

// WebApp типы
export interface WebAppData {
  action: 'registration' | 'add_expense' | 'accept_rules';
  user_data?: CreateUserRequest;
  expense_data?: CreateExpenseRequest;
  group_id?: number;
}

// Store типы
export interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Groups state
  currentGroup: UserGroup | null;
  groups: UserGroup[];
  groupMembers: GroupMember[];
  
  // Expenses state
  expenses: Expense[];
  userBalances: UserBalance[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
}

// Telegram типы
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramInitData {
  user?: TelegramUser;
  chat_type?: string;
  chat_instance?: string;
  auth_date: number;
  hash: string;
  query_id?: string;
  start_param?: string;
}

// Form типы
export interface RegistrationFormData {
  phone?: string;
  display_name: string;
  accept_rules: boolean;
}

export interface ExpenseFormData {
  amount: string;
  description: string;
  participants: number[];
  split_type: 'equal' | 'manual' | 'percentage';
  split_data: Record<string, string>;
} 