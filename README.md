# 🏢 PUNTO INFISSI CRM

**Версия:** 1.0.0  
**Статус:** ✅ Production Ready

CRM-система для управления продажами окон и дверей с автоматическим расчетом цен и генерацией PDF предложений.

---

## ✨ Возможности

- 📊 **Управление клиентами** - физлица и юрлица с итальянскими реквизитами
- 🏭 **Управление контрагентами** - поставщики, партнёры, монтажники
- 📄 **Предложения с PDF** - автоматическая генерация документов
- 🔧 **Конфигуратор продуктов** - визуальная настройка с параметрами
- 💰 **Автоматический расчет цен** - на основе размеров и опций
- 🌍 **Многоязычность** - Русский/Итальянский (95%)
- ⚙️ **Гибкая система параметров** - 7 базовых параметров, расширяемая
- 📚 **Справочники** - источники клиентов, НДС, шаблоны документов

---

## 🚀 Быстрый старт

```bash
# 1. Установить зависимости
npm install

# 2. Настроить базу данных
cp env.example .env
# Отредактировать DATABASE_URL в .env

# 3. Применить миграции
npx prisma migrate dev

# 4. Заполнить тестовыми данными
npx tsx prisma/seed-sources.ts
npx tsx prisma/seed-proposal-system.ts
npx tsx prisma/seed-templates.ts
npx tsx prisma/seed-vat-0.ts
npx tsx prisma/seed-test-clients.ts

# 5. Запустить
npm run dev

# Открыть http://localhost:3000
```

---

## 📚 Документация

Полная документация находится в папке [`docs/`](./docs/):

- 📘 **[FINAL_DOCUMENTATION.md](./docs/FINAL_DOCUMENTATION.md)** - Главный документ (начните отсюда!)
- 🏗️ **[architecture/](./docs/architecture/)** - Архитектура и БД
- 📊 **[reports/](./docs/reports/)** - Отчеты о разработке (67 файлов)
- 📖 **[guides/](./docs/guides/)** - Руководства пользователя
- ⚙️ **[system/](./docs/system/)** - Системная документация

---

## 💻 Технологический стек

- **Frontend:** Next.js 15.5.4, React 19, TypeScript, Tailwind CSS
- **UI:** Radix UI (shadcn/ui), Lucide Icons
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL 14+, Prisma 6.16.3
- **PDF:** @react-pdf/renderer
- **Testing:** Playwright

---

## 📊 Статистика

- **Таблиц БД:** 26
- **API Endpoints:** 40+
- **React компонентов:** 45+
- **Строк кода:** ~15,000
- **Переводов:** 360 (RU/IT)
- **Документации:** 102 MD файла

---

## 🎯 Основные модули

1. **Клиенты** (`/clients`) - CRUD с multi-search
2. **Предложения** (`/proposals`) - создание с конфигуратором
3. **Поставщики** (`/suppliers`) - управление с категориями
4. **Партнёры** (`/partners`) - типы и комиссии
5. **Монтажники** (`/installers`) - специализация и тарифы
6. **Настройки** (`/settings`) - справочники, НДС, параметры
7. **Dashboard** (`/dashboard`) - панель управления

---

## 🏗️ Архитектура

```
Frontend (Next.js 15)
    ↓
API Routes (REST)
    ↓
Business Logic (price-calculator, validators)
    ↓
Prisma ORM
    ↓
PostgreSQL Database (26 tables)
```

---

## 🔐 Безопасность

⚠️ **ВАЖНО:** Перед production деплоем:

- [ ] Настроить авторизацию (NextAuth готов)
- [ ] Защитить API routes (middleware)
- [ ] Настроить RBAC (admin/manager/user)
- [ ] Проверить .env файлы (не коммитить!)

---

## 📝 Команды

```bash
# Development
npm run dev              # Запуск dev сервера
npm run build            # Сборка для production
npm start                # Запуск production версии

# Database
npx prisma studio        # GUI для БД
npx prisma generate      # Генерация Prisma Client
npx prisma migrate dev   # Применить миграции

# Code Quality
npm run lint             # ESLint проверка
npm run test             # Playwright тесты
```

---

## 🌟 Особенности

### Автоматический расчет цен

```typescript
Окно 1400×1500 мм (Venus Design, PVC)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Площадь:  2.1 м²
База:     €250/м² × 2.1 = €525.00
Материал: PVC (×1.0) = €0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ИТОГО:    €525.00 ✅
```

### Multi-search с подсветкой

```
Поиск: "Иван +39" → Найдет по имени И телефону
```

### Конфигуратор продуктов

- Выбор категории → Поставщик → Параметры
- Визуализация CSS в реальном времени
- Автоматическая генерация описания

---

## 🤝 Вклад в проект

Проект находится в активной разработке. Для добавления новых функций:

1. Изучите [FINAL_DOCUMENTATION.md](./docs/FINAL_DOCUMENTATION.md)
2. Следуйте гайдам в [docs/guides/](./docs/guides/)
3. Создайте feature branch
4. Отправьте Pull Request

---

## 📄 Лицензия

Проект создан для внутреннего использования компании PUNTO INFISSI.

---

## 📞 Контакты

**Проект:** PUNTO INFISSI CRM  
**GitHub:** [github.com/YOUR_USERNAME/punto-infissi-crm](https://github.com/YOUR_USERNAME/punto-infissi-crm)

**Техническая поддержка:**  
📧 Email: support@punto-infissi.com  
📱 Telegram: @punto_infissi_support

---

**Система готова к использованию!** 🚀

_v1.0.0 - Октябрь 2025_

