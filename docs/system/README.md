# PUNTO INFISSI CRM

Система управления продажами окон и дверей с автоматической генерацией PDF предложений.

## Возможности

- 📊 **Панель управления** - обзор статистики и ключевых метрик
- 👥 **Управление клиентами** - база клиентов с полной информацией
- 📦 **Каталог продуктов** - управление ассортиментом окон и дверей
- 🛒 **Система заказов** - создание и отслеживание заказов
- 📄 **PDF предложения** - автоматическая генерация коммерческих предложений
- 🔐 **Аутентификация** - безопасный доступ к системе

## Технологический стек

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **База данных**: PostgreSQL, Prisma ORM
- **Аутентификация**: NextAuth.js
- **PDF генерация**: @react-pdf/renderer

## Установка и запуск

### Предварительные требования

- Node.js 18+
- PostgreSQL
- npm или pnpm

### Шаги установки

1. **Клонируйте проект**

   ```bash
   cd punto-infissi-crm
   ```

2. **Установите зависимости**

   ```bash
   npm install
   ```

3. **Настройте базу данных**

   - Создайте PostgreSQL базу данных
   - Скопируйте `env.example` в `.env`
   - Заполните `DATABASE_URL` в `.env`

4. **Настройте переменные окружения**

   ```bash
   cp env.example .env
   ```

   Отредактируйте `.env`:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/punto_infissi_crm"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

5. **Выполните миграции базы данных**

   ```bash
   npx prisma migrate dev
   ```

6. **Создайте демо пользователя**

   ```bash
   npx prisma db seed
   ```

7. **Запустите приложение**
   ```bash
   npm run dev
   ```

Приложение будет доступно по адресу: http://localhost:3000

## Демо доступ

- **Email**: admin@example.com
- **Пароль**: admin123

## Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API маршруты
│   ├── auth/              # Страницы аутентификации
│   ├── dashboard/         # Панель управления
│   ├── clients/           # Управление клиентами
│   ├── products/          # Каталог продуктов
│   └── orders/            # Система заказов
├── components/            # React компоненты
│   ├── ui/               # UI компоненты (shadcn/ui)
│   └── ...               # Бизнес компоненты
├── lib/                  # Утилиты и конфигурация
│   ├── prisma.ts         # Prisma клиент
│   ├── auth.ts           # NextAuth конфигурация
│   └── utils.ts          # Общие утилиты
└── types/                # TypeScript типы
```

## База данных

### Основные модели

- **Client** - клиенты
- **Product** - продукты (окна/двери)
- **Category** - категории продуктов
- **Order** - заказы
- **OrderItem** - позиции заказа
- **Proposal** - PDF предложения

### Миграции

```bash
# Создать новую миграцию
npx prisma migrate dev --name migration_name

# Применить миграции в продакшене
npx prisma migrate deploy

# Сбросить базу данных
npx prisma migrate reset
```

## API

### Клиенты

- `GET /api/clients` - список клиентов
- `POST /api/clients` - создать клиента
- `GET /api/clients/[id]` - получить клиента
- `PUT /api/clients/[id]` - обновить клиента
- `DELETE /api/clients/[id]` - удалить клиента

### Продукты

- `GET /api/products` - список продуктов
- `POST /api/products` - создать продукт
- `GET /api/products/[id]` - получить продукт
- `PUT /api/products/[id]` - обновить продукт
- `DELETE /api/products/[id]` - удалить продукт

### Заказы

- `GET /api/orders` - список заказов
- `POST /api/orders` - создать заказ
- `GET /api/orders/[id]` - получить заказ
- `PUT /api/orders/[id]` - обновить заказ

## Развертывание

### Vercel (рекомендуется)

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения в Vercel
3. Добавьте PostgreSQL базу данных (например, Neon, Supabase)
4. Деплой произойдет автоматически

### Другие платформы

- **Railway**: поддерживает Next.js и PostgreSQL из коробки
- **Render**: бесплатный PostgreSQL + Next.js
- **Heroku**: с PostgreSQL аддоном

## Разработка

### Добавление новых функций

1. Создайте API маршрут в `src/app/api/`
2. Добавьте Prisma модель в `prisma/schema.prisma`
3. Создайте UI компоненты в `src/components/`
4. Добавьте страницы в `src/app/`

### Команды

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Запуск продакшн версии
npm start

# Линтинг
npm run lint

# Типы Prisma
npx prisma generate

# Просмотр базы данных
npx prisma studio
```

## Лицензия

MIT License

## Поддержка

Для вопросов и поддержки создайте issue в репозитории.
