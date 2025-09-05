'use client';

import { init, initData, miniApp, themeParams, viewport } from '@telegram-apps/sdk-react'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface TelegramContextType {
  isInitialized: boolean;
  userId: number | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  colorScheme: 'light' | 'dark';
  themeParams: unknown;
  showAlert: (message: string) => void;
  showConfirm: (message: string) => Promise<boolean>;
  close: () => void;
  sendData: (data: unknown) => void;
  isExpanded: boolean;
  expand: () => void;
  downloadFile: (url: string, filename: string) => void;
}

const TelegramContext = createContext<TelegramContextType | null>(null);

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }
  return context;
};

interface TelegramProviderProps {
  children: ReactNode;
}

export const TelegramProvider = ({ children }: TelegramProviderProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const initializeTelegramApp = async () => {
      try {
        // Инициализируем Telegram SDK только если доступен
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          try {
            init();
          } catch (initError) {
            console.warn('Telegram SDK init failed, using fallback:', initError);
            // Продолжаем без инициализации SDK
          }
        } else {
          console.warn('Telegram WebApp not available, running in development mode');
        }
        
        // Настраиваем тему и цветовую схему
        try {
          const currentTheme = null; // Отключено для стабильности
          if (currentTheme && currentTheme.bg_color) {
            // Определяем темную тему по цвету фона
            const isDark = currentTheme.bg_color === '#17212b' || currentTheme.bg_color === '#0f0f0f';
            setColorScheme(isDark ? 'dark' : 'light');
          }
        } catch (themeError) {
          console.warn('Failed to get theme params:', themeError);
          setColorScheme('light'); // fallback
        }

        // Уведомляем Telegram, что приложение готово
        try {
          if (miniApp && miniApp.ready && miniApp.ready.isAvailable()) {
            miniApp.ready();
          }
        } catch (readyError) {
          console.warn('Failed to call miniApp.ready():', readyError);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Telegram WebApp:', error);
        // В режиме разработки инициализируем без Telegram API
        if (process.env.NODE_ENV === 'development') {
          setIsInitialized(true);
        }
      }
    };

    initializeTelegramApp();
  }, []);

  // Получаем данные безопасно через state()
  const initDataState = initData && initData.state ? initData.state() : null;
  const user = initDataState?.user;
  const viewportState = viewport && viewport.isExpanded ? viewport.isExpanded() : false;

  // Debug logging for photo_url - безусловное логирование
  useEffect(() => {
    console.log('🔍 TelegramProvider: isInitialized =', isInitialized);
    console.log('🔍 TelegramProvider: initData exists =', !!initData);
    console.log('🔍 TelegramProvider: initDataState =', initDataState);
    console.log('🔍 TelegramProvider: user =', user);
    
    if (user) {
      console.log('🔍 TelegramProvider: user.photo_url =', user.photo_url);
      console.log('🔍 TelegramProvider: raw initData =', initData?.raw);
    }
    
    // Also check window.Telegram for comparison
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe) {
      console.log('🔍 TelegramProvider: window.Telegram.WebApp.initDataUnsafe =', window.Telegram.WebApp.initDataUnsafe);
      console.log('🔍 TelegramProvider: window.Telegram.WebApp.initDataUnsafe.user =', window.Telegram.WebApp.initDataUnsafe.user);
      console.log('🔍 TelegramProvider: window.Telegram.WebApp.initDataUnsafe.user?.photo_url =', window.Telegram.WebApp.initDataUnsafe.user?.photo_url);
    }
  }, [isInitialized, initDataState, user]);

  const contextValue: TelegramContextType = {
    isInitialized,
    userId: user?.id || null,
    username: user?.username || null,
    firstName: user?.first_name || null,
    lastName: user?.last_name || null,
    photoUrl: user?.photo_url || null,
    colorScheme,
    themeParams: themeParams && themeParams.state ? themeParams.state() : {},
    
    showAlert: (message: string) => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert(message);
      } else {
        alert(message);
      }
    },

    showConfirm: (message: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          window.Telegram.WebApp.showConfirm(message, resolve);
        } else {
          resolve(confirm(message));
        }
      });
    },

    close: () => {
      try {
        if (miniApp && miniApp.close && miniApp.close.isAvailable()) {
          miniApp.close();
        } else if (typeof window !== 'undefined') {
          window.close();
        }
      } catch (closeError) {
        console.warn('Failed to close app:', closeError);
      }
    },

    sendData: (data: unknown) => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify(data));
      } else {
        console.log('Data to send:', data);
      }
    },

    isExpanded: viewportState,
    
    expand: () => {
      try {
        if (viewport && viewport.expand && viewport.expand.isAvailable()) {
          viewport.expand();
        }
      } catch (expandError) {
        console.warn('Failed to expand viewport:', expandError);
      }
    },

    downloadFile: (url: string, filename: string) => {
      console.log('🔽 downloadFile called:');
      console.log('  - url:', url);
      console.log('  - filename:', filename);
      console.log('  - Telegram WebApp available:', !!window.Telegram?.WebApp);
      console.log('  - downloadFile method available:', !!window.Telegram?.WebApp?.downloadFile);
      
      try {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp?.downloadFile) {
          console.log('✅ Using Telegram downloadFile');
          // Telegram downloadFile принимает объект, а не отдельные параметры
          window.Telegram.WebApp.downloadFile({
            url: url,
            file_name: filename
          });
        } else {
          console.log('⚠️ Falling back to browser download');
          // Fallback для браузера
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (downloadError) {
        console.warn('❌ Failed to download file:', downloadError);
        console.log('  - Error details:', downloadError);
        // Fallback на стандартное скачивание
        window.open(url, '_blank');
      }
    },
  };

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
};

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  initData: string;
  initDataUnsafe: Record<string, unknown>; // заменяю any
  version: string;
  platform: string;
  colorScheme: string;
  themeParams: Record<string, unknown>; // заменяю any
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  sendData: (data: string) => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
  downloadFile: (data: {
    url: string;
    file_name: string;
  }, callback?: () => void) => void;
}

// TypeScript декларации для Telegram WebApp API
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
} 