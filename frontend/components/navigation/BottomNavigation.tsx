'use client';

import { designColors } from '@/lib/design-system';
import { ActionIcon, Box, Group, Text } from '@mantine/core';
import {
    IconArrowsExchange,
    IconCrown,
    IconHome,
    IconReceipt,
    IconUsers
} from '@tabler/icons-react';

interface BottomNavigationProps {
  activeTab: 'dashboard' | 'expenses' | 'debts' | 'participants' | 'admin';
  onTabChange: (tab: 'dashboard' | 'expenses' | 'debts' | 'participants' | 'admin') => void;
  userRole?: 'admin' | 'participant';
}

export function BottomNavigation({ activeTab, onTabChange, userRole = 'participant' }: BottomNavigationProps) {
  const tabs = [
    {
      key: 'dashboard' as const,
      icon: IconHome,
      label: 'Главная',
      color: designColors.accents.fabButton
    },
    {
      key: 'expenses' as const,
      icon: IconReceipt,
      label: 'Расходы',
      color: designColors.amounts.positive
    },
    {
      key: 'debts' as const,
      icon: IconArrowsExchange,
      label: 'Долги',
      color: designColors.semantic.error
    },
    {
      key: 'participants' as const,
      icon: IconUsers,
      label: 'Участники',
      color: designColors.semantic.transfer
    }
  ];

  // Add admin tab only for admins
  const adminTab = {
    key: 'admin' as const,
    icon: IconCrown,
    label: 'Админ',
    color: designColors.semantic.warning
  };

  const allTabs = userRole === 'admin' ? [...tabs, adminTab] : tabs;

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: designColors.backgrounds.cards,
        borderTop: `1px solid ${designColors.text.tertiary}`,
        zIndex: 100,
        height: '80px',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Group 
        justify="space-around" 
        style={{ 
          width: '100%',
          padding: '0 8px',
          gap: '2px'
        }}
      >
        {allTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          
          return (
            <Box
              key={tab.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '6px 4px',
                borderRadius: '12px',
                backgroundColor: isActive ? tab.color + '20' : 'transparent',
                transition: 'all 150ms ease',
                flex: 1,
                maxWidth: '80px',
                minWidth: '0'
              }}
              onClick={() => onTabChange(tab.key)}
            >
              <ActionIcon
                variant="subtle"
                size="md"
                style={{
                  backgroundColor: 'transparent',
                  color: isActive ? tab.color : designColors.text.secondary
                }}
              >
                <Icon size={18} />
              </ActionIcon>
              
              <Text
                size="10px"
                style={{
                  color: isActive ? tab.color : designColors.text.secondary,
                  fontWeight: isActive ? 600 : 400,
                  marginTop: '2px',
                  textAlign: 'center',
                  lineHeight: '1.2',
                  fontSize: allTabs.length > 4 ? '9px' : '10px'
                }}
              >
                {tab.label}
              </Text>
            </Box>
          );
        })}
      </Group>
    </Box>
  );
} 