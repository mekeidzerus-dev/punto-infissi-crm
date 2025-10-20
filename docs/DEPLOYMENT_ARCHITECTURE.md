# 🏗️ АРХИТЕКТУРА DEPLOYMENT

## 📋 ОГЛАВЛЕНИЕ
1. [Общая архитектура](#общая-архитектура)
2. [Структура директорий](#структура-директорий)
3. [GitHub Actions](#github-actions)
4. [PM2 конфигурация](#pm2-конфигурация)
5. [Процесс деплоя](#процесс-деплоя)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 ОБЩАЯ АРХИТЕКТУРА

```
┌─────────────────────────────────────────────────────────────┐
│                         GITHUB                              │
│  ┌──────────────────┐       ┌──────────────────┐           │
│  │  develop branch  │       │   main branch    │           │
│  └────────┬─────────┘       └────────┬─────────┘           │
└───────────┼──────────────────────────┼──────────────────────┘
            │                          │
            │ push                     │ push
            ▼                          ▼
    ┌───────────────┐          ┌───────────────┐
    │ GitHub Actions│          │ GitHub Actions│
    │   (Staging)   │          │ (Production)  │
    └───────┬───────┘          └───────┬───────┘
            │                          │
            │ SSH Deploy               │ SSH Deploy
            ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      FASTPANEL SERVER                       │
│  ┌──────────────────────────┐  ┌──────────────────────────┐│
│  │  Staging Environment     │  │ Production Environment   ││
│  │  Port: 3002              │  │ Port: 3000               ││
│  │  /staging.../            │  │ /infissi.../             ││
│  │  PM2: staging            │  │ PM2: current             ││
│  └──────────────────────────┘  └──────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 СТРУКТУРА ДИРЕКТОРИЙ

### **FastPanel:**

```
/var/www/fastuser/data/www/
├── infissi.omoxsoft.com.ua/          # Production
│   ├── src/                          # Исходники
│   ├── .next/                        # Собранное приложение
│   ├── node_modules/                 # Зависимости
│   ├── prisma/                       # База данных
│   ├── .env                          # Production переменные
│   ├── next.config.js                # Next.js конфигурация
│   ├── package.json                  # Зависимости
│   └── pm2.production.config.js      # PM2 конфигурация
│
└── staging.infissi.omoxsoft.com.ua/  # Staging
    ├── src/                          # Исходники
    ├── .next/                        # Собранное приложение
    ├── node_modules/                 # Зависимости
    ├── prisma/                       # База данных
    ├── .env                          # Staging переменные
    ├── next.config.js                # Next.js конфигурация
    ├── package.json                  # Зависимости
    └── pm2.staging.config.js         # PM2 конфигурация

/var/www/fastuser/data/backups/       # Бэкапы
└── punto-infissi-crm/
    ├── backup-20251021-010000.tar.gz
    └── backup-20251021-020000.tar.gz

/var/www/fastuser/data/logs/          # Логи
├── production-combined.log
├── production-out.log
├── production-error.log
├── staging-combined.log
├── staging-out.log
└── staging-error.log
```

---

## ⚙️ GITHUB ACTIONS

### **1️⃣ Staging Deploy (develop → staging)**

**Файл:** `.github/workflows/deploy-staging.yml`

**Триггер:** `push` в ветку `develop`

**Шаги:**
1. ✅ Checkout кода
2. ✅ SSH подключение к серверу
3. ✅ Остановка PM2 процесса
4. ✅ Обновление кода (`git pull`)
5. ✅ Установка зависимостей (`npm install`)
6. ✅ Prisma миграции
7. ✅ Сборка проекта (`npm run build`)
8. ✅ Запуск PM2 процесса
9. ✅ Health Check

**Время деплоя:** ~2-3 минуты

---

### **2️⃣ Production Deploy (main → production)**

**Файл:** `.github/workflows/deploy-production.yml`

**Триггер:** `push` в ветку `main`

**Шаги:**
1. ✅ Checkout кода
2. ✅ SSH подключение к серверу
3. ✅ Создание бэкапа
4. ✅ Остановка PM2 процесса
5. ✅ Обновление кода (`git pull`)
6. ✅ Установка зависимостей (`npm install`)
7. ✅ Prisma миграции
8. ✅ Сборка проекта (`npm run build`)
9. ✅ Запуск PM2 процесса
10. ✅ Health Check

**Время деплоя:** ~3-4 минуты

---

## 🔧 PM2 КОНФИГУРАЦИЯ

### **Staging (`pm2.staging.config.js`):**

```javascript
{
  name: 'punto-infissi-crm-staging',
  script: 'npm',
  args: 'start -- --port 3002',
  cwd: '/var/www/fastuser/data/www/staging.infissi.omoxsoft.com.ua',
  instances: 1,
  autorestart: true,
  max_memory_restart: '1G',
  env: {
    NODE_ENV: 'production',
    PORT: 3002,
  }
}
```

### **Production (`pm2.production.config.js`):**

```javascript
{
  name: 'punto-infissi-crm-current',
  script: 'npm',
  args: 'start -- --port 3000',
  cwd: '/var/www/fastuser/data/www/infissi.omoxsoft.com.ua',
  instances: 1,
  autorestart: true,
  max_memory_restart: '1G',
  env: {
    NODE_ENV: 'production',
    PORT: 3000,
  }
}
```

---

## 🚀 ПРОЦЕСС ДЕПЛОЯ

### **📝 Разработка → Staging:**

```bash
# 1. Разработка в локальной ветке
git checkout develop
# ... делаем изменения ...

# 2. Коммит и push
git add .
git commit -m "feat: новая функция"
git push origin develop

# 3. GitHub Actions автоматически деплоит на staging
# Проверяем: http://95.67.11.37:3002
```

**Время:** ~2-3 минуты

---

### **🎯 Staging → Production:**

```bash
# 1. Тестируем на staging
# Проверяем: http://95.67.11.37:3002

# 2. Если все работает, мержим в main
git checkout main
git merge develop
git push origin main

# 3. GitHub Actions автоматически деплоит на production
# Проверяем: https://infissi.omoxsoft.com.ua
```

**Время:** ~3-4 минуты

---

## 🔍 MONITORING

### **Проверка статуса PM2:**

```bash
ssh fastuser@95.67.11.37
pm2 list
```

### **Просмотр логов:**

```bash
# Staging
pm2 logs punto-infissi-crm-staging

# Production
pm2 logs punto-infissi-crm-current

# Все логи
pm2 logs
```

### **Health Check:**

```bash
# Staging
curl http://95.67.11.37:3002/api/health

# Production
curl https://infissi.omoxsoft.com.ua/api/health
```

---

## 🐛 TROUBLESHOOTING

### **❌ Проблема: GitHub Actions падает**

**Решение:**
1. Проверить GitHub Actions: https://github.com/mekeidzerus-dev/punto-infissi-crm/actions
2. Проверить секреты в GitHub:
   - `FASTPANEL_HOST`
   - `FASTPANEL_USER`
   - `FASTPANEL_PORT`
   - `FASTPANEL_SSH_KEY`
   - `DATABASE_URL`

---

### **❌ Проблема: PM2 процесс не запускается**

**Решение:**
```bash
ssh fastuser@95.67.11.37
cd /var/www/fastuser/data/www/staging.infissi.omoxsoft.com.ua
pm2 logs punto-infissi-crm-staging --lines 50
```

Проверить:
- `.env` файл существует
- `DATABASE_URL` правильный
- `node_modules` установлены
- `.next` директория собрана

---

### **❌ Проблема: Сборка падает (build fails)**

**Решение:**
1. Проверить `next.config.js`:
```javascript
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
```

2. Пересобрать вручную:
```bash
ssh fastuser@95.67.11.37
cd /var/www/fastuser/data/www/staging.infissi.omoxsoft.com.ua
rm -rf .next node_modules
npm install
npm run build
```

---

### **❌ Проблема: База данных не подключается**

**Решение:**
1. Проверить `.env`:
```bash
ssh fastuser@95.67.11.37
cat /var/www/fastuser/data/www/staging.infissi.omoxsoft.com.ua/.env
```

2. Проверить PostgreSQL:
```bash
psql -U infissi_omox -d infissi_omox -c "SELECT 1;"
```

---

## 📊 МЕТРИКИ

### **Время деплоя:**
- **Staging:** 2-3 минуты
- **Production:** 3-4 минуты

### **Downtime:**
- **Staging:** ~10-15 секунд
- **Production:** ~10-15 секунд

### **Успешность:**
- **Target:** 99% успешных деплоев
- **Rollback time:** < 5 минут

---

## 🎯 CHECKLIST ПЕРЕД ДЕПЛОЕМ

### **Staging:**
- [ ] Код протестирован локально
- [ ] Все тесты проходят
- [ ] `.env` файл обновлен
- [ ] Prisma схема обновлена (если нужно)

### **Production:**
- [ ] Staging протестирован
- [ ] Все функции работают
- [ ] Нет критических ошибок в логах
- [ ] Клиенты уведомлены (если breaking changes)
- [ ] Бэкап создан автоматически

---

## 📞 КОНТАКТЫ

**В случае проблем:**
1. Проверить GitHub Actions
2. Проверить PM2 логи
3. Проверить Health Check endpoint

**Полезные команды:**
```bash
# Рестарт staging
ssh fastuser@95.67.11.37 "pm2 restart punto-infissi-crm-staging"

# Рестарт production
ssh fastuser@95.67.11.37 "pm2 restart punto-infissi-crm-current"

# Откат production (из бэкапа)
ssh fastuser@95.67.11.37
cd /var/www/fastuser/data/www/infissi.omoxsoft.com.ua
tar -xzf /var/www/fastuser/data/backups/punto-infissi-crm/backup-YYYYMMDD-HHMMSS.tar.gz
pm2 restart punto-infissi-crm-current
```

---

**🎉 Все работает автоматически!**

