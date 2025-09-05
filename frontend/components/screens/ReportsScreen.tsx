'use client';

import { designColors } from '@/lib/design-system';
import { ActionIcon, Badge, Box, Button, Card, Group, Select, Stack, Text } from '@mantine/core';
import {
    IconCalendar,
    IconDownload,
    IconFileDescription,
    IconFileSpreadsheet,
    IconFilter,
    IconUsers
} from '@tabler/icons-react';
import { useState } from 'react';

interface ReportsScreenProps {
  onGenerateExcel: (period: string, type: string) => void;
  onGeneratePdf: (period: string, type: string) => void;
}

export function ReportsScreen({ onGenerateExcel, onGeneratePdf }: ReportsScreenProps) {
    
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Mock данные
  const reportStats = {
    totalExpenses: 45800,
    totalTransfers: 12300,
    participantCount: 8,
    transactionCount: 127,
    lastReportDate: '15.01.2024'
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0
    }).format(amount) + ' ₽';
  };

  const periodOptions = [
    { value: 'week', label: 'За неделю' },
    { value: 'month', label: 'За месяц' },
    { value: 'quarter', label: 'За квартал' },
    { value: 'all', label: 'За все время' }
  ];

  const typeOptions = [
    { value: 'all', label: 'Все операции' },
    { value: 'expenses', label: 'Только расходы' },
    { value: 'transfers', label: 'Только переводы' },
    { value: 'summary', label: 'Сводный отчет' }
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
        <Group gap="xs">
          <Text 
            size="xl"
            style={{ 
              color: designColors.text.primary,
              fontWeight: 600
            }}
          >
            📈 Отчеты
          </Text>
        </Group>
        
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
        >
          <IconFilter size={20} style={{ color: designColors.text.secondary }} />
        </ActionIcon>
      </Group>

      <Stack gap="lg" p="md">
        {/* Report Statistics */}
        <Card
          radius="lg"
          p="lg"
          style={{
            backgroundColor: designColors.backgrounds.cards,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Text 
            size="md"
            mb="md"
            style={{ 
              color: designColors.text.primary,
              fontWeight: 600
            }}
          >
            📊 Статистика группы
          </Text>
          
          <Group gap="xl">
            <Stack gap="xs" align="center" style={{ flex: 1 }}>
              <Text 
                size="lg"
                style={{ 
                  color: designColors.amounts.negative,
                  fontWeight: 600
                }}
              >
                {formatCurrency(reportStats.totalExpenses)}
              </Text>
              <Text 
                size="xs"
                ta="center"
                style={{ color: designColors.text.secondary }}
              >
                Общие расходы
              </Text>
            </Stack>
            
            <Stack gap="xs" align="center" style={{ flex: 1 }}>
              <Text 
                size="lg"
                style={{ 
                  color: designColors.amounts.positive,
                  fontWeight: 600
                }}
              >
                {formatCurrency(reportStats.totalTransfers)}
              </Text>
              <Text 
                size="xs"
                ta="center"
                style={{ color: designColors.text.secondary }}
              >
                Переводы
              </Text>
            </Stack>
            
            <Stack gap="xs" align="center" style={{ flex: 1 }}>
              <Text 
                size="lg"
                style={{ 
                  color: designColors.text.primary,
                  fontWeight: 600
                }}
              >
                {reportStats.participantCount}
              </Text>
              <Text 
                size="xs"
                ta="center"
                style={{ color: designColors.text.secondary }}
              >
                Участников
              </Text>
            </Stack>
          </Group>
        </Card>

        {/* Report Configuration */}
        <Stack gap="md">
          <Text 
            size="lg"
            style={{ 
              color: designColors.text.primary,
              fontWeight: 600
            }}
          >
            ⚙️ Настройки отчета
          </Text>
          
          <Group gap="md">
            <Stack gap="xs" style={{ flex: 1 }}>
              <Text 
                size="sm"
                style={{ color: designColors.text.secondary }}
              >
                Период
              </Text>
              <Select
                value={selectedPeriod}
                onChange={(value) => value && setSelectedPeriod(value)}
                data={periodOptions}
                leftSection={<IconCalendar size={16} />}
                styles={{
                  input: {
                    backgroundColor: designColors.text.tertiary,
                    color: designColors.text.primary,
                    border: 'none',
                    borderRadius: '8px'
                  }
                }}
              />
            </Stack>
            
            <Stack gap="xs" style={{ flex: 1 }}>
              <Text 
                size="sm"
                style={{ color: designColors.text.secondary }}
              >
                Тип данных
              </Text>
              <Select
                value={selectedType}
                onChange={(value) => value && setSelectedType(value)}
                data={typeOptions}
                leftSection={<IconUsers size={16} />}
                styles={{
                  input: {
                    backgroundColor: designColors.text.tertiary,
                    color: designColors.text.primary,
                    border: 'none',
                    borderRadius: '8px'
                  }
                }}
              />
            </Stack>
          </Group>
        </Stack>

        {/* Export Options */}
        <Stack gap="md">
          <Text 
            size="lg"
            style={{ 
              color: designColors.text.primary,
              fontWeight: 600
            }}
          >
            📥 Экспорт отчета
          </Text>
          
          {/* Excel Export */}
          <Card
            radius="lg"
            p="md"
            style={{
              backgroundColor: designColors.backgrounds.cards,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer'
            }}
            onClick={() => onGenerateExcel(selectedPeriod, selectedType)}
          >
            <Group gap="md">
              <ActionIcon
                size="lg"
                style={{
                  backgroundColor: designColors.semantic.success,
                  color: designColors.text.primary
                }}
              >
                <IconFileSpreadsheet size={20} />
              </ActionIcon>
              
              <Stack gap={2} style={{ flex: 1 }}>
                <Text 
                  size="md"
                  style={{ 
                    color: designColors.text.primary,
                    fontWeight: 500
                  }}
                >
                  Экспорт в Excel
                </Text>
                <Text 
                  size="sm"
                  style={{ color: designColors.text.secondary }}
                >
                  Детальная таблица со всеми данными
                </Text>
              </Stack>
              
              <Group gap="xs">
                <Badge color="green" size="sm">
                  .xlsx
                </Badge>
                <IconDownload size={20} style={{ color: designColors.text.secondary }} />
              </Group>
            </Group>
          </Card>

          {/* PDF Export */}
          <Card
            radius="lg"
            p="md"
            style={{
              backgroundColor: designColors.backgrounds.cards,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer'
            }}
            onClick={() => onGeneratePdf(selectedPeriod, selectedType)}
          >
            <Group gap="md">
              <ActionIcon
                size="lg"
                style={{
                  backgroundColor: designColors.semantic.error,
                  color: designColors.text.primary
                }}
              >
                <IconFileDescription size={20} />
              </ActionIcon>
              
              <Stack gap={2} style={{ flex: 1 }}>
                <Text 
                  size="md"
                  style={{ 
                    color: designColors.text.primary,
                    fontWeight: 500
                  }}
                >
                  Экспорт в PDF
                </Text>
                <Text 
                  size="sm"
                  style={{ color: designColors.text.secondary }}
                >
                  Красивый отчет для печати
                </Text>
              </Stack>
              
              <Group gap="xs">
                <Badge color="red" size="sm">
                  .pdf
                </Badge>
                <IconDownload size={20} style={{ color: designColors.text.secondary }} />
              </Group>
            </Group>
          </Card>
        </Stack>

        {/* Last Report Info */}
        <Card
          radius="lg"
          p="md"
          style={{
            backgroundColor: designColors.backgrounds.cards,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Text 
                size="sm"
                style={{ 
                  color: designColors.text.primary,
                  fontWeight: 500
                }}
              >
                Последний отчет
              </Text>
              <Text 
                size="xs"
                style={{ color: designColors.text.secondary }}
              >
                Сгенерирован {reportStats.lastReportDate}
              </Text>
            </Stack>
            
            <Badge color="gray" variant="light">
              {reportStats.transactionCount} операций
            </Badge>
          </Group>
        </Card>

        {/* Quick Actions */}
        <Group gap="md">
          <Button 
            variant="outline"
            color="gray"
            leftSection={<IconFileSpreadsheet size={16} />}
            styles={{
              root: {
                flex: 1,
                paddingLeft: '44px' // Увеличиваем левый отступ для иконки
              }
            }}
            onClick={() => onGenerateExcel('month', 'summary')}
          >
            Быстрый Excel
          </Button>
          
          <Button 
            variant="outline"
            color="gray"
            leftSection={<IconFileDescription size={16} />}
            styles={{
              root: {
                flex: 1,
                paddingLeft: '44px' // Увеличиваем левый отступ для иконки
              }
            }}
            onClick={() => onGeneratePdf('month', 'summary')}
          >
            Быстрый PDF
          </Button>
        </Group>
      </Stack>
    </Box>
  );
} 