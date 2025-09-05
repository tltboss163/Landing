import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { mantineHtmlProps } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import reactPlugin from '@stagewise-plugins/react'
import { StagewiseToolbar } from '@stagewise/toolbar-next'
import { TelegramProvider } from '../components/providers/TelegramProvider'
import { ThemeProvider } from '../components/providers/ThemeProvider'

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="ru" {...mantineHtmlProps}>
      <head>
        <meta name="telegram-app" content="true" />
      </head>
      <body className={inter.className}>
        <TelegramProvider>
          <ThemeProvider>
            <Notifications position="top-center" zIndex={1000} />
            {children}
            <StagewiseToolbar 
              config={{
                plugins: [reactPlugin]
              }}
            />
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