'use client';

import { MantineProvider } from '@mantine/core';
import { useTelegram } from './TelegramProvider';
import { getMantineTheme } from '@/lib/material-theme';
import { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { colorScheme } = useTelegram();
  const theme = getMantineTheme(colorScheme);

  return (
    <MantineProvider theme={theme} forceColorScheme={colorScheme}>
      {children}
    </MantineProvider>
  );
};
