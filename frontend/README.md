# Budget Mini Bot - Frontend

Telegram Mini App для управления групповыми расходами, построенный на Next.js 15.

## 🚀 Quick Start

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Запуск продакшен сборки
npm start
```

## 🛠 Tech Stack

- **Next.js 15** - React фреймворк с App Router
- **TypeScript** - Статическая типизация
- **Mantine 7** - UI компоненты и система дизайна
- **Zustand** - Управление состоянием
- **@telegram-apps/sdk-react** - Интеграция с Telegram WebApp
- **PostCSS** - Обработка стилей

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Корневой layout с провайдерами
│   └── page.tsx           # Главная страница с роутингом
├── components/
│   └── providers/         # React контекст провайдеры
│       └── TelegramProvider.tsx
├── lib/
│   └── api.ts            # API клиент для бэкенда
├── stores/
│   └── useAppStore.ts    # Zustand store
├── types/
│   └── index.ts          # TypeScript типы
├── theme.ts              # Mantine тема
└── public/
    └── manifest.json     # PWA манифест
```

## 🎨 UI Components

### Theme System
- Telegram-inspired цветовая палитра
- Поддержка светлой/темной темы
- Responsive дизайн для мобильных устройств

### Component Library
- **Mantine UI** - Полнофункциональная библиотека компонентов
- **Notifications** - Система уведомлений
- **Forms** - Формы с валидацией
- **Date Picker** - Работа с датами

## 📱 Telegram Integration

### WebApp SDK
```typescript
// Доступ к Telegram WebApp API
const { userId, username, showAlert, sendData } = useTelegram();
```

### Features
- Автоматическая инициализация WebApp
- Поддержка Telegram тем
- Валидация initData
- Fallback для режима разработки

## 🔧 State Management

### Zustand Store
```typescript
// Использование store
const { user, setUser, currentGroup } = useAppStore();

// Или селекторы
const user = useUser();
const isLoading = useIsLoading();
```

### Persistent State
- Автоматическое сохранение в localStorage
- Восстановление состояния при перезагрузке

## 🌐 API Integration

### Type-safe API Client
```typescript
// Работа с API
const response = await userApi.get(telegramId);
const expense = await expenseApi.create(expenseData);
```

### Features
- Полная типизация запросов/ответов
- Обработка ошибок
- Автоматическая сериализация

## 🏗 Development

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NODE_ENV=development
```

### Build Configuration
- Tree shaking для Mantine компонентов
- Оптимизация bundle size
- PWA support

## 📋 Features Status

### ✅ Completed
- [x] Next.js 15 + TypeScript setup
- [x] Telegram WebApp integration
- [x] Mantine UI system
- [x] Zustand state management
- [x] API client architecture
- [x] PWA configuration
- [x] Theme system
- [x] Build process

### 🚧 In Progress
- [ ] Registration screen
- [ ] Main dashboard
- [ ] Expense management
- [ ] Group management
- [ ] Balance visualization

### 📱 Planned
- [ ] Real-time updates via WebSocket
- [ ] Offline support
- [ ] Advanced analytics
- [ ] Export functionality

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Mantine UI](https://mantine.dev/)
- [Telegram WebApp API](https://core.telegram.org/bots/webapps)
- [Zustand](https://zustand.docs.pmnd.rs/)
