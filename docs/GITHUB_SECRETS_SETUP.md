# 🔐 НАСТРОЙКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ ДЛЯ CI/CD

**Проект:** PUNTO INFISSI CRM  
**Дата:** 19 октября 2025

---

## 🎯 ЧТО НУЖНО НАСТРОИТЬ

Для автоматического деплоя нужно добавить **5 секретов** в GitHub:

1. **FASTPANEL_HOST** - адрес вашего сервера
2. **FASTPANEL_USER** - пользователь для SSH
3. **FASTPANEL_PORT** - порт SSH (обычно 22)
4. **FASTPANEL_SSH_KEY** - приватный SSH ключ
5. **DATABASE_URL** - строка подключения к БД

---

## 📋 ПОШАГОВАЯ ИНСТРУКЦИЯ

### ШАГ 1: Откройте GitHub Secrets

1. Перейдите в ваш репозиторий: `https://github.com/mekeidzerus-dev/punto-infissi-crm`
2. Нажмите **Settings** (вкладка справа)
3. В левом меню выберите **Secrets and variables** → **Actions**
4. Нажмите **New repository secret**

### ШАГ 2: Добавьте каждый секрет

#### 1️⃣ FASTPANEL_HOST

```
Name: FASTPANEL_HOST
Value: your-server.com
```

**Пример:** `fastpanel.example.com` или `192.168.1.100`

#### 2️⃣ FASTPANEL_USER

```
Name: FASTPANEL_USER
Value: root
```

**Обычно:** `root` или `ubuntu` (зависит от сервера)

#### 3️⃣ FASTPANEL_PORT

```
Name: FASTPANEL_PORT
Value: 22
```

**Обычно:** `22` (стандартный SSH порт)

#### 4️⃣ FASTPANEL_SSH_KEY

```
Name: FASTPANEL_SSH_KEY
Value: -----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACBexample...your-private-key-here...
-----END OPENSSH PRIVATE KEY-----
```

**Как получить SSH ключ:**

```bash
# На вашем компьютере
ssh-keygen -t ed25519 -C "deploy@punto-infissi-crm"

# Скопируйте приватный ключ
cat ~/.ssh/id_ed25519

# Скопируйте публичный ключ на сервер
ssh-copy-id root@your-server.com
```

#### 5️⃣ DATABASE_URL

```
Name: DATABASE_URL
Value: postgresql://punto_user:your_password@localhost:5432/punto_infissi_crm
```

**Формат:** `postgresql://username:password@host:port/database`

---

## 🔑 ДОПОЛНИТЕЛЬНЫЕ СЕКРЕТЫ (опционально)

### NEXTAUTH_SECRET

```
Name: NEXTAUTH_SECRET
Value: your-super-secret-key-here-min-32-chars
```

### NEXTAUTH_URL

```
Name: NEXTAUTH_URL
Value: https://your-domain.com
```

---

## ✅ ПРОВЕРКА НАСТРОЙКИ

После добавления всех секретов:

1. **Перейдите в Actions:**

   - `https://github.com/mekeidzerus-dev/punto-infissi-crm/actions`

2. **Сделайте тестовый коммит:**

   ```bash
   git add .
   git commit -m "test: CI/CD setup"
   git push origin main
   ```

3. **Проверьте выполнение:**
   - Должен запуститься workflow "🚀 Deploy to FastPanel"
   - Если все секреты настроены правильно → деплой пройдет успешно

---

## 🚨 ЧАСТЫЕ ОШИБКИ

### "Permission denied (publickey)"

**Решение:** Проверьте FASTPANEL_SSH_KEY

- Ключ должен быть приватным (начинается с `-----BEGIN`)
- Публичный ключ должен быть добавлен на сервер

### "Host key verification failed"

**Решение:** Добавьте сервер в known_hosts

```bash
ssh-keyscan -H your-server.com >> ~/.ssh/known_hosts
```

### "Database connection failed"

**Решение:** Проверьте DATABASE_URL

- Формат: `postgresql://user:pass@host:port/db`
- Убедитесь что БД существует на сервере

---

## 🔧 НАСТРОЙКА СЕРВЕРА

### Если сервер еще не настроен:

```bash
# Подключитесь к серверу
ssh root@your-server.com

# Установите Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Установите PM2
npm install -g pm2

# Установите PostgreSQL
apt-get install postgresql postgresql-contrib

# Создайте БД и пользователя
sudo -u postgres createdb punto_infissi_crm
sudo -u postgres createuser --interactive
# Введите: punto_user
# Выберите: y (superuser)

# Создайте папку проекта
mkdir -p /var/www/punto-infissi-crm
chown -R www-data:www-data /var/www/punto-infissi-crm
```

---

## 📊 СТАТУС СЕКРЕТОВ

После добавления всех секретов в GitHub должно быть:

```
✅ FASTPANEL_HOST
✅ FASTPANEL_USER
✅ FASTPANEL_PORT
✅ FASTPANEL_SSH_KEY
✅ DATABASE_URL
✅ NEXTAUTH_SECRET (опционально)
✅ NEXTAUTH_URL (опционально)
```

**Всего:** 5-7 секретов

---

## 🎉 ГОТОВО!

После настройки всех секретов:

1. **Каждый `git push`** → автоматический деплой
2. **Проверка кода** → сборка → загрузка на сервер
3. **Zero downtime** для пользователей
4. **Бэкапы** предыдущих версий

**Теперь разработка стала автоматической!** 🚀

---

_Подготовил: AI CTO Partner_  
_Дата: 19 октября 2025_


