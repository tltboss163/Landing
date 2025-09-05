import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import type { Metadata } from 'next';

import { ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { TelegramProvider } from '../../components/providers/TelegramProvider';
import { ThemeProvider } from '../../components/providers/ThemeProvider';
import { GlobalStyles } from '../../styles/global.styles';
import './globals.css';

export const metadata: Metadata = {
  title: 'Budget Mini Bot',
  description: 'Telegram Mini App для управления групповыми расходами',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <ColorSchemeScript />
        <meta name="telegram-app" content="true" />
      </head>
      <body>
        <TelegramProvider>
          <ThemeProvider>
            <GlobalStyles />
            <Notifications position="top-center" zIndex={1000} />
            {children}
          </ThemeProvider>
        </TelegramProvider>
        <script
          async
          src="https://telegram.org/js/telegram-web-app.js"
        />
      </body>
    </html>
  );
}
