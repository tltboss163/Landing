'use client';

import { AppContainer } from '@/components/AppContainer'
import { TelegramProvider } from '@/components/providers/TelegramProvider'
import { MantineProvider } from '@mantine/core'
import { useEffect, useState } from 'react'

export default function AppPage() {
  const [startParam, setStartParam] = useState<string | undefined>();
  const [initialGroupId, setInitialGroupId] = useState<number | undefined>();
  const [initialUserId, setInitialUserId] = useState<number | undefined>();

  useEffect(() => {
    // Получаем параметры из URL или Telegram WebApp
    const urlParams = new URLSearchParams(window.location.search);
    const urlStartParam = urlParams.get('startapp') || urlParams.get('start_param');
    
    console.log('=== URL Parameter Extraction ===');
    console.log('- window.location.search:', window.location.search);
    console.log('- urlParams entries:', Array.from(urlParams.entries()));
    console.log('- urlStartParam:', urlStartParam);

    // Также проверяем Telegram WebApp параметры
    let telegramStartParam: string | undefined;
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.start_param) {
      telegramStartParam = window.Telegram.WebApp.initDataUnsafe.start_param;
    }

    console.log('- telegramStartParam:', telegramStartParam);
    console.log('- window.Telegram?.WebApp?.initDataUnsafe:', window.Telegram?.WebApp?.initDataUnsafe);

    const finalStartParam = urlStartParam || telegramStartParam;
    console.log('- finalStartParam:', finalStartParam);
    setStartParam(finalStartParam || undefined);

    // Извлекаем group_id и user_id из параметров
    if (finalStartParam) {
      const groupMatch = finalStartParam.match(/group_(\d+)/);
      const userMatch = finalStartParam.match(/user_(\d+)/);
      
      console.log('Parameter matching:');
      console.log('- finalStartParam:', finalStartParam);
      console.log('- groupMatch:', groupMatch);
      console.log('- userMatch:', userMatch);

      if (groupMatch) {
        const groupId = parseInt(groupMatch[1]);
        console.log('- Extracted groupId:', groupId);
        console.log('- Setting initialGroupId:', groupId);
        setInitialGroupId(groupId);
      } else {
        console.log('- No group pattern found in startParam');
        // For testing purposes, let's try to extract any number that might be a group ID
        const numberMatch = finalStartParam.match(/(\d+)/);
        if (numberMatch) {
          const possibleGroupId = parseInt(numberMatch[1]);
          console.log('- Found number in startParam:', possibleGroupId);
          console.log('- Assuming it is groupId for testing');
          setInitialGroupId(possibleGroupId);
        }
      }
      
      if (userMatch) {
        const userId = parseInt(userMatch[1]);
        console.log('- Extracted userId:', userId);
        console.log('- Setting initialUserId:', userId);
        setInitialUserId(userId);
      }
    } else {
      console.log('- No startParam found, not setting any default group_id');
    }

    // Уведомляем Telegram WebApp о готовности
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();

      // Разворачиваем приложение на весь экран
      if (window.Telegram.WebApp.expand) {
        window.Telegram.WebApp.expand();
      }
    }
  }, []);

  console.log('=== Rendering App component ===');
  console.log('- initialGroupId:', initialGroupId, '(type:', typeof initialGroupId, ')');
  console.log('- initialUserId:', initialUserId, '(type:', typeof initialUserId, ')');
  console.log('- startParam:', startParam, '(type:', typeof startParam, ')');


  return (
    <TelegramProvider>
      <MantineProvider
        theme={{
          colors: {
            dark: [
              '#C1C2C5',
              '#A6A7AB',
              '#909296',
              '#5c5f66',
              '#373A40',
              '#2C2E33',
              '#25262B',
              '#1A1B1E',
              '#141518',
              '#101113',
            ],
            light: [
              '#f8f9fa',
              '#e9ecef',
              '#dee2e6',
              '#ced4da',
              '#adb5bd',
              '#6c757d',
              '#495057',
              '#343a40',
              '#212529',
              '#000000',
            ],
          },
          primaryColor: 'blue',
        }}
      >
        <div style={{
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>

          <AppContainer
            initialGroupId={initialGroupId}
            initialUserId={initialUserId}
            startParam={startParam}
          />
        </div>
      </MantineProvider>
    </TelegramProvider>
  );
}
