# 🗄️ Настройка базы данных

**Дата:** 14 октября 2025  
**Статус:** ⚠️ Требуется настройка PostgreSQL

---

## 📋 Текущая ситуация

### **Проблема:**

PostgreSQL сервер не отвечает на порту `51214`

### **Файл .env содержит:**

```
DATABASE_URL="prisma+postgres://localhost:51213/..."
```

---

## 🔧 Решение 1: Запустить существующий PostgreSQL

### **Шаг 1: Проверить статус PostgreSQL**

```bash
# Проверить, запущен ли PostgreSQL
ps aux | grep postgres

# Или через Homebrew
brew services list | grep postgresql
```

### **Шаг 2: Запустить PostgreSQL**

```bash
# Если установлен через Homebrew
brew services start postgresql@15

# Или вручную
pg_ctl -D /usr/local/var/postgres start
```

### **Шаг 3: Выполнить миграции**

```bash
cd /Users/ruslanmekeidze/Desktop/mini-website/punto-infissi-crm

# Применить схему к базе
npx prisma db push

# Или создать миграцию
npx prisma migrate dev --name init

# Сгенерировать Prisma Client
npx prisma generate
```

---

## 🔧 Решение 2: Использовать Docker PostgreSQL

### **Запустить PostgreSQL в Docker:**

```bash
docker run --name punto-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=punto_infissi_crm \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### **Обновить .env:**

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/punto_infissi_crm?schema=public"
```

### **Выполнить миграции:**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 🔧 Решение 3: Использовать SQLite (для разработки)

### **Обновить prisma/schema.prisma:**

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### **Удалить типы PostgreSQL:**

- Заменить `@db.Text` → удалить
- Заменить `Decimal @db.Decimal(10, 2)` → `Float`
- Заменить `String[]` → `String` (через JSON)

### **Выполнить миграции:**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 📊 Обновленная Prisma схема

### **Новые модели:**

#### **Client (Клиенты)**

```prisma
model Client {
  id              Int      @id @default(autoincrement())
  type            String   @default("individual") // individual, company
  firstName       String?  // Имя
  lastName        String?  // Фамилия
  companyName     String?  // Название компании
  phone           String
  email           String?
  address         String?

  // Реквизиты
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

#### **Supplier (Поставщики)**

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

#### **Partner (Партнеры)**

```prisma
model Partner {
  id              Int      @id @default(autoincrement())
  name            String
  phone           String
  email           String?
  contactPerson   String?
  address         String?

  // Тип партнерства
  type            String?  // architect, agent, engineer...
  region          String?
  commission      Decimal? @db.Decimal(5, 2)

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

#### **Installer (Монтажники)**

```prisma
model Installer {
  id              Int      @id @default(autoincrement())
  type            String   @default("individual")
  name            String
  phone           String
  email           String?

  // Профессиональные данные
  specialization  String?
  experience      Int?
  hasTools        Boolean  @default(true)
  hasTransport    Boolean  @default(true)

  // Условия работы
  rateType        String?
  ratePrice       Decimal? @db.Decimal(10, 2)
  schedule        String?

  // Статус
  availability    String   @default("available")
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

#### **Dictionary (Справочники)**

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

## ✅ После запуска PostgreSQL

### **1. Выполните миграцию:**

```bash
npx prisma migrate dev --name add_dictionaries_and_update_clients
```

### **2. Сгенерируйте Prisma Client:**

```bash
npx prisma generate
```

### **3. Проверьте подключение:**

```bash
npx prisma db push
```

### **4. Откройте Prisma Studio:**

```bash
npx prisma studio
```

---

## 🚀 Следующие шаги

После настройки БД нужно:

1. ✅ Создать API роуты для клиентов
2. ✅ Создать API роуты для поставщиков
3. ✅ Создать API роуты для партнеров
4. ✅ Создать API роуты для монтажников
5. ✅ Создать API роуты для справочников
6. ✅ Подключить формы к API

---

## 📝 Как запустить PostgreSQL

### **Проверить статус:**

```bash
# Через Homebrew
brew services list

# Через systemctl (Linux)
sudo systemctl status postgresql

# Проверить процесс
ps aux | grep postgres
```

### **Запустить:**

```bash
# Через Homebrew
brew services start postgresql@15

# Или вручную
pg_ctl -D /usr/local/var/postgres start
```

---

_Дайте знать, когда PostgreSQL будет запущен, и я продолжу!_
