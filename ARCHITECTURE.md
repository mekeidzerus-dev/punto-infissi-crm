# 🏛️ Архитектура системы Punto Infissi CRM

## 📐 Общая архитектура

### Архитектурный паттерн

Система построена на основе **модульной монолитной архитектуры** с использованием Next.js App Router:

```
┌─────────────────────────────────────────────────────────────┐
│                      БРАУЗЕР (Client)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Pages     │  │ Components  │  │  Contexts   │        │
│  │ (App Router)│  │   (React)   │  │  (State)    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/JSON
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    СЕРВЕР (Next.js API)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              API Routes                              │   │
│  │  /api/clients  /api/proposals  /api/parameters       │   │
│  └─────────────────────────────────────────────────────┘   │
│                             │                               │
│                             ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Prisma ORM                              │   │
│  │  (Типобезопасный доступ к БД)                        │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │ SQL
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   БАЗА ДАННЫХ (PostgreSQL)                   │
│  [Clients] [Proposals] [Parameters] [Values] [Categories]   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗃️ Архитектура базы данных

### Ключевые сущности

```
ProductCategory (Категории)
    ├── name, nameIt, icon
    ├── SupplierCategory ─────► Supplier (Поставщики)
    └── CategoryParameter ────► ParameterTemplate (Параметры)
                                    │
                                    ├── ParameterValue (Значения)
                                    │     ├── value, valueIt
                                    │     ├── hexColor, ralCode
                                    │     └── approvalStatus
                                    │
                                    └── SupplierParameterOverride
                                          ├── minValue, maxValue
                                          └── allowedValues

Client (Клиенты)
    └── Proposal (Предложения)
          └── ProposalItem (Позиции)
                ├── ProductCategory
                ├── Supplier
                └── parameters: { [paramId]: value }
```

### Связи (Relationships)

#### Many-to-Many

- **Category ↔ Supplier**: один поставщик работает с несколькими категориями
- **Category ↔ Parameter**: один параметр используется в нескольких категориях

#### One-to-Many

- **Client → Proposal**: один клиент может иметь много предложений
- **Proposal → ProposalItem**: одно предложение содержит много позиций
- **ParameterTemplate → ParameterValue**: один параметр имеет много значений

---

## 🔄 Поток данных

### 1. Создание предложения

```
Пользователь нажимает "Создать предложение"
                │
                ▼
        [ProposalFormV3]
                │
    ┌───────────┴───────────┐
    │                       │
    ▼                       ▼
ClientSearch          ProductConfigurator
    │                       │
    │               ┌───────┴───────┐
    │               │               │
    │               ▼               ▼
    │       CategorySelect   SupplierSelect
    │               │               │
    │               └───────┬───────┘
    │                       │
    │                       ▼
    │              ParameterInputs
    │               ├── InlineAddSelectValue
    │               └── ParameterValuesManager
    │                       │
    └───────────┬───────────┘
                │
                ▼
        POST /api/proposals
                │
                ▼
         Сохранение в БД
                │
                ▼
        ✅ Предложение создано
```

### 2. Продуктовый конфигуратор

```
1. Выбор категории
   GET /api/product-categories
   ↓
   [Category Grid с иконками]

2. Выбор поставщика
   GET /api/supplier-categories?categoryId=...
   ↓
   [Supplier List для выбранной категории]

3. Настройка параметров
   GET /api/category-parameters?categoryId=...
   GET /api/suppliers/[id]/parameter-overrides
   ↓
   Применение переопределений поставщика
   ↓
   [Динамическая форма параметров]
   ├── NUMBER: Input с min/max
   ├── SELECT: Dropdown + inline add
   ├── COLOR: Color picker + HEX → RAL
   ├── TEXT: Input
   └── BOOLEAN: Checkbox

4. Визуализация
   [ProductVisualizer]
   ├── Получение значений параметров
   ├── Масштабирование
   ├── Применение цвета (HEX из параметра)
   └── Отображение размеров, стрелок
```

---

## 🔐 Безопасность

### Валидация данных

- **Frontend**: React форм-валидация
- **Backend**: Zod схемы для API endpoints
- **Database**: Prisma типобезопасность

### Загрузка файлов

- Проверка типов файлов (изображения для логотипа/favicon)
- Ограничение размера (например, max 2MB)
- Удаление старых файлов при замене

### SQL Injection

- Защита через Prisma ORM
- Параметризованные запросы

---

## 🎯 Масштабируемость

### Горизонтальное масштабирование

- Stateless API (можно запустить несколько инстансов)
- Сессии через JWT или database sessions
- Файлы в S3/облаке (опционально)

### Вертикальное масштабирование

- Оптимизация запросов Prisma
- Индексы в базе данных
- Connection pooling для PostgreSQL

### Расширяемость

- Модульная структура параметров
- Легко добавить новые типы параметров
- Легко добавить новые категории
- Расширяемая система переопределений

---

## 📈 Мониторинг и логирование

### Логирование

Все критические операции логируются в консоль:

```
✅ Found 15 clients
🔍 Fetching proposals...
📝 Creating client with data: {...}
❌ Error fetching parameters: ...
```

### Рекомендации для production:

- Интеграция с сервисом логирования (Sentry, LogRocket)
- Мониторинг производительности (Vercel Analytics)
- Error tracking с уведомлениями

---

## 🔧 Конфигурация

### Переменные окружения

```env
# База данных
DATABASE_URL="postgresql://user:password@localhost:5432/punto_infissi"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Опционально: S3 для файлов
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET=""

# Опционально: Email
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
```

### Feature Flags

Система поддерживает feature flags для постепенного внедрения функций:

```typescript
{
  "PRODUCT_VISUALIZATION": true,
  "ADVANCED_SEARCH": true,
  "EMAIL_INTEGRATION": false  // в разработке
}
```

---

## 🎨 Компонентная архитектура

### Переиспользуемые компоненты

#### Формы

- `ClientFormModal`: универсальная форма клиента (создание + редактирование)
- `ProposalFormV3`: форма предложения
- `ProductConfigurator`: конфигуратор продукта

#### Управление данными

- `DictionariesManager`: управление справочниками
- `ParameterValuesManager`: управление значениями параметров
- `InlineAddSelectValue`: inline добавление значений

#### Визуализация

- `ProductVisualizer`: визуализация продукта (двери/окна)
- `ProposalPDFPreview`: предпросмотр и генерация PDF

#### UI компоненты

- Shadcn/UI (Button, Input, Select, Dialog, Table...)
- Кастомные компоненты с единым стилем

---

## 🔄 Состояние и контексты

### LanguageContext

Глобальный контекст для управления языком:

```typescript
{
  locale: 'it' | 'ru',
  t: (key: string) => string,
  setLanguage: (locale: 'it' | 'ru') => void
}
```

**Использование:**

- Переводы всего интерфейса
- Приоритет полей в формах
- Формат дат и чисел

---

## 📦 Зависимости

### Production

```json
{
	"next": "15.5.4",
	"react": "^19.0.0",
	"prisma": "^6.16.3",
	"@prisma/client": "^6.16.3",
	"react-pdf/renderer": "^4.2.0",
	"lucide-react": "^0.469.0",
	"tailwindcss": "^3.4.1"
}
```

### Development

```json
{
	"typescript": "^5.7.3",
	"@types/react": "^19.0.0",
	"eslint": "^9.18.0"
}
```

---

## 🧩 Интеграции (будущие)

### Запланированные интеграции

- **IP-телефония**: интеграция с Asterisk/FreePBX
- **Email**: отправка предложений клиентам
- **1C**: синхронизация данных
- **WhatsApp Business API**: уведомления клиентам
- **Google Calendar**: планирование установок
- **Telegram Bot**: уведомления менеджерам

---

## 🎓 Best Practices

### Код

- TypeScript для типобезопасности
- ESLint для качества кода
- Именование по стандартам (camelCase, PascalCase)
- Комментарии на русском/английском

### Компоненты

- Server Components по умолчанию
- Client Components только при необходимости
- Композиция над наследованием
- Props drilling минимизирован (Context API)

### Стилизация

- Tailwind CSS utility-first
- Консистентная цветовая палитра
- Адаптивный дизайн (mobile-first)
- Темизация через CSS переменные

### База данных

- Миграции через Prisma
- Seed данные для разработки
- Индексы на часто используемых полях
- Cascade delete для связанных данных

---

**Документ обновлён:** Октябрь 2025  
**Версия архитектуры:** 1.0
