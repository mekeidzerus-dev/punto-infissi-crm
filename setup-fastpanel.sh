#!/bin/bash

# 🚀 Автоматическая настройка FastPanel для CI/CD
# Проект: PUNTO INFISSI CRM

set -e

echo "🚀 Начинаем настройку FastPanel для CI/CD..."

# Данные сервера
SERVER_HOST="95.67.11.37"
SERVER_USER="fastuser"
SERVER_PASSWORD="D1234dsnake03081985!@#$"
DOMAIN="infissi.omoxsoft.com.ua"
ROOT_PATH="/var/www/fastuser/data/www/infissi.omoxsoft.com.ua"

# Данные БД
DB_NAME="infissi_omox"
DB_USER="infissi_omox"
DB_PASSWORD="ny+dKU%FuC<o)og["

echo "📋 Данные сервера:"
echo "   Host: $SERVER_HOST"
echo "   User: $SERVER_USER"
echo "   Domain: $DOMAIN"
echo "   Root Path: $ROOT_PATH"
echo ""

# Функция для выполнения команд на сервере
run_remote() {
    echo "🔧 Выполняем: $1"
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "$1"
}

# Функция для загрузки файлов на сервер
upload_file() {
    echo "📤 Загружаем: $1 -> $2"
    sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no "$1" "$SERVER_USER@$SERVER_HOST:$2"
}

echo "🔍 Проверяем подключение к серверу..."
run_remote "echo '✅ Подключение к серверу успешно'"

echo ""
echo "📦 Обновляем систему..."
run_remote "sudo apt update && sudo apt upgrade -y"

echo ""
echo "🔧 Устанавливаем Node.js 18..."
run_remote "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
run_remote "sudo apt-get install -y nodejs"

echo ""
echo "📦 Устанавливаем PM2..."
run_remote "sudo npm install -g pm2"

echo ""
echo "🗄️ Устанавливаем PostgreSQL..."
run_remote "sudo apt-get install postgresql postgresql-contrib -y"

echo ""
echo "📁 Создаем папку для проекта..."
run_remote "mkdir -p $ROOT_PATH/app"
run_remote "cd $ROOT_PATH/app"

echo ""
echo "📥 Клонируем репозиторий..."
run_remote "cd $ROOT_PATH/app && git clone https://github.com/mekeidzerus-dev/punto-infissi-crm.git ."

echo ""
echo "📦 Устанавливаем зависимости..."
run_remote "cd $ROOT_PATH/app && npm ci --production"

echo ""
echo "🔐 Создаем .env файл..."
run_remote "cat > $ROOT_PATH/app/.env << 'EOF'
DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/punto_infissi_crm\"
NEXTAUTH_SECRET=\"punto-infissi-crm-super-secret-key-2025\"
NEXTAUTH_URL=\"https://$DOMAIN\"
NODE_ENV=\"production\"
EOF"

echo ""
echo "🗄️ Настраиваем базу данных..."
run_remote "sudo -u postgres psql -c \"CREATE DATABASE punto_infissi_crm;\""
run_remote "sudo -u postgres psql -c \"CREATE USER punto_user WITH PASSWORD 'punto_secure_password_2025';\""
run_remote "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE punto_infissi_crm TO punto_user;\""

echo ""
echo "🔄 Применяем миграции..."
run_remote "cd $ROOT_PATH/app && npx prisma migrate deploy"

echo ""
echo "🔧 Генерируем Prisma Client..."
run_remote "cd $ROOT_PATH/app && npx prisma generate"

echo ""
echo "📊 Заполняем тестовыми данными..."
run_remote "cd $ROOT_PATH/app && npx tsx prisma/seed-sources.ts"
run_remote "cd $ROOT_PATH/app && npx tsx prisma/seed-proposal-system.ts"
run_remote "cd $ROOT_PATH/app && npx tsx prisma/seed-templates.ts"
run_remote "cd $ROOT_PATH/app && npx tsx prisma/seed-vat-0.ts"

echo ""
echo "🏗️ Собираем проект..."
run_remote "cd $ROOT_PATH/app && npm run build"

echo ""
echo "🚀 Запускаем через PM2..."
run_remote "cd $ROOT_PATH/app && pm2 start ecosystem.config.js --env production"

echo ""
echo "💾 Сохраняем конфигурацию PM2..."
run_remote "pm2 save"

echo ""
echo "🔄 Настраиваем автозапуск PM2..."
run_remote "pm2 startup"

echo ""
echo "🔑 Создаем SSH ключи для GitHub..."
run_remote "ssh-keygen -t ed25519 -C 'deploy@punto-infissi-crm' -f ~/.ssh/id_ed25519 -N ''"

echo ""
echo "📋 Получаем публичный ключ..."
PUBLIC_KEY=$(run_remote "cat ~/.ssh/id_ed25519.pub")
echo "Публичный ключ для сервера:"
echo "$PUBLIC_KEY"

echo ""
echo "📋 Получаем приватный ключ..."
PRIVATE_KEY=$(run_remote "cat ~/.ssh/id_ed25519")
echo "Приватный ключ для GitHub Secrets:"
echo "$PRIVATE_KEY"

echo ""
echo "✅ Настройка сервера завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Добавьте публичный ключ в ~/.ssh/authorized_keys на сервере"
echo "2. Добавьте приватный ключ в GitHub Secrets"
echo "3. Настройте Nginx в FastPanel"
echo "4. Настройте SSL"
echo "5. Протестируйте деплой"

echo ""
echo "🎉 Сервер готов для CI/CD!"


