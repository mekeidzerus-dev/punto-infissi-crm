#!/bin/bash
# Диагностический скрипт для проверки состояния сервера после деплоя

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 ДИАГНОСТИКА СЕРВЕРА"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PRODUCTION_DIR="/var/www/fastuser/data/www/infissi.omoxsoft.com.ua"
cd "$PRODUCTION_DIR" || { echo "❌ Не могу перейти в $PRODUCTION_DIR"; exit 1; }

echo "📁 Текущая директория: $(pwd)"
echo ""

# 1. Проверка PM2 процессов
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣ ПРОВЕРКА PM2 ПРОЦЕССОВ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 list
echo ""
pm2 describe punto-infissi-crm-current 2>&1 || echo "⚠️  Процесс не найден"
echo ""

# 2. Проверка порта 3000
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣ ПРОВЕРКА ПОРТА 3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if command -v ss >/dev/null 2>&1; then
    ss -tuln | grep ":3000 " || echo "❌ Порт 3000 не слушается"
elif command -v netstat >/dev/null 2>&1; then
    netstat -tuln | grep ":3000 " || echo "❌ Порт 3000 не слушается"
else
    lsof -i :3000 || echo "❌ Порт 3000 не слушается"
fi
echo ""

# 3. Проверка логов PM2
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣ ЛОГИ PM2 (последние 50 строк)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 logs punto-infissi-crm-current --lines 50 --nostream 2>&1 || echo "⚠️  Логи недоступны"
echo ""

# 4. Проверка локального health endpoint
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣ ПРОВЕРКА ЛОКАЛЬНОГО HEALTH ENDPOINT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Health endpoint отвечает:"
    curl -s http://localhost:3000/api/health | head -10
else
    echo "❌ Health endpoint не отвечает"
fi
echo ""

# 5. Проверка структуры проекта
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣ ПРОВЕРКА СТРУКТУРЫ ПРОЕКТА"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Директория .next: $([ -d ".next" ] && echo "✅ существует" || echo "❌ не существует")"
echo "Директория .next/server: $([ -d ".next/server" ] && echo "✅ существует" || echo "❌ не существует")"
echo "Файл package.json: $([ -f "package.json" ] && echo "✅ существует" || echo "❌ не существует")"
echo "Файл .env: $([ -f ".env" ] && echo "✅ существует" || echo "❌ не существует")"
echo "Директория node_modules: $([ -d "node_modules" ] && echo "✅ существует" || echo "❌ не существует")"
echo ""

# 6. Проверка последнего коммита
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣ ПРОВЕРКА ПОСЛЕДНЕГО КОММИТА"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d ".git" ]; then
    git log --oneline -1 || echo "⚠️  Не могу получить коммит"
else
    echo "⚠️  .git директория не найдена"
fi
echo ""

# 7. Проверка процессов Node.js
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣ ПРОВЕРКА ПРОЦЕССОВ NODE.JS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ps aux | grep -E "node|npm|next" | grep -v grep || echo "⚠️  Процессы Node.js не найдены"
echo ""

# 8. Проверка Nginx конфигурации (если доступна)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8️⃣ ПРОВЕРКА NGINX КОНФИГУРАЦИИ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "/etc/nginx/sites-enabled/infissi.omoxsoft.com.ua" ]; then
    echo "✅ Конфигурация найдена:"
    grep -E "proxy_pass|listen|server_name" /etc/nginx/sites-enabled/infissi.omoxsoft.com.ua | head -10
elif [ -f "/etc/nginx/conf.d/infissi.omoxsoft.com.ua.conf" ]; then
    echo "✅ Конфигурация найдена:"
    grep -E "proxy_pass|listen|server_name" /etc/nginx/conf.d/infissi.omoxsoft.com.ua.conf | head -10
else
    echo "⚠️  Конфигурация Nginx не найдена в стандартных местах"
    echo "   Проверьте: /etc/nginx/sites-enabled/ или /etc/nginx/conf.d/"
fi
echo ""

# 9. Проверка переменных окружения
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "9️⃣ ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f ".env" ]; then
    echo "✅ .env файл существует"
    if grep -q "DATABASE_URL=" .env; then
        echo "✅ DATABASE_URL найден"
    else
        echo "❌ DATABASE_URL не найден"
    fi
    if grep -q "NEXTAUTH_SECRET=" .env; then
        echo "✅ NEXTAUTH_SECRET найден"
    else
        echo "❌ NEXTAUTH_SECRET не найден"
    fi
else
    echo "❌ .env файл не найден"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ДИАГНОСТИКА ЗАВЕРШЕНА"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

