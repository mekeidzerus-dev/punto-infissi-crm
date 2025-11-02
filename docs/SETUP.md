# Установка и запуск

## Быстрый старт

```bash
# Установка
npm install

# Настройка БД
cp env.example .env.local
# Заполнить DATABASE_URL

# Миграции
npx prisma migrate deploy

# Seed данных (опционально)
npm run seed:dev

# Запуск
npm run dev
```

Откройте: http://localhost:3000

## Production

```bash
npm run build
npm start
```

## Переменные окружения

- `DATABASE_URL` - строка подключения БД
- `NEXTAUTH_SECRET` - секрет для аутентификации
- `NEXTAUTH_URL` - URL приложения
