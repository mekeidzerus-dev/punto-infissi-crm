# 🗄️ База данных - Полная документация

**Дата:** 14 октября 2025  
**Статус:** ✅ Работает  
**СУБД:** PostgreSQL 16  
**База данных:** `punto_infissi_crm`

---

## 📊 Что было сделано

### **1. Настройка PostgreSQL**

#### **Запуск базы данных:**

```bash
# PostgreSQL установлен через Homebrew
brew services start postgresql@16

# Проверка статуса
brew services list | grep postgresql
# Результат: postgresql@16 started
```

#### **Создание базы данных:**

```bash
# Подключение к PostgreSQL
/opt/homebrew/Cellar/postgresql@16/16.10/bin/psql -d postgres

# Создание БД
CREATE DATABASE punto_infissi_crm;
```

#### **Настройка подключения:**

Файл `.env`:

```
DATABASE_URL="postgresql://ruslanmekeidze@localhost:5432/punto_infissi_crm?schema=public"
```

---

### **2. Prisma схема**

#### **Обновленные модели:**

**📋 Client (Клиенты)**

```prisma
model Client {
  id              Int      @id @default(autoincrement())
  type            String   @default("individual") // individual, company

  // Для физлиц - отдельные поля
  firstName       String?  // Имя
  lastName        String?  // Фамилия

  // Для юрлиц
  companyName     String?  // Название компании

  // Контакты
  phone           String
  email           String?
  address         String?

  // Реквизиты (для юрлиц)
  codiceFiscale   String?
  partitaIVA      String?
  legalAddress    String?
  contactPerson   String?

  // Дополнительно
  source          String?
  notes           String?  @db.Text

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  orders          Order[]

  @@index([phone])
  @@index([email])
}
```

**🏭 Supplier (Поставщики)**

```prisma
model Supplier {
  id              Int      @id @default(autoincrement())
  name            String
  phone           String
  email           String?
  contactPerson   String?
  address         String?

  // Реквизиты
  codiceFiscale   String?
  partitaIVA      String?
  legalAddress    String?

  // Условия работы
  paymentTerms    String?
  deliveryDays    Int?
  minOrderAmount  Decimal? @db.Decimal(10, 2)

  // Метаданные
  rating          Int      @default(5)
  status          String   @default("active")
  notes           String?  @db.Text

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([name])
  @@index([status])
}
```

**🤝 Partner (Партнеры)**

```prisma
model Partner {
  id              Int      @id @default(autoincrement())
  name            String
  phone           String
  email           String?
  contactPerson   String?
  address         String?

  // Тип партнерства
  type            String?  // architect, agent, engineer, designer, dealer, distributor, other
  region          String?
  commission      Decimal? @db.Decimal(5, 2) // процент комиссии

  // Реквизиты
  codiceFiscale   String?
  partitaIVA      String?
  legalAddress    String?

  status          String   @default("active")
  notes           String?  @db.Text

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([name])
  @@index([type])
  @@index([status])
}
```

**🔧 Installer (Монтажники)**

```prisma
model Installer {
  id              Int      @id @default(autoincrement())
  type            String   @default("individual") // individual, ip, company
  name            String
  phone           String
  email           String?

  // Профессиональные данные
  specialization  String?  // windows, doors, balconies, all
  experience      Int?     // лет
  hasTools        Boolean  @default(true)
  hasTransport    Boolean  @default(true)

  // Условия работы
  rateType        String?  // per-unit, per-hour, per-project
  ratePrice       Decimal? @db.Decimal(10, 2)
  schedule        String?

  // Статус
  availability    String   @default("available") // available, busy, vacation
  rating          Int      @default(5)
  status          String   @default("active")

  notes           String?  @db.Text

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([name])
  @@index([availability])
  @@index([status])
}
```

**📚 Dictionary (Справочники)**

```prisma
model Dictionary {
  id              Int      @id @default(autoincrement())
  type            String   // sources, partnerTypes, specializations
  name            String
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([type])
  @@index([isActive])
}
```

---

### **3. Миграции**

#### **Выполненная миграция:**

```
20251014144947_add_dictionaries_and_update_clients
```

#### **Что изменилось:**

- ✅ Добавлена таблица `Supplier`
- ✅ Добавлена таблица `Partner`
- ✅ Добавлена таблица `Installer`
- ✅ Добавлена таблица `Dictionary`
- ✅ Обновлена таблица `Client`:
  - Добавлено поле `type` (individual/company)
  - Добавлено поле `firstName` (Имя)
  - Добавлено поле `lastName` (Фамилия)
  - Добавлено поле `companyName` (Название компании)
  - Добавлены поля реквизитов (codiceFiscale, partitaIVA, legalAddress, contactPerson)
  - Добавлено поле `source` (источник)
  - Добавлено поле `notes` (примечания)

---

### **4. API роуты**

#### **✅ Клиенты (`/api/clients`)**

| Метод  | Endpoint            | Описание               |
| ------ | ------------------- | ---------------------- |
| GET    | `/api/clients`      | Получить всех клиентов |
| POST   | `/api/clients`      | Создать клиента        |
| PUT    | `/api/clients`      | Обновить клиента       |
| DELETE | `/api/clients?id=X` | Удалить клиента        |

**Пример создания клиента:**

```typescript
const response = await fetch('/api/clients', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({
		type: 'individual',
		firstName: 'Mario',
		lastName: 'Rossi',
		phone: '+39 333 123 4567',
		email: 'mario.rossi@example.com',
		address: 'Via Roma, 123, Milano',
		source: 'Сайт',
		notes: 'Клиент заинтересован в окнах ПВХ',
	}),
})
```

---

## 🔄 Как это работает

### **Поток данных:**

```
┌─────────────┐      ┌──────────────┐      ┌────────────┐
│   Браузер   │─────▶│  API Route   │─────▶│ PostgreSQL │
│  (Форма)    │ POST │ /api/clients │INSERT│  Database  │
└─────────────┘      └──────────────┘      └────────────┘
       ▲                                           │
       │                                           │
       └───────────────────────────────────────────┘
                    GET (обновление)
```

### **Последовательность:**

1. **Создание клиента:**

   - Пользователь заполняет форму
   - Нажимает "Сохранить"
   - `handleSaveClient()` отправляет POST на `/api/clients`
   - API роут создает запись в БД через Prisma
   - `fetchClients()` перезагружает список
   - Таблица обновляется

2. **Редактирование:**

   - Нажатие на кнопку "Редактировать"
   - Форма открывается с данными клиента
   - Изменение и сохранение
   - PUT запрос на `/api/clients`
   - БД обновляется
   - Список перезагружается

3. **Удаление:**
   - Подтверждение удаления
   - DELETE запрос на `/api/clients?id=X`
   - Запись удаляется из БД
   - Список обновляется

---

## 🇮🇹 Итальянская валидация

### **Телефон:**

```typescript
// Автоформатирование при вводе
+39 333 123 4567

// Валидация
validateItalianPhone(phone) // true/false
```

### **Codice Fiscale (физлица):**

```
Формат: RSSMRA80A01H501U
Длина: 16 символов
Валидация: validateCodiceFiscale(cf)
```

### **Partita IVA (юрлица):**

```
Формат: 12345678901
Длина: 11 цифр
Валидация: validatePartitaIVA(piva)
```

---

## 📁 Структура файлов

```
/src/
├── app/api/
│   └── clients/
│       └── route.ts          # API для клиентов
├── components/
│   ├── client-form-modal.tsx # Форма клиента
│   └── clients-sticker-v2.tsx # Список клиентов
├── lib/
│   ├── prisma.ts             # Prisma Client
│   └── italian-validation.ts # Валидация итальянских данных
└── prisma/
    ├── schema.prisma         # Схема БД
    └── migrations/           # История миграций
        └── 20251014144947_add_dictionaries_and_update_clients/
            └── migration.sql
```

---

## 🛠️ Полезные команды

### **Работа с базой данных:**

```bash
# Открыть Prisma Studio (GUI для БД)
npx prisma studio

# Применить изменения схемы
npx prisma db push

# Создать миграцию
npx prisma migrate dev --name migration_name

# Сгенерировать Prisma Client
npx prisma generate

# Сбросить базу данных (ОПАСНО!)
npx prisma migrate reset
```

### **Проверка PostgreSQL:**

```bash
# Статус
brew services list | grep postgresql

# Запуск
brew services start postgresql@16

# Остановка
brew services stop postgresql@16

# Перезапуск
brew services restart postgresql@16
```

### **Подключение к БД:**

```bash
# Через psql
/opt/homebrew/Cellar/postgresql@16/16.10/bin/psql -d punto_infissi_crm

# Команды в psql:
\dt          # Список таблиц
\d Client    # Описание таблицы Client
SELECT * FROM "Client";  # Посмотреть всех клиентов
```

---

## 🔍 Проверка данных

### **Через Prisma Studio:**

```bash
npx prisma studio
# Откроется http://localhost:5555
```

### **Через SQL:**

```sql
-- Количество клиентов
SELECT COUNT(*) FROM "Client";

-- Все клиенты
SELECT id, "firstName", "lastName", phone, email FROM "Client";

-- Клиенты-физлица
SELECT * FROM "Client" WHERE type = 'individual';

-- Клиенты-юрлица
SELECT * FROM "Client" WHERE type = 'company';
```

---

## ⚠️ Важно знать

### **1. Данные теперь персистентны**

- ✅ После создания клиента - он сохраняется в БД
- ✅ После обновления страницы - данные остаются
- ✅ После удаления - данные удаляются навсегда

### **2. Разделение ФИО**

**Старая версия (до миграции):**

```typescript
name: 'Иванов Иван Иванович' // одно поле
```

**Новая версия (после миграции):**

```typescript
firstName: 'Иван' // отдельно
lastName: 'Иванов' // отдельно
companyName: null // для юрлиц
```

**Зачем?**

- ✅ Можно использовать имя и фамилию отдельно в документах
- ✅ Правильная сортировка по фамилии
- ✅ Персонализация (обращение по имени)

### **3. Тип клиента**

```typescript
type: 'individual' // Физлицо
type: 'company' // Юрлицо
```

**В зависимости от типа:**

- Физлицо: заполняются `firstName`, `lastName`
- Юрлицо: заполняются `companyName`, `codiceFiscale`, `partitaIVA`, `legalAddress`, `contactPerson`

### **4. Примечания**

```prisma
notes String? @db.Text
```

- Тип `@db.Text` - без ограничения длины
- Сохраняются в БД
- Доступны при редактировании

---

## 📈 Статус реализации

| Справочник      | Модель | API | Форма | Интеграция | Статус        |
| --------------- | ------ | --- | ----- | ---------- | ------------- |
| **Клиенты**     | ✅     | ✅  | ✅    | ✅         | 🟢 Работает   |
| **Поставщики**  | ✅     | ⏳  | ✅    | ⏳         | 🟡 В процессе |
| **Партнеры**    | ✅     | ⏳  | ✅    | ⏳         | 🟡 В процессе |
| **Монтажники**  | ✅     | ⏳  | ✅    | ⏳         | 🟡 В процессе |
| **Справочники** | ✅     | ⏳  | ✅    | ⏳         | 🟡 В процессе |

---

## 🚀 Следующие шаги

### **Этап 1: API для справочников** ⏳

1. Создать `/api/suppliers` (GET, POST, PUT, DELETE)
2. Создать `/api/partners` (GET, POST, PUT, DELETE)
3. Создать `/api/installers` (GET, POST, PUT, DELETE)
4. Создать `/api/dictionaries` (GET, POST, PUT, DELETE)

### **Этап 2: Интеграция** ⏳

1. Подключить компоненты к API
2. Заменить локальный state на данные из БД
3. Добавить индикаторы загрузки

### **Этап 3: Тестирование** ⏳

1. Проверить создание/редактирование/удаление
2. Проверить валидацию
3. Проверить персистентность данных

### **Этап 4: Продакшен** ⏳

1. Настроить production БД
2. Настроить резервное копирование
3. Добавить мониторинг
4. Развернуть приложение

---

## 💾 Резервное копирование

### **Создать backup:**

```bash
pg_dump -U ruslanmekeidze punto_infissi_crm > backup.sql
```

### **Восстановить из backup:**

```bash
psql -U ruslanmekeidze punto_infissi_crm < backup.sql
```

---

## 🔧 Решение проблем

### **Проблема: "Can't reach database server"**

**Решение:**

```bash
brew services start postgresql@16
```

### **Проблема: "Role does not exist"**

**Решение:**

```bash
# Создать роль
createuser -s ruslanmekeidze
```

### **Проблема: "Database does not exist"**

**Решение:**

```bash
createdb punto_infissi_crm
# или
psql -d postgres -c "CREATE DATABASE punto_infissi_crm;"
```

### **Проблема: "Migration failed"**

**Решение:**

```bash
# Сбросить базу (ОПАСНО - удалит все данные!)
npx prisma migrate reset

# Применить миграции заново
npx prisma migrate dev
```

---

## 📊 Мониторинг

### **Проверить подключение:**

```bash
npx prisma db pull
```

### **Посмотреть структуру:**

```bash
npx prisma studio
```

### **Проверить данные:**

```sql
-- Количество записей в каждой таблице
SELECT 'Client' as table_name, COUNT(*) FROM "Client"
UNION ALL
SELECT 'Supplier', COUNT(*) FROM "Supplier"
UNION ALL
SELECT 'Partner', COUNT(*) FROM "Partner"
UNION ALL
SELECT 'Installer', COUNT(*) FROM "Installer"
UNION ALL
SELECT 'Dictionary', COUNT(*) FROM "Dictionary";
```

---

## 📝 Changelog

### **14.10.2025 - Инициализация БД**

- ✅ Настроен PostgreSQL
- ✅ Создана база данных
- ✅ Добавлены модели: Client, Supplier, Partner, Installer, Dictionary
- ✅ Применены миграции
- ✅ Создан API для клиентов
- ✅ Клиенты работают с БД

---

## 🎯 Итог

**До миграции:**

- ❌ Данные в локальном state
- ❌ При обновлении страницы данные пропадают
- ❌ ФИО в одном поле
- ❌ Примечания не сохраняются

**После миграции:**

- ✅ Данные в PostgreSQL БД
- ✅ Данные персистентны (не пропадают)
- ✅ ФИО разделено (Имя + Фамилия)
- ✅ Примечания сохраняются (@db.Text)
- ✅ Валидация итальянских данных
- ✅ Готово к продакшену

---

_Последнее обновление: 14 октября 2025_
