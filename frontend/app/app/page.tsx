'use client';

import { AppContainer } from '@/components/AppContainer';
import { useEffect, useState } from 'react';

export default function AppPage() {
  const [startParam, setStartParam] = useState<string | undefined>();
  const [initialGroupId, setInitialGroupId] = useState<number | undefined>();
  const [initialUserId, setInitialUserId] = useState<number | undefined>();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlStartParam = urlParams.get('startapp') || urlParams.get('start_param');
    
    let telegramStartParam: string | undefined;
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.start_param) {
      telegramStartParam = window.Telegram.WebApp.initDataUnsafe.start_param;
    }

    const finalStartParam = urlStartParam || telegramStartParam;
    setStartParam(finalStartParam || undefined);

    if (finalStartParam) {
      const groupMatch = finalStartParam.match(/group_(\d+)/);
      const userMatch = finalStartParam.match(/user_(\d+)/);
      
      if (groupMatch) {
        setInitialGroupId(parseInt(groupMatch[1]));
      } else {
        const numberMatch = finalStartParam.match(/(\d+)/);
        if (numberMatch) {
          setInitialGroupId(parseInt(numberMatch[1]));
        }
      }
      
      if (userMatch) {
        setInitialUserId(parseInt(userMatch[1]));
      }
    }

    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      if (window.Telegram.WebApp.expand) {
        window.Telegram.WebApp.expand();
      }
    }
  }, []);

  return (
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
  );
}
