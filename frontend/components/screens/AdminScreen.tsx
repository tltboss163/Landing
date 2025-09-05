'use client';

import { useExpenses, useGroup, useGroupBalances, useGroupMembers, useUser } from '@/hooks/useApi';
import { designColors } from '@/lib/design-system';
import { useCurrentGroup, useAppStore } from '@/stores/useAppStore';
import { api } from '@/lib/api';
import { StatusToggleButton } from '@/components/ui/StatusToggleButton';
// @ts-ignore
import { ActionIcon, Alert, Badge, Box, Button, Card, Group, Loader, Stack, Text, Switch, NumberInput, TextInput } from '@mantine/core';
// @ts-ignore
import { notifications } from '@mantine/notifications';
// @ts-ignore
import {
    IconAlertCircle,
    IconCrown,
    IconEdit,
    IconRefresh,
    IconSettings,
    IconTarget,
    IconUsers,
    IconDownload,
    IconSend,
    IconFileDescription
// @ts-ignore
} from '@tabler/icons-react';
// @ts-ignore
import { useMemo, useState, useEffect } from 'react';

interface AdminScreenProps {
  userRole: 'admin' | 'participant';
  groupName: string;
  onBackToProfile: () => void;
  onRestartCollection: () => void;
  onCollectionSettings: () => void;
  onParticipantManagement: () => void;
}

export function AdminScreen({ 
  userRole,
  groupName: _groupName,
  onBackToProfile,
  onRestartCollection,
  onCollectionSettings = () => {},
  onParticipantManagement = () => {}
}: AdminScreenProps) {
  const currentGroup = useCurrentGroup();
  const groupId = currentGroup?.group_id;

  // API hooks
  const { user: _user, loading: userLoading, error: userError } = useUser(groupId);
  const { data: group, loading: groupLoading, error: groupError } = useGroup(groupId || 0);
  const { members, loading: membersLoading, error: membersError } = useGroupMembers(groupId || 0);
  const { expenses, loading: expensesLoading, error: expensesError } = useExpenses(groupId || 0);
  const { data: balances, loading: balancesLoading, error: balancesError } = useGroupBalances(groupId || 0);
  const { fetchUserGroups } = useAppStore();

  // Debt reminder states
  // @ts-ignore
  const [reminderSettings, setReminderSettings] = useState<any>(null);
  // @ts-ignore
  const [reminderInterval, setReminderInterval] = useState(1440);
  // @ts-ignore
  const [reminderMessageTemplate, setReminderMessageTemplate] = useState("");
  // @ts-ignore
  const [updatingReminder, setUpdatingReminder] = useState(false);
  // @ts-ignore
  const [sendingReminder, setSendingReminder] = useState(false);

  // Decision time settings states
  // @ts-ignore
  const [decisionTimeSettings, setDecisionTimeSettings] = useState<any>(null);
  // @ts-ignore
  const [decisionTimeMinutes, setDecisionTimeMinutes] = useState(2);
  // @ts-ignore
  const [updatingDecisionTime, setUpdatingDecisionTime] = useState(false);

  // Report handlers
  const handleDownloadReport = async (reportType: 'transactions' | 'summary' | 'transfers') => {
    if (!groupId) return;
    
    try {
      console.log(`Downloading ${reportType} report in Excel format`);
      
      // Use the same pattern as ExpensesScreen for Excel download
      const result = await api.expense.exportExcel(groupId);
      
      if (result.success && result.data) {
        // Download file through Telegram
        if (result.data.download_url && result.data.filename) {
          // Use Telegram downloadFile if available
          if (typeof window !== 'undefined' && window.Telegram?.WebApp?.downloadFile) {
            window.Telegram.WebApp.downloadFile({
              url: result.data.download_url,
              file_name: result.data.filename
            });
          } else {
            // Fallback to browser download
            const link = document.createElement('a');
            link.href = result.data.download_url;
            link.download = result.data.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
      } else {
        console.error('Report download error:', result.message);
      }
    } catch (error) {
      console.error('Download report error:', error);
    }
  };

  const handleDownloadPdfReport = async (reportType: 'transactions' | 'summary' | 'transfers') => {
    if (!groupId) return;
    
    try {
      console.log(`Downloading ${reportType} report in PDF format`);
      
      // Use the reports API for PDF export
      const result = await api.report.export(groupId, 'pdf');
      
      if (result.success && result.data) {
        // Download file through Telegram
        if (result.data.download_url && result.data.filename) {
          // Use Telegram downloadFile if available
          if (typeof window !== 'undefined' && window.Telegram?.WebApp?.downloadFile) {
            window.Telegram.WebApp.downloadFile({
              url: result.data.download_url,
              file_name: result.data.filename
            });
          } else {
            // Fallback to browser download
            const link = document.createElement('a');
            link.href = result.data.download_url;
            link.download = result.data.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
      } else {
        console.error('PDF report download error:', result.message);
      }
    } catch (error) {
      console.error('PDF download report error:', error);
    }
  };

  const handleSendReport = async (reportType: 'transactions' | 'summary' | 'transfers') => {
    if (!groupId) return;
    
    try {
      console.log(`Sending ${reportType} report to chat`);
      
      let result;
      
      // Use different API endpoints for different report types
      switch (reportType) {
        case 'transactions':
          result = await api.expense.sendExcelToChat(groupId);
          break;
        case 'summary':
          result = await api.expense.sendSummaryReportToChat(groupId);
          break;
        case 'transfers':
          result = await api.expense.sendTransfersReportToChat(groupId);
          break;
        default:
          console.error('Unknown report type:', reportType);
          return;
      }
      
      if (result.success) {
        console.log(`${reportType} report sent to chat successfully:`, result.data);
        notifications.show({
          title: '✅ Успешно!',
          message: 'Отчет отправлен в чат',
          color: 'green',
          autoClose: 3000
        });
      } else {
        console.error('Send report error:', result.message);
        notifications.show({
          title: '❌ Ошибка!',
          message: result.message || 'Не удалось отправить отчет',
          color: 'red',
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error('Send report error:', error);
      notifications.show({
        title: '❌ Ошибка!',
        message: 'Не удалось отправить отчет',
        color: 'red',
        autoClose: 5000
      });
    }
  };

  const handleSendPdfReport = async (reportType: 'transactions' | 'summary' | 'transfers') => {
    if (!groupId) return;
    
    try {
      console.log(`Sending ${reportType} PDF report to chat`);
      
      // Use specific PDF endpoints
      let result;
      
      switch (reportType) {
        case 'transactions':
          result = await api.expense.sendPdfToChat(groupId);
          break;
        case 'summary':
          result = await api.expense.sendPdfSummaryReportToChat(groupId);
          break;
        case 'transfers':
          result = await api.expense.sendPdfTransfersReportToChat(groupId);
          break;
        default:
          console.error('Unknown report type:', reportType);
          return;
      }
      
      if (result.success) {
        console.log(`${reportType} PDF report sent to chat successfully:`, result.data);
        notifications.show({
          title: '✅ Успешно!',
          message: 'PDF отчет отправлен в чат',
          color: 'green',
          autoClose: 3000
        });
      } else {
        console.error('Send PDF report error:', result.message);
        notifications.show({
          title: '❌ Ошибка!',
          message: result.message || 'Не удалось отправить PDF отчет',
          color: 'red',
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error('Send PDF report error:', error);
      notifications.show({
        title: '❌ Ошибка!',
        message: 'Не удалось отправить PDF отчет',
        color: 'red',
        autoClose: 5000
      });
    }
  };

  // Debt reminder handlers
  useEffect(() => {
    if (groupId) {
      loadReminderSettings();
      loadDecisionTimeSettings();
    }
  }, [groupId]);

  const loadReminderSettings = async () => {
    if (!groupId) return;
    
    try {
      console.log('Loading reminder settings for group:', groupId);
      const result = await api.group.getDebtReminderSettings(groupId);
      console.log('Reminder settings result:', result);
      if (result.success && result.data) {
        setReminderSettings(result.data);
        setReminderInterval(result.data.interval_minutes);
        setReminderMessageTemplate(result.data.message_template || "");
      }
    } catch (error) {
      console.error('Error loading reminder settings:', error);
    }
  };

  const loadDecisionTimeSettings = async () => {
    if (!groupId) return;
    
    try {
      console.log('Loading decision time settings for group:', groupId);
      const result = await api.group.getDecisionTimeSettings(groupId);
      console.log('Decision time settings result:', result);
      if (result.success && result.data) {
        setDecisionTimeSettings(result.data);
        setDecisionTimeMinutes(result.data.minutes);
      }
    } catch (error) {
      console.error('Error loading decision time settings:', error);
    }
  };

  const handleReminderToggle = async () => {
    if (!groupId) return;
    
    console.log('Toggling reminder for group:', groupId);
    setUpdatingReminder(true);
    try {
      const newEnabled = !reminderSettings?.enabled;
      console.log('New enabled state:', newEnabled);
      const result = await api.group.updateDebtReminderSettings(groupId, {
        enabled: newEnabled,
        interval_minutes: reminderInterval,
        message_template: reminderMessageTemplate
      });
      
      console.log('Update reminder result:', result);
      if (result.success && result.data) {
        setReminderSettings(result.data);
      }
    } catch (error) {
      console.error('Error updating reminder settings:', error);
    } finally {
      setUpdatingReminder(false);
    }
  };

  const handleUpdateReminderSettings = async () => {
    if (!groupId || !reminderSettings?.enabled) return;
    
    setUpdatingReminder(true);
    try {
      const result = await api.group.updateDebtReminderSettings(groupId, {
        enabled: true,
        interval_minutes: reminderInterval,
        message_template: reminderMessageTemplate
      });
      
      if (result.success && result.data) {
        setReminderSettings(result.data);
      }
    } catch (error) {
      console.error('Error updating reminder settings:', error);
    } finally {
      setUpdatingReminder(false);
    }
  };

  const handleSendReminderNow = async () => {
    if (!groupId) return;
    
    setSendingReminder(true);
    try {
      const result = await api.group.sendDebtReminderNow(groupId);
      if (result.success) {
        // Success
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
    } finally {
      setSendingReminder(false);
    }
  };

  // Decision time handlers
  const handleDecisionTimeToggle = async () => {
    if (!groupId) return;
    
    const newEnabled = !decisionTimeSettings?.enabled;
    setUpdatingDecisionTime(true);
    try {
      const result = await api.group.updateDecisionTimeSettings(groupId, {
        enabled: newEnabled,
        minutes: decisionTimeMinutes
      });
      
      if (result.success && result.data) {
        setDecisionTimeSettings(result.data);
      }
    } catch (error) {
      console.error('Error updating decision time settings:', error);
    } finally {
      setUpdatingDecisionTime(false);
    }
  };

  const handleUpdateDecisionTimeSettings = async () => {
    if (!groupId || !decisionTimeSettings?.enabled) return;
    
    setUpdatingDecisionTime(true);
    try {
      const result = await api.group.updateDecisionTimeSettings(groupId, {
        enabled: true,
        minutes: decisionTimeMinutes
      });
      
      if (result.success && result.data) {
        setDecisionTimeSettings(result.data);
      }
    } catch (error) {
      console.error('Error updating decision time settings:', error);
    } finally {
      setUpdatingDecisionTime(false);
    }
  };

  // Calculate collection data from API
  const collectionData = useMemo(() => {
    if (!group || !members || !expenses || !balances || !currentGroup) return null;

    const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + parseFloat(expense.amount), 0);
    // totalPaid is just the sum of all expenses (everything that was actually paid)
    const totalPaid = totalExpenses;
    const activeMembers = members.filter((member: any) => member.is_active);
    const amountPerPerson = totalExpenses / (activeMembers.length || 1);

    return {
      title: currentGroup.group_name,
      totalAmount: totalExpenses,
      collectedAmount: totalPaid,
      participantsCount: activeMembers.length,
      amountPerPerson,
      status: currentGroup.status.toLowerCase(), // Use actual group status
      createdDate: new Date(group.created_at).toLocaleDateString('ru-RU'),
      lastActivity: expenses.length > 0 ? 
        new Date(expenses[expenses.length - 1].created_at).toLocaleDateString('ru-RU') : 
        'Нет активности'
    };
  }, [group, members, expenses, balances, currentGroup]);

  // Loading state
  if (userLoading || groupLoading || membersLoading || expensesLoading || balancesLoading) {
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
            Загрузка данных администратора...
          </Text>
        </Stack>
      </Box>
    );
  }

  // Error state
  if (userError || groupError || membersError || expensesError || balancesError) {
    return (
      <Box
        style={{
          backgroundColor: designColors.backgrounds.primary,
          minHeight: '100vh',
          paddingBottom: '100px'
        }}
      >
        <Stack p="md" pt="xl" gap="md">
          <Alert 
            icon={<IconAlertCircle size="1rem" />} 
            title="Ошибка загрузки" 
            color="red"
            style={{ backgroundColor: designColors.backgrounds.cards }}
          >
            Не удалось загрузить данные для админ-панели. Проверьте соединение и попробуйте позже.
          </Alert>
        </Stack>
      </Box>
    );
  }



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0
    }).format(amount) + ' ₽';
  };

  const getProgress = () => {
    if (!collectionData) return 0;
    return Math.round((collectionData.collectedAmount / collectionData.totalAmount) * 100);
  };

  // Check if user has admin access
  if (userRole !== 'admin') {
    return (
      <Box
        style={{
          backgroundColor: designColors.backgrounds.primary,
          minHeight: '100vh',
          paddingBottom: '100px'
        }}
      >
        <Group justify="center" align="center" style={{ minHeight: '50vh' }}>
          <Stack gap="md" align="center">
            <Text 
              size="xl"
              style={{ fontSize: '48px' }}
            >
              🔒
            </Text>
            <Text 
              size="lg"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600,
                textAlign: 'center'
              }}
            >
              Доступ запрещен
            </Text>
            <Text 
              size="sm"
              style={{ 
                color: designColors.text.secondary,
                textAlign: 'center'
              }}
            >
              Только администратор может управлять группой
            </Text>
          </Stack>
        </Group>
      </Box>
    );
  }

  if (!collectionData) {
    return (
      <Box
        style={{
          backgroundColor: designColors.backgrounds.primary,
          minHeight: '100vh',
          paddingBottom: '100px'
        }}
      >
        <Stack p="md" pt="xl" gap="md">
          <Text style={{ color: designColors.text.secondary }}>
            Нет данных о группе
          </Text>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      style={{
        backgroundColor: designColors.backgrounds.primary,
        minHeight: '100vh',
        paddingBottom: '100px'
      }}
    >
      {/* Header */}
      <Group justify="space-between" align="center" p="md" pt="xl">
        <Group gap="xs">
          <IconCrown size={24} style={{ color: designColors.semantic.warning }} />
          <Text 
            size="xl"
            style={{ 
              color: designColors.text.primary,
              fontWeight: 600
            }}
          >
            Админ панель
          </Text>
        </Group>
        
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          onClick={onCollectionSettings}
        >
          <IconSettings size={20} style={{ color: designColors.text.secondary }} />
        </ActionIcon>
      </Group>

      <Stack gap="lg" p="md">
        {/* Group Status */}
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
            <IconTarget size={20} style={{ color: designColors.accents.fabButton }} />
            <Text 
              size="md"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              Статус группы
            </Text>
            <Badge 
              color={collectionData.status === 'active' ? "green" : "blue"}
              size="sm"
            >
              {collectionData.status === 'active' ? 'Активная' : 'Завершена'}
            </Badge>
          </Group>
          
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text 
                size="lg"
                style={{ 
                  color: designColors.text.primary,
                  fontWeight: 600
                }}
              >
                {collectionData.title}
              </Text>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={onCollectionSettings}
              >
                <IconEdit size={16} style={{ color: designColors.text.secondary }} />
              </ActionIcon>
            </Group>
            
            <Group justify="space-between" align="center">
              <Text 
                size="sm"
                style={{ color: designColors.text.secondary }}
              >
                Общие расходы: {formatCurrency(collectionData.totalAmount)}
              </Text>
              <Text 
                size="sm"
                style={{ 
                  color: designColors.accents.fabButton,
                  fontWeight: 600
                }}
              >
                Оплачено: {formatCurrency(collectionData.collectedAmount)}
              </Text>
            </Group>
            
            <Group justify="space-between" align="center">
              <Text 
                size="xs"
                style={{ color: designColors.text.tertiary }}
              >
                Создана: {collectionData.createdDate}
              </Text>
              <Text 
                size="xs"
                style={{ color: designColors.text.tertiary }}
              >
                Последняя активность: {collectionData.lastActivity}
              </Text>
            </Group>
          </Stack>
        </Card>

        {/* Group Management */}
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
            <Text 
              style={{ fontSize: '18px' }}
            >
              ⚙️
            </Text>
            <Text 
              size="md"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              Управление группой
            </Text>
          </Group>
          
          <Stack gap="sm">
            <Button 
              variant="light"
              leftSection={<IconTarget size={16} />}
              onClick={onCollectionSettings}
              styles={{
                root: {
                  backgroundColor: designColors.accents.fabButton + '20',
                  color: designColors.accents.fabButton,
                  border: 'none',
                  paddingLeft: '44px'
                }
              }}
            >
              Настройки группы
            </Button>
            
            <Button 
              variant="light"
              leftSection={<IconUsers size={16} />}
              onClick={onParticipantManagement}
              styles={{
                root: {
                  backgroundColor: designColors.semantic.transfer + '20',
                  color: designColors.semantic.transfer,
                  border: 'none',
                  paddingLeft: '44px'
                }
              }}
            >
              Управление участниками
            </Button>
            

          </Stack>
        </Card>

        {/* Collection Status Management */}
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
            <Text 
              style={{ fontSize: '18px' }}
            >
              ⏸️
            </Text>
            <Text 
              size="md"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              Управление сбором
            </Text>
          </Group>
          
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Stack gap="xs">
                <Text 
                  size="sm"
                  style={{ 
                    color: designColors.text.primary,
                    fontWeight: 600
                  }}
                >
                  Статус сбора
                </Text>
                <Text 
                  size="xs"
                  style={{ color: designColors.text.secondary }}
                >
                  {collectionData?.status === 'active' 
                    ? 'Сбор активен - участники могут добавлять расходы' 
                    : 'Сбор завершен - добавление расходов остановлено'
                  }
                </Text>
              </Stack>
              
              <StatusToggleButton
                groupId={groupId || 0}
                groupStatus={collectionData?.status || 'active'}
                userRole="admin"
                onStatusChange={async (newStatus: string) => {
                  // Refresh data after status change
                  await fetchUserGroups();
                }}
              />
            </Group>
          </Stack>
        </Card>

        {/* Reports Section */}
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
            <Text 
              style={{ fontSize: '18px' }}
            >
              📊
            </Text>
            <Text 
              size="md"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              Отчеты
            </Text>
          </Group>
          
          <Stack gap="md">
            {/* Report 1: All Transactions */}
            <Card
              radius="md"
              p="md"
              style={{
                backgroundColor: designColors.backgrounds.secondary,
                border: 'none'
              }}
            >
              <Group gap="xs" mb="sm">
                <Text style={{ fontSize: '16px' }}>📋</Text>
                <Text 
                  size="sm"
                  style={{ 
                    color: designColors.text.primary,
                    fontWeight: 600
                  }}
                >
                  Отчет 1: Все транзакции
                </Text>
              </Group>
              <Text 
                size="xs"
                style={{ color: designColors.text.secondary }}
                mb="sm"
              >
                Лог всех расходов накопительным итогом
              </Text>
              <Group gap="xs">
                <Button 
                  size="xs"
                  variant="light"
                  leftSection={<IconDownload size={14} />}
                  onClick={() => handleDownloadReport('transactions')}
                  styles={{
                    root: {
                      backgroundColor: designColors.accents.fabButton + '20',
                      color: designColors.accents.fabButton,
                      border: 'none'
                    }
                  }}
                >
                  XLSX
                </Button>
                <Button 
                  size="xs"
                  variant="light"
                  leftSection={<IconFileDescription size={14} />}
                  onClick={() => handleDownloadPdfReport('transactions')}
                  styles={{
                    root: {
                      backgroundColor: designColors.semantic.error + '20',
                      color: designColors.semantic.error,
                      border: 'none'
                    }
                  }}
                >
                  PDF
                </Button>
                <Button 
                  size="xs"
                  variant="light"
                  leftSection={<IconSend size={14} />}
                  onClick={() => handleSendReport('transactions')}
                  styles={{
                    root: {
                      backgroundColor: designColors.semantic.success + '20',
                      color: designColors.semantic.success,
                      border: 'none'
                    }
                  }}
                >
                  В чат
                </Button>
                <Button 
                  size="xs"
                  variant="light"
                  leftSection={<IconSend size={14} />}
                  onClick={() => handleSendPdfReport('transactions')}
                  styles={{
                    root: {
                      backgroundColor: designColors.semantic.warning + '20',
                      color: designColors.semantic.warning,
                      border: 'none'
                    }
                  }}
                >
                  PDF в чат
                </Button>
              </Group>
            </Card>

            {/* Report 2: Summary Table */}
            <Card
              radius="md"
              p="md"
              style={{
                backgroundColor: designColors.backgrounds.secondary,
                border: 'none'
              }}
            >
              <Group gap="xs" mb="sm">
                <Text style={{ fontSize: '16px' }}>📊</Text>
                <Text 
                  size="sm"
                  style={{ 
                    color: designColors.text.primary,
                    fontWeight: 600
                  }}
                >
                  Отчет 2: Сводная таблица
                </Text>
              </Group>
              <Text 
                size="xs"
                style={{ color: designColors.text.secondary }}
                mb="sm"
              >
                Кто сколько потратил и сколько должен
              </Text>
              <Group gap="xs">
                <Button 
                  size="xs"
                  variant="light"
                  leftSection={<IconDownload size={14} />}
                  onClick={() => handleDownloadReport('summary')}
                  styles={{
                    root: {
                      backgroundColor: designColors.accents.fabButton + '20',
                      color: designColors.accents.fabButton,
                      border: 'none'
                    }
                  }}
                >
                  XLSX
                </Button>
                <Button 
                  size="xs"
                  variant="light"
                  leftSection={<IconFileDescription size={14} />}
                  onClick={() => handleDownloadPdfReport('summary')}
                  styles={{
                    root: {
                      backgroundColor: designColors.semantic.error + '20',
                      color: designColors.semantic.error,
                      border: 'none'
                    }
                  }}
                >
                  PDF
                </Button>
                <Button 
                  size="xs"
                  variant="light"
                  leftSection={<IconSend size={14} />}
                  onClick={() => handleSendReport('summary')}
                  styles={{
                    root: {
                      backgroundColor: designColors.semantic.success + '20',
                      color: designColors.semantic.success,
                      border: 'none'
                    }
                  }}
                >
                  В чат
                </Button>
                <Button 
                  size="xs"
                  variant="light"
                  leftSection={<IconSend size={14} />}
                  onClick={() => handleSendPdfReport('summary')}
                  styles={{
                    root: {
                      backgroundColor: designColors.semantic.warning + '20',
                      color: designColors.semantic.warning,
                      border: 'none'
                    }
                  }}
                >
                  PDF в чат
                </Button>
              </Group>
            </Card>

            {/* Report 3: Transfers */}
            <Card
              radius="md"
              p="md"
              style={{
                backgroundColor: designColors.backgrounds.secondary,
                border: 'none'
              }}
            >
              <Group gap="xs" mb="sm">
                <Text style={{ fontSize: '16px' }}>💸</Text>
                <Text 
                  size="sm"
                  style={{ 
                    color: designColors.text.primary,
                    fontWeight: 600
                  }}
                >
                  Отчет 3: Переводы
                </Text>
              </Group>
              <Text 
                size="xs"
                style={{ color: designColors.text.secondary }}
                mb="sm"
              >
                История всех переводов между участниками
              </Text>
              <Group gap="xs">
                <Button 
                  size="xs"
                  variant="light"
                  leftSection={<IconDownload size={14} />}
                  onClick={() => handleDownloadReport('transfers')}
                  styles={{
                    root: {
                      backgroundColor: designColors.accents.fabButton + '20',
                      color: designColors.accents.fabButton,
                      border: 'none'
                    }
                  }}
                >
                  XLSX
                </Button>
                <Button 
                  size="xs"
                  variant="light"
                  leftSection={<IconFileDescription size={14} />}
                  onClick={() => handleDownloadPdfReport('transfers')}
                  styles={{
                    root: {
                      backgroundColor: designColors.semantic.error + '20',
                      color: designColors.semantic.error,
                      border: 'none'
                    }
                  }}
                >
                  PDF
                </Button>
                <Button 
                  size="xs"
                  variant="light"
                  leftSection={<IconSend size={14} />}
                  onClick={() => handleSendReport('transfers')}
                  styles={{
                    root: {
                      backgroundColor: designColors.semantic.success + '20',
                      color: designColors.semantic.success,
                      border: 'none'
                    }
                  }}
                >
                  В чат
                </Button>
                <Button 
                  size="xs"
                  variant="light"
                  leftSection={<IconSend size={14} />}
                  onClick={() => handleSendPdfReport('transfers')}
                  styles={{
                    root: {
                      backgroundColor: designColors.semantic.warning + '20',
                      color: designColors.semantic.warning,
                      border: 'none'
                    }
                  }}
                >
                  PDF в чат
                </Button>
              </Group>
            </Card>
          </Stack>
        </Card>

        {/* Group Statistics */}
        <Group gap="md">
          <Card
            radius="lg"
            p="md"
            style={{
              backgroundColor: designColors.backgrounds.cards,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              flex: 1
            }}
          >
            <Group gap="xs" mb="xs">
              <Text style={{ fontSize: '16px' }}>👥</Text>
              <Text size="sm" style={{ color: designColors.text.secondary }}>
                Участников
              </Text>
            </Group>
            <Text 
              size="lg"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              {collectionData.participantsCount}
            </Text>
          </Card>

          <Card
            radius="lg"
            p="md"
            style={{
              backgroundColor: designColors.backgrounds.cards,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              flex: 1
            }}
          >
            <Group gap="xs" mb="xs">
              <Text style={{ fontSize: '16px' }}>💰</Text>
              <Text size="sm" style={{ color: designColors.text.secondary }}>
                В среднем
              </Text>
            </Group>
            <Text 
              size="lg"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              {formatCurrency(collectionData.amountPerPerson)}
            </Text>
          </Card>
        </Group>

        {/* Progress Info */}
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
            <Text 
              style={{ fontSize: '18px' }}
            >
              📊
            </Text>
            <Text 
              size="md"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              Статистика
            </Text>
          </Group>
          
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text 
                size="sm"
                style={{ color: designColors.text.secondary }}
              >
                Общий прогресс оплаты:
              </Text>
              <Text 
                size="sm"
                style={{ 
                  color: getProgress() >= 100 ? designColors.semantic.success : designColors.accents.fabButton,
                  fontWeight: 600
                }}
              >
                {getProgress()}%
              </Text>
            </Group>
            
            <Group justify="space-between" align="center">
              <Text 
                size="sm"
                style={{ color: designColors.text.secondary }}
              >
                Всего расходов:
              </Text>
              <Text 
                size="sm"
                style={{ 
                  color: designColors.text.primary,
                  fontWeight: 600
                }}
              >
                {expenses?.length || 0}
              </Text>
            </Group>
          </Stack>
        </Card>

        {/* Debt Reminder Settings */}
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
            <Text style={{ fontSize: '18px' }}>⏰</Text>
            <Text 
              size="md"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              Таймер напоминаний о долгах
            </Text>
          </Group>
          
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Stack gap="xs">
                <Text 
                  size="sm"
                  style={{ 
                    color: designColors.text.primary,
                    fontWeight: 600
                  }}
                >
                  Статус таймера
                </Text>
                <Text 
                  size="xs"
                  style={{ color: designColors.text.secondary }}
                >
                  {reminderSettings?.enabled 
                    ? `Напоминания отправляются каждые ${reminderSettings.interval_minutes} минут` 
                    : 'Таймер напоминаний выключен'
                  }
                </Text>
              </Stack>
              
              <Switch
                checked={reminderSettings?.enabled || false}
                onChange={handleReminderToggle}
                size="md"
                color="blue"
              />
            </Group>
            
            {reminderSettings?.enabled && (
              <>
                <Group gap="xs">
                  <Text 
                    size="sm"
                    style={{ 
                      color: designColors.text.primary,
                      fontWeight: 600
                    }}
                  >
                    Интервал (минуты):
                  </Text>
                  <NumberInput
                    value={reminderInterval}
                    onChange={setReminderInterval}
                    min={1}
                    max={10080}
                    step={1}
                    size="xs"
                    style={{ width: '100px' }}
                  />
                </Group>
                
                <Box>
                  <Text 
                    size="sm"
                    style={{ 
                      color: designColors.text.primary,
                      fontWeight: 600,
                      marginBottom: '8px'
                    }}
                  >
                    Шаблон сообщения:
                  </Text>
                  <TextInput
                    placeholder="Например: @{debtor_username}, вы должны @{creditor_username}: {amount}₽"
                    value={reminderMessageTemplate}
                    onChange={(e) => setReminderMessageTemplate(e.target.value)}
                    styles={{
                      input: {
                        backgroundColor: designColors.backgrounds.secondary,
                        border: `1px solid ${designColors.text.tertiary}`,
                        color: designColors.text.primary,
                        '&::placeholder': {
                          color: designColors.text.secondary
                        }
                      }
                    }}
                  />
                  <Text 
                    size="xs"
                    style={{ 
                      color: designColors.text.secondary,
                      marginTop: '4px'
                    }}
                  >
                    Доступные переменные: {'{debtor_username}'}, {'{creditor_username}'}, {'{amount}'}
                  </Text>
                </Box>
                
                <Box>
                  <Text 
                    size="sm"
                    style={{ 
                      color: designColors.text.primary,
                      fontWeight: 600,
                      marginBottom: '8px'
                    }}
                  >
                    Пример сообщения:
                  </Text>
                  <Box
                    style={{
                      padding: '12px',
                      backgroundColor: designColors.backgrounds.secondary,
                      borderRadius: '8px',
                      border: `1px solid ${designColors.text.tertiary}`
                    }}
                  >
                    <Text 
                      size="sm"
                      style={{ 
                        color: designColors.text.secondary,
                        fontFamily: 'monospace'
                      }}
                    >
                      {reminderMessageTemplate || "Шаблон не задан"}
                    </Text>
                  </Box>
                </Box>
                
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="light"
                    onClick={handleUpdateReminderSettings}
                    loading={updatingReminder}
                  >
                    Обновить настройки
                  </Button>
                  
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={handleSendReminderNow}
                    loading={sendingReminder}
                  >
                    Отправить сейчас
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        </Card>

        {/* Decision Time Settings */}
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
            <Text style={{ fontSize: '18px' }}>⏱️</Text>
            <Text 
              size="md"
              style={{ 
                color: designColors.text.primary,
                fontWeight: 600
              }}
            >
              Время принятия правил
            </Text>
          </Group>
          
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Stack gap="xs">
                <Text 
                  size="sm"
                  style={{ 
                    color: designColors.text.primary,
                    fontWeight: 600
                  }}
                >
                  Статус таймера
                </Text>
                <Text 
                  size="xs"
                  style={{ color: designColors.text.secondary }}
                >
                  {decisionTimeSettings?.enabled 
                    ? `Участники имеют ${decisionTimeSettings.minutes} минут для принятия правил` 
                    : 'Таймер принятия правил выключен'
                  }
                </Text>
              </Stack>
              
              <Switch
                checked={decisionTimeSettings?.enabled || false}
                onChange={handleDecisionTimeToggle}
                size="md"
                color="blue"
              />
            </Group>
            
            {decisionTimeSettings?.enabled && (
              <>
                <Group gap="xs">
                  <Text 
                    size="sm"
                    style={{ 
                      color: designColors.text.primary,
                      fontWeight: 600
                    }}
                  >
                    Время (минуты):
                  </Text>
                  <NumberInput
                    value={decisionTimeMinutes}
                    onChange={setDecisionTimeMinutes}
                    min={1}
                    max={60}
                    step={1}
                    size="xs"
                    style={{ width: '100px' }}
                  />
                </Group>
                
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="light"
                    onClick={handleUpdateDecisionTimeSettings}
                    loading={updatingDecisionTime}
                  >
                    Обновить настройки
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        </Card>

        {/* Danger Zone */}
        <Card
          radius="lg"
          p="lg"
          style={{
            backgroundColor: designColors.backgrounds.cards,
            border: `1px solid ${designColors.semantic.warning}40`,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Group gap="xs" mb="md">
            <Text 
              style={{ fontSize: '18px' }}
            >
              ⚠️
            </Text>
            <Text 
              size="md"
              style={{ 
                color: designColors.semantic.warning,
                fontWeight: 600
              }}
            >
              Сброс долгов
            </Text>
          </Group>
          
          <Stack gap="sm">
            <Text 
              size="sm"
              style={{ 
                color: designColors.text.secondary,
                marginBottom: '8px'
              }}
            >
              Это действие сбросит все долги участников. Будьте осторожны!
            </Text>
            
            <Button 
              variant="outline"
              color="orange"
              leftSection={<IconRefresh size={16} />}
              onClick={onRestartCollection}
              styles={{
                root: {
                  borderColor: designColors.semantic.warning,
                  paddingLeft: '44px'
                }
              }}
            >
              Сбросить все долги
            </Button>
          </Stack>
        </Card>

        {/* Help */}
        <Card
          radius="lg"
          p="md"
          style={{
            backgroundColor: designColors.backgrounds.cards,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Text 
            size="sm"
            style={{ 
              color: designColors.text.secondary,
              textAlign: 'center',
              lineHeight: 1.4
            }}
          >
            💡 Как администратор, вы можете управлять группой, участниками 
            и следить за прогрессом расходов. Все изменения влияют на всех участников.
          </Text>
        </Card>
      </Stack>
    </Box>
  );
} 