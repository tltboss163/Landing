'use client';

import { useTelegram } from '@/components/providers/TelegramProvider'
import { useMutation } from '@/hooks/useApi'
import { api } from '@/lib/api'
import { designColors } from '@/lib/design-system'
import { Alert, Box, Button, Card, Checkbox, Stack, Text, TextInput } from '@mantine/core'
import { IconAlertCircle, IconCheck, IconPhone, IconUser } from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface RegistrationScreenProps {
  groupRules?: string;
  groupId?: number;
  rulesOnly?: boolean; // Только для принятия правил, без регистрации
  onComplete: (userData: {
    firstName: string;
    lastName: string;
    phone?: string;
    rulesAccepted: boolean;
  }) => void;
}

export function RegistrationScreen({ groupRules, groupId, rulesOnly = false, onComplete }: RegistrationScreenProps) {
  const telegram = useTelegram();
  const [step, setStep] = useState<'rules' | 'profile'>('rules');
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [groupRulesFromApi, setGroupRulesFromApi] = useState<string | null>(null);
  const [loadingRules, setLoadingRules] = useState(true);

  // Загрузка правил группы
  useEffect(() => {
    const loadGroupRules = async () => {
      if (groupId) {
        try {
          console.log('🔍 Loading rules for group:', groupId);
          const rulesResponse = await api.group.getRules(groupId);
          
          if (rulesResponse.success && rulesResponse.data) {
            console.log('✅ Group rules loaded:', rulesResponse.data);
            setGroupRulesFromApi(rulesResponse.data.rules);
            
            // Если правил нет - сразу переходим к профилю
            if (!rulesResponse.data.has_rules) {
              console.log('⏭️ No group rules, skipping to profile step');
              setStep('profile');
            }
          } else {
            console.log('❌ Failed to load group rules, skipping to profile');
            setStep('profile');
          }
        } catch (error) {
          console.error('❌ Error loading group rules:', error);
          setStep('profile');
        }
      } else {
        console.log('⏭️ No groupId provided, skipping to profile step');
        setStep('profile');
      }
      setLoadingRules(false);
    };

    loadGroupRules();
  }, [groupId]);

  // Инициализация данных из Telegram
  useEffect(() => {
    if (telegram.isInitialized) {
      console.log('🖼️ RegistrationScreen: telegram.photoUrl =', telegram.photoUrl);
      console.log('🖼️ RegistrationScreen: telegram data =', {
        userId: telegram.userId,
        firstName: telegram.firstName,
        lastName: telegram.lastName,
        photoUrl: telegram.photoUrl
      });
      
      setFirstName(telegram.firstName || '');
      setLastName(telegram.lastName || '');
      
      // Получаем фотографию пользователя из Telegram
      if (telegram.photoUrl) {
        console.log('✅ Setting userPhotoUrl to:', telegram.photoUrl);
        setUserPhotoUrl(telegram.photoUrl);
      } else {
        console.log('❌ No telegram.photoUrl available');
        
        // Fallback: попробуем получить напрямую из window
        if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url) {
          const directPhotoUrl = window.Telegram.WebApp.initDataUnsafe.user.photo_url;
          console.log('🔄 Fallback: found photo_url directly =', directPhotoUrl);
          
          // Декодируем URL на случай если он закодирован
          const decodedPhotoUrl = decodeURIComponent(directPhotoUrl);
          console.log('🔄 Fallback: decoded photo_url =', decodedPhotoUrl);
          
          setUserPhotoUrl(decodedPhotoUrl);
        }
      }
    }
  }, [telegram.isInitialized, telegram.firstName, telegram.lastName, telegram.photoUrl]);

  // Получаем telegram_id из Telegram Web App
  const getTelegramId = () => {
    // Сначала пытаемся получить из telegram provider
    if (telegram.userId) {
      return telegram.userId;
    }
    
    // Если не получилось, пытаемся напрямую из window.Telegram
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      return window.Telegram.WebApp.initDataUnsafe.user.id;
    }
    
    console.error('❌ Cannot get telegram_id from Telegram Web App');
    return null;
  };

  // Получаем userId из /api/v1/users/me если он не доступен через telegram.userId
  const [userIdFromApi, setUserIdFromApi] = useState<number | null>(null);
  const isUserIdLoading = useRef(false);
  const userIdFetched = useRef(false);
  
  // Use useCallback to prevent recreation of this function on every render
  const fetchUserIdFromApi = useCallback(async () => {
    // Получаем userId из API только для отладки, но не используем в регистрации
    if (!telegram.userId && telegram.isInitialized && !userIdFetched.current && !isUserIdLoading.current) {
      console.log('🔍 Fetching user ID from /api/v1/users/me API for debugging...');
      isUserIdLoading.current = true;
      
      try {
        const response = await api.user.getProfile();
        if (response.success && response.data) {
          console.log('✅ Got user ID from API for debugging:', response.data.id);
          setUserIdFromApi(response.data.id);
        } else {
          console.log('❌ Failed to get user ID from API:', response.message);
        }
      } catch (error) {
        console.error('❌ Error fetching user ID from API:', error);
      } finally {
        isUserIdLoading.current = false;
        userIdFetched.current = true;
      }
    }
  }, [telegram.userId, telegram.isInitialized]);
  
  // Call the fetch function once when component mounts or telegram state changes
  useEffect(() => {
    fetchUserIdFromApi();
  }, [fetchUserIdFromApi]);

  // Мутация для регистрации пользователя
  const registerMutation = useMutation(
    async (userData: any) => {
      console.log('=== API call started ===');
      console.log('Calling api.auth.register with:', {
        telegram_id: userData.telegram_id,
        first_name: userData.firstName,
        last_name: userData.lastName,
        username: telegram.username || undefined,
        phone_number: userData.phone?.replace(/\D/g, '') || undefined,
        // group_id: groupId, // REMOVED: Registration is now global
        language_code: 'ru'
      });
      
      try {
        const response = await api.auth.register({
          telegram_id: userData.telegram_id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          profile_first_name: userData.firstName,
          profile_last_name: userData.lastName,
          username: telegram.username || undefined,
          phone_number: userData.phone?.replace(/\D/g, '') || undefined,
          // group_id: groupId, // REMOVED: Registration is now global
          language_code: 'ru'
        });
        
        console.log('API response:', response);
        return response;
      } catch (error) {
        console.error('API call error:', error);
        throw error;
      }
    },
    {
      onSuccess: (result) => {
        console.log('=== Registration success ===');
        console.log('Success result:', result);
        onComplete({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.replace(/\D/g, '').length >= 10 ? phone : undefined,
          rulesAccepted: step === 'rules' ? false : true // Правила принимаются отдельно если есть экран правил
        });
      },
      onError: (error) => {
        console.log('=== Registration error ===');
        console.error('Error result:', error);
        // Errors handled silently
      }
    }
  );

  // Mock правила группы
  // Удалено - теперь правила загружаются из API

  // Использовать правила из API или fallback
  const displayRules = groupRulesFromApi || groupRules || `📋 Правила группы

1. 💰 Все расходы учитываются честно и прозрачно
2. 📱 Добавляйте расходы сразу после покупки
3. 🤝 Переводы выполняются в течение 24 часов
4. 📝 Указывайте детальное описание расходов

Пожалуйста, соблюдайте эти правила для комфортной работы группы.`;

  const formatPhoneNumber = (value: string) => {
    // Удаляем все символы кроме цифр
    const digits = value.replace(/\D/g, '');
    
    // Начинаем с +7 для российских номеров
    if (digits.length === 0) return '';
    
    let formatted = '+7';
    
    // Если первая цифра 7, пропускаем её
    const digitsToFormat = digits.startsWith('7') ? digits.slice(1) : digits;
    
    // Форматируем по маске +7 (999) 999-99-99
    if (digitsToFormat.length > 0) {
      formatted += ' (';
      formatted += digitsToFormat.slice(0, 3);
      if (digitsToFormat.length > 3) {
        formatted += ') ';
        formatted += digitsToFormat.slice(3, 6);
        if (digitsToFormat.length > 6) {
          formatted += '-';
          formatted += digitsToFormat.slice(6, 8);
          if (digitsToFormat.length > 8) {
            formatted += '-';
            formatted += digitsToFormat.slice(8, 10);
          }
        }
      }
    }
    
    return formatted;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhone(formatted);
  };

  const handleRulesNext = async () => {
    if (rulesAccepted && groupId) {
      try {
        console.log('🔄 Accepting group rules for group:', groupId);
        const result = await api.group.acceptRules(groupId);
        if (result.success) {
          console.log('✅ Rules accepted successfully:', result.data);
          
          // Если это только для принятия правил - завершаем процесс
          if (rulesOnly) {
            console.log('📝 Rules only mode - completing process');
            onComplete({
              firstName: '', // Не нужно для зарегистрированных пользователей
              lastName: '',
              rulesAccepted: true
            });
            return;
          }
          
          setStep('profile');
        } else {
          console.error('❌ Failed to accept rules:', result.message);
          // Переходим к профилю даже если правила не удалось принять
          // (может быть у группы нет правил)
          if (rulesOnly) {
            onComplete({
              firstName: '',
              lastName: '',
              rulesAccepted: false
            });
            return;
          }
          setStep('profile');
        }
      } catch (error) {
        console.error('❌ Error accepting rules:', error);
        // Переходим к профилю даже при ошибке
        if (rulesOnly) {
          onComplete({
            firstName: '',
            lastName: '',
            rulesAccepted: false
          });
          return;
        }
        setStep('profile');
      }
    } else if (rulesAccepted) {
      // Если нет groupId (регистрация без группы), просто переходим к профилю
      if (rulesOnly) {
        onComplete({
          firstName: '',
          lastName: '',
          rulesAccepted: rulesAccepted
        });
        return;
      }
      setStep('profile');
    }
  };

  const handleComplete = async () => {
    console.log('=== Registration handleComplete started ===');
    console.log('firstName:', firstName.trim());
    console.log('lastName:', lastName.trim());
    console.log('telegram.userId:', telegram.userId);
    console.log('userIdFromApi (for debugging only):', userIdFromApi);
    console.log('telegram.username:', telegram.username);
    console.log('phone:', phone);
    
    // Используем настоящий telegram_id из Telegram Web App
    const telegramId = getTelegramId();
    
    console.log('Real telegram_id from getTelegramId():', telegramId);
    
    if (firstName.trim() && lastName.trim() && telegramId) {
      console.log('All validation passed, calling registerMutation.mutate...');
      
      const userData = {
        first_name: telegram.firstName || '',
        last_name: telegram.lastName || '',
        profile_first_name: firstName.trim(),
        profile_last_name: lastName.trim(),
        phone: phone.replace(/\D/g, '').length >= 10 ? phone : undefined,
        telegram_id: telegramId  // Используем настоящий telegram_id
      };
      
      console.log('userData to register:', userData);
      
      try {
        await registerMutation.mutate(userData);
      } catch (error) {
        console.error('Error in registerMutation.mutate:', error);
      }
    } else {
      console.log('Validation failed:');
      console.log('- firstName valid:', !!firstName.trim());
      console.log('- lastName valid:', !!lastName.trim());
      console.log('- telegramId valid:', !!telegramId);
      console.log('- telegram.userId (for reference):', telegram.userId);
      console.log('- userIdFromApi (for debugging):', userIdFromApi);
      // Validation errors handled silently
    }
  };

  const handleRequestContact = () => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Проверяем поддержку метода requestContact
      if ((tg as any).requestContact) {
        (tg as any).requestContact((result: any) => {
          console.log('Contact result:', result);
          if (result && result.contact && result.contact.phone_number) {
            // Форматируем номер в нужный формат
            let phoneNumber = result.contact.phone_number;
            if (phoneNumber.startsWith('+')) {
              phoneNumber = phoneNumber.substring(1);
            }
            
            // Форматируем для российского номера
            if (phoneNumber.startsWith('7') && phoneNumber.length === 11) {
              setPhone(`+7 (${phoneNumber.substring(1, 4)}) ${phoneNumber.substring(4, 7)}-${phoneNumber.substring(7, 9)}-${phoneNumber.substring(9, 11)}`);
            } else {
              // Для других номеров просто добавляем +
              setPhone(phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`);
            }
          }
        });
      } else {
        // Метод не поддерживается
        // Errors handled silently
      }
    } else {
      // Errors handled silently
    }
  };

  const isPhoneValid = () => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10; // Минимум 10 цифр для валидного номера
  };

  // Показываем загрузку пока правила загружаются
  if (loadingRules) {
    return (
      <Box
        style={{
          backgroundColor: designColors.backgrounds.primary,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Text style={{ color: designColors.text.primary }}>
          Загрузка правил группы...
        </Text>
      </Box>
    );
  }

  if (step === 'rules') {
    return (
      <Box
        style={{
          backgroundColor: designColors.backgrounds.primary,
          minHeight: '100vh',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Stack gap="xl" style={{ height: '100%' }}>
          {/* Header */}
          <Stack gap="md" align="center" pt="xl">
            <Text 
              size="xl"
              ta="center"
              style={{ 
                color: designColors.text.primary,
                fontSize: '28px',
                fontWeight: 600
              }}
            >
              👋 Добро пожаловать!
            </Text>
            
            <Text 
              ta="center"
              style={{ 
                color: designColors.text.secondary,
                fontSize: '16px'
              }}
            >
              Ознакомьтесь с правилами группы{'\n'}перед началом участия
            </Text>
          </Stack>

          {/* Rules Card */}
          <Card
            radius="lg"
            p="lg"
            style={{
              backgroundColor: designColors.backgrounds.cards,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              flex: 1,
              overflow: 'hidden'
            }}
          >
            <Box
              style={{
                height: '100%',
                overflowY: 'auto',
                paddingRight: '8px'
              }}
            >
              <Text 
                style={{ 
                  color: designColors.text.primary,
                  fontSize: '14px',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line'
                }}
              >
                {displayRules}
              </Text>
            </Box>
          </Card>

          {/* Agreement Checkbox */}
          <Box>
            <Checkbox
              checked={rulesAccepted}
              onChange={(event) => setRulesAccepted(event.currentTarget.checked)}
              label={
                <Text style={{ color: designColors.text.primary }}>
                  Я ознакомился и согласен с правилами группы
                </Text>
              }
              styles={{
                input: {
                  backgroundColor: rulesAccepted ? designColors.accents.fabButton : 'transparent',
                  borderColor: designColors.text.tertiary
                },
                label: {
                  color: designColors.text.primary
                }
              }}
            />
          </Box>

          {/* Continue Button */}
          <Button 
            size="lg"
            radius="md"
            style={{
              backgroundColor: rulesAccepted ? designColors.accents.fabButton : designColors.text.tertiary,
              color: designColors.text.primary,
              height: '50px'
            }}
            onClick={handleRulesNext}
            disabled={!rulesAccepted}
            rightSection={<span>▶</span>}
          >
            Продолжить
          </Button>
        </Stack>
      </Box>
    );
  }

  // Profile Setup Step
  console.log('🎨 RegistrationScreen render: userPhotoUrl =', userPhotoUrl);
  
  return (
    <Box
      style={{
        backgroundColor: designColors.backgrounds.primary,
        minHeight: '100vh',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <Stack gap="xl" align="center" style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
        {/* Header */}
        <Stack gap="md" align="center">
          {/* User Avatar */}
          {userPhotoUrl ? (
            <Box
              style={{
                width: '64px',
                height: '64px',
                backgroundImage: `url(${userPhotoUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '50%',
                border: `2px solid ${designColors.accents.fabButton}`
              }}
            />
          ) : (
            <Box
              style={{
                backgroundColor: designColors.accents.fabButton,
                borderRadius: '50%',
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <IconUser size={28} style={{ color: designColors.text.primary }} />
            </Box>
          )}

          <Text 
            size="xl"
            ta="center"
            style={{ 
              color: designColors.text.primary,
              fontSize: '24px',
              fontWeight: 600
            }}
          >
            Настройка профиля
          </Text>
          
          <Text 
            ta="center"
            style={{ 
              color: designColors.text.secondary,
              fontSize: '16px'
            }}
          >
            Укажите ваши данные{'\n'}для участия в группе
          </Text>
        </Stack>

        {/* Error Alert */}
        {registerMutation.error && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            color="red" 
            style={{ width: '100%' }}
          >
            {registerMutation.error}
          </Alert>
        )}

        {/* Form */}
        <Stack gap="lg" style={{ width: '100%' }}>
          {/* First Name Input */}
          <Box>
            <Text 
              size="sm"
              mb="xs"
              style={{ color: designColors.text.secondary }}
            >
              Имя *
            </Text>
            <TextInput
              value={firstName}
              onChange={(e) => setFirstName(e.currentTarget.value)}
              placeholder="Иван"
              leftSection={<IconUser size={18} style={{ color: designColors.text.secondary }} />}
              styles={{
                input: {
                  backgroundColor: designColors.text.tertiary,
                  color: designColors.text.primary,
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 16px 12px 44px',
                  fontSize: '16px',
                  height: '50px'
                }
              }}
            />
          </Box>

          {/* Last Name Input */}
          <Box>
            <Text 
              size="sm"
              mb="xs"
              style={{ color: designColors.text.secondary }}
            >
              Фамилия *
            </Text>
            <TextInput
              value={lastName}
              onChange={(e) => setLastName(e.currentTarget.value)}
              placeholder="Петров"
              leftSection={<IconUser size={18} style={{ color: designColors.text.secondary }} />}
              styles={{
                input: {
                  backgroundColor: designColors.text.tertiary,
                  color: designColors.text.primary,
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 16px 12px 44px',
                  fontSize: '16px',
                  height: '50px'
                }
              }}
            />
          </Box>

          {/* Phone Input */}
          <Box>
            <Text 
              size="sm"
              mb="xs"
              style={{ color: designColors.text.secondary }}
            >
              Номер телефона (необязательно)
            </Text>
            
            <TextInput
              value={phone}
              onChange={(e) => handlePhoneChange(e.currentTarget.value)}
              placeholder="+7 (999) 123-45-67"
              leftSection={<IconPhone size={18} style={{ color: designColors.text.secondary }} />}
              styles={{
                input: {
                  backgroundColor: designColors.text.tertiary,
                  color: designColors.text.primary,
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 16px 12px 44px',
                  fontSize: '16px',
                  height: '50px'
                }
              }}
            />

            <Text 
              size="xs"
              mt="xs"
              style={{ color: designColors.text.secondary }}
            >
              Телефон поможет другим участникам связаться с вами
            </Text>
          </Box>

          {/* Complete Button */}
          <Button 
            size="lg"
            radius="md"
            loading={registerMutation.loading}
            style={{
              backgroundColor: (firstName.trim() && lastName.trim()) ? 
                designColors.accents.fabButton : designColors.text.tertiary,
              color: designColors.text.primary,
              marginTop: '16px',
              height: '50px'
            }}
            onClick={handleComplete}
            disabled={!firstName.trim() || !lastName.trim() || registerMutation.loading}
            leftSection={<IconCheck size={20} />}
          >
            {registerMutation.loading ? 'Регистрация...' : 'Завершить регистрацию'}
          </Button>
        </Stack>

        {/* Back Link */}
        <Button 
          variant="subtle"
          color="gray"
          onClick={() => setStep('rules')}
          disabled={registerMutation.loading}
          style={{
            color: designColors.text.secondary
          }}
        >
          ← Вернуться к правилам
        </Button>
      </Stack>
    </Box>
  );
} 