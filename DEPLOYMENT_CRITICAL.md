# 🚨 Критичные рекомендации перед деплоем

## Обязательно выполнить перед продакшеном

### 1. ⚠️ Удалить debug код

**Найдено debug логирование в:**
- `src/middleware.ts` (строки 9-28) - debug логирование в файл
- `src/components/clients-sticker-v2.tsx` - debug fetch вызовы к `127.0.0.1:7242`
- `src/app/clients/page.tsx` - debug fetch вызовы

**Действие:** Удалить все `#region agent log` блоки и debug fetch вызовы.

---

### 2. 🔐 Переменные окружения

**Критично настроить:**

```bash
# Обязательно сгенерировать новый секрет
NEXTAUTH_SECRET=<сгенерировать через: openssl rand -base64 32>

# Установить реальный домен
NEXTAUTH_URL=https://yourdomain.com

# Настроить продакшен БД
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Сгенерировать секрет для cron
CRON_SECRET=<сгенерировать уникальный секрет>
```

**Проверить:**
- [ ] `.env.local` и `.env` в `.gitignore` (уже есть ✅)
- [ ] Все секреты установлены в панели хостинга
- [ ] Нет секретов в коде

---

### 3. 🗄️ База данных

**Обязательно:**
```bash
# Применить миграции
npx prisma migrate deploy

# Сгенерировать Prisma Client
npx prisma generate

# Создать резервную копию перед деплоем
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

---

### 4. 🧹 Очистка кода

**Найдено:**
- 22 использования `console.log/error/warn` - заменить на `logger`
- 24 TODO/FIXME комментария - проверить и закрыть или отложить

**Рекомендация:** 
- Заменить критичные `console.log` на `logger` (особенно в API routes)
- TODO комментарии можно оставить, если не критично

---

### 5. ✅ Финальная проверка

**Перед деплоем выполнить:**

```bash
# 1. Проверка типов
npx tsc --noEmit

# 2. Сборка проекта
npm run build

# 3. Проверка готовности (если скрипт есть)
npm run check:ready

# 4. Проверка миграций
npx prisma migrate status
```

---

### 6. 🚀 После деплоя

**Проверить:**
1. Работает ли авторизация
2. Работают ли основные CRUD операции
3. Нет ли ошибок в логах
4. Работает ли генерация PDF
5. Работает ли загрузка файлов

---

## 📋 Быстрый чеклист (минимум)

- [ ] Удалить debug код из `middleware.ts` и компонентов
- [ ] Сгенерировать и установить `NEXTAUTH_SECRET`
- [ ] Установить `NEXTAUTH_URL` на реальный домен
- [ ] Настроить `DATABASE_URL` для продакшена
- [ ] Применить миграции (`npx prisma migrate deploy`)
- [ ] Проект собирается (`npm run build`)
- [ ] Проверена работа авторизации
- [ ] Создана резервная копия БД

---

## 🔗 Полезные команды

```bash
# Генерация секрета для NextAuth
openssl rand -base64 32

# Проверка переменных окружения
node -e "console.log(process.env.NEXTAUTH_SECRET ? 'OK' : 'MISSING')"

# Применение миграций
npx prisma migrate deploy

# Проверка статуса миграций
npx prisma migrate status

# Сборка проекта
npm run build

# Запуск в production режиме
npm run start
```

---

**Дата:** 2025-01-27  
**Версия:** 1.4.1

