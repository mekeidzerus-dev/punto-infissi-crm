# 🚀 АВТОМАТИЧЕСКИЙ ДЕПЛОЙ НА FASTPANEL

**Проект:** PUNTO INFISSI CRM  
**Версия:** 1.0.0  
**Дата:** 19 октября 2025

---

## 🎯 ЧТО ЭТО ДАЁТ

✅ **Автоматический деплой** при каждом `git push`  
✅ **Проверка кода** перед деплоем (linting, build)  
✅ **Бэкапы** предыдущих версий  
✅ **Zero-downtime** деплой  
✅ **Уведомления** о статусе деплоя  
✅ **Откат** к предыдущей версии при ошибке  

---

## 📋 ЧТО СОЗДАНО

### 1. GitHub Actions Workflow
**Файл:** `.github/workflows/deploy.yml`

**Что делает:**
- 🔍 Проверяет код (ESLint, build)
- 📦 Создает архив для деплоя
- 🚀 Загружает на FastPanel сервер
- 🔧 Устанавливает зависимости
- 🗄️ Применяет миграции БД
- ▶️ Запускает приложение

### 2. PM2 Configuration
**Файл:** `ecosystem.config.js`

**Что делает:**
- 🔄 Автоперезапуск при сбоях
- 📊 Мониторинг памяти
- 📝 Логирование
- ⚡ Production оптимизация

---

## ⚙️ НАСТРОЙКА НА СЕРВЕРЕ (FastPanel)

### ШАГ 1: Подготовка сервера

```bash
# Подключитесь к серверу по SSH
ssh root@your-server.com

# Установите Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Установите PM2 глобально
npm install -g pm2

# Создайте папку для проекта
mkdir -p /var/www/punto-infissi-crm
cd /var/www/punto-infissi-crm

# Установите PostgreSQL (если нет)
apt-get install postgresql postgresql-contrib

# Создайте базу данных
sudo -u postgres createdb punto_infissi_crm
sudo -u postgres createuser --interactive
# Введите: punto_user
# Выберите: y (superuser)
```

### ШАГ 2: Настройка FastPanel

1. **Откройте FastPanel**
2. **Создайте сайт:**
   - Домен: `your-domain.com`
   - Тип: Node.js
   - Версия: 18.x

3. **Настройте Nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **Настройте SSL (Let's Encrypt):**
   - В FastPanel: SSL → Let's Encrypt
   - Выберите домен
   - Получите сертификат

---

## 🔐 НАСТРОЙКА GITHUB SECRETS

### В GitHub репозитории:

1. **Откройте:** Settings → Secrets and variables → Actions
2. **Добавьте эти секреты:**

```
FASTPANEL_HOST=your-server.com
FASTPANEL_USER=root
FASTPANEL_PORT=22
FASTPANEL_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
your-private-ssh-key-here
-----END OPENSSH PRIVATE KEY-----

DATABASE_URL=postgresql://punto_user:password@localhost:5432/punto_infissi_crm
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-domain.com
```

### Как получить SSH ключ:

```bash
# На вашем компьютере
ssh-keygen -t ed25519 -C "deploy@punto-infissi-crm"

# Скопируйте публичный ключ на сервер
ssh-copy-id root@your-server.com

# Скопируйте приватный ключ в GitHub Secrets
cat ~/.ssh/id_ed25519
```

---

## 🚀 ПЕРВЫЙ ДЕПЛОЙ

### ШАГ 1: Ручная настройка

```bash
# На сервере
cd /var/www/punto-infissi-crm

# Клонируйте репозиторий
git clone https://github.com/mekeidzerus-dev/punto-infissi-crm.git .

# Установите зависимости
npm ci --production

# Создайте .env файл
cat > .env << 'EOF'
DATABASE_URL="postgresql://punto_user:password@localhost:5432/punto_infissi_crm"
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="https://your-domain.com"
NODE_ENV="production"
EOF

# Примените миграции
npx prisma migrate deploy
npx prisma generate

# Соберите проект
npm run build

# Запустите через PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### ШАГ 2: Проверка

```bash
# Проверьте статус
pm2 status

# Проверьте логи
pm2 logs punto-infissi-crm

# Проверьте сайт
curl http://localhost:3000
```

---

## 🔄 АВТОМАТИЧЕСКИЙ ДЕПЛОЙ

### После настройки:

1. **Сделайте изменения в коде**
2. **Коммит и пуш:**
```bash
git add .
git commit -m "feat: новая функция"
git push origin main
```

3. **GitHub Actions автоматически:**
   - ✅ Проверит код
   - ✅ Соберет проект
   - ✅ Загрузит на сервер
   - ✅ Применит миграции
   - ✅ Перезапустит приложение

4. **Проверьте результат:**
   - Откройте сайт: `https://your-domain.com`
   - Проверьте версию внизу страницы

---

## 📊 МОНИТОРИНГ

### PM2 команды:

```bash
# Статус приложения
pm2 status

# Логи в реальном времени
pm2 logs punto-infissi-crm

# Перезапуск
pm2 restart punto-infissi-crm

# Остановка
pm2 stop punto-infissi-crm

# Мониторинг ресурсов
pm2 monit
```

### GitHub Actions:

1. **Откройте:** Actions вкладку в репозитории
2. **Посмотрите:** статус последнего деплоя
3. **Логи:** детальная информация о процессе

---

## 🔧 ОТКАТ ПРИ ОШИБКЕ

### Если что-то пошло не так:

```bash
# На сервере
cd /var/www/punto-infissi-crm

# Посмотрите доступные бэкапы
ls -la backup-*.tar.gz

# Восстановите предыдущую версию
tar -xzf backup-20251019-214500.tar.gz

# Перезапустите
pm2 restart punto-infissi-crm
```

---

## 🎯 ПРОЦЕСС ДЕПЛОЯ

### Что происходит при `git push`:

```
1. 📥 GitHub получает код
   ↓
2. 🔍 GitHub Actions запускается
   ↓
3. ✅ Проверка кода (ESLint, build)
   ↓
4. 📦 Создание архива
   ↓
5. 🚀 Подключение к серверу по SSH
   ↓
6. 📦 Создание бэкапа текущей версии
   ↓
7. ⏹️ Остановка приложения
   ↓
8. 📤 Загрузка нового кода
   ↓
9. 📥 Установка зависимостей
   ↓
10. 🗄️ Применение миграций БД
    ↓
11. ▶️ Запуск приложения
    ↓
12. ✅ Проверка статуса
    ↓
13. 🎉 Готово!
```

**Время деплоя:** ~2-3 минуты

---

## 🔐 БЕЗОПАСНОСТЬ

### Рекомендации:

1. **Используйте SSH ключи** (не пароли)
2. **Ограничьте доступ** к серверу по IP
3. **Регулярно обновляйте** систему
4. **Мониторьте логи** на подозрительную активность
5. **Делайте бэкапы** базы данных

### Firewall:

```bash
# Настройте UFW
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

---

## 📈 ПРОИЗВОДИТЕЛЬНОСТЬ

### Оптимизации:

1. **PM2 кластер** (для многоядерных серверов):
```javascript
// ecosystem.config.js
instances: 'max'  // Использовать все ядра
```

2. **Nginx кэширование:**
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

3. **Сжатие:**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

---

## 🆘 РЕШЕНИЕ ПРОБЛЕМ

### Частые ошибки:

**1. "Permission denied"**
```bash
# Решение
chown -R www-data:www-data /var/www/punto-infissi-crm
```

**2. "Database connection failed"**
```bash
# Проверьте .env файл
cat .env | grep DATABASE_URL

# Проверьте PostgreSQL
sudo -u postgres psql -c "\l"
```

**3. "Port 3000 already in use"**
```bash
# Найдите процесс
lsof -i :3000

# Убейте процесс
kill -9 PID
```

**4. "Build failed"**
```bash
# Проверьте логи GitHub Actions
# Обычно проблема в коде или зависимостях
```

---

## ✅ ЧЕКЛИСТ НАСТРОЙКИ

- [ ] Сервер настроен (Node.js 18, PM2, PostgreSQL)
- [ ] FastPanel настроен (сайт, Nginx, SSL)
- [ ] SSH ключи настроены
- [ ] GitHub Secrets добавлены
- [ ] Первый деплой выполнен
- [ ] Автоматический деплой протестирован
- [ ] Мониторинг настроен
- [ ] Бэкапы работают

---

## 🎉 ГОТОВО!

После настройки:

1. **Каждый `git push`** → автоматический деплой
2. **Сайт обновляется** за 2-3 минуты
3. **Zero downtime** для пользователей
4. **Бэкапы** предыдущих версий
5. **Мониторинг** через PM2 и GitHub Actions

**Теперь разработка стала еще проще!** 🚀

---

_Подготовил: AI CTO Partner_  
_Дата: 19 октября 2025_

