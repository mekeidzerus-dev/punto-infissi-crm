#!/bin/bash
# Скрипт для подготовки к тестированию
# Использование: bash scripts/setup-test.sh

set -e

echo "🚀 Подготовка к тестированию авторизации"
echo "========================================"
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Проверка Node.js
echo "📦 Проверка Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js не установлен${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"

# Проверка npm
echo "📦 Проверка npm..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm не установлен${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"

# Проверка .env файла
echo ""
echo "🔐 Проверка переменных окружения..."
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Файл .env не найден${NC}"
    if [ -f env.example ]; then
        echo "📋 Создаю .env из env.example..."
        cp env.example .env
        echo -e "${GREEN}✅ Файл .env создан${NC}"
        echo -e "${YELLOW}⚠️  Не забудьте заполнить переменные в .env!${NC}"
    else
        echo -e "${RED}❌ Файл env.example не найден${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Файл .env найден${NC}"
fi

# Проверка зависимостей
echo ""
echo "📦 Проверка зависимостей..."
if [ ! -d node_modules ]; then
    echo "📥 Установка зависимостей..."
    npm install
    echo -e "${GREEN}✅ Зависимости установлены${NC}"
else
    echo -e "${GREEN}✅ Зависимости установлены${NC}"
fi

# Проверка Prisma
echo ""
echo "🗄️  Проверка Prisma..."
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx не доступен${NC}"
    exit 1
fi

# Проверка миграций
echo "📊 Проверка миграций БД..."
if [ -d prisma/migrations ]; then
    MIGRATION_COUNT=$(ls -1 prisma/migrations | wc -l)
    echo -e "${GREEN}✅ Найдено миграций: $MIGRATION_COUNT${NC}"
else
    echo -e "${YELLOW}⚠️  Папка migrations не найдена${NC}"
fi

# Генерация Prisma Client
echo "🔧 Генерация Prisma Client..."
npx prisma generate
echo -e "${GREEN}✅ Prisma Client сгенерирован${NC}"

# Проверка готовности
echo ""
echo "🔍 Финальная проверка готовности..."
npm run check:ready

echo ""
echo "========================================"
echo -e "${GREEN}✅ Подготовка завершена!${NC}"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Выполните миграцию БД (если еще не выполнена):"
echo "      ${YELLOW}npx prisma migrate dev --name add_password_reset_token${NC}"
echo ""
echo "   2. Запустите сервер:"
echo "      ${YELLOW}npm run dev${NC}"
echo ""
echo "   3. В новом терминале запустите тесты:"
echo "      ${YELLOW}npm run test:auth${NC}"
echo ""

