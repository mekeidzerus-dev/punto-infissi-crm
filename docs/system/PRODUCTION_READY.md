# 🚀 Production-Ready Favicon System

## ✅ Что было добавлено

### 1. Валидация файлов (`/src/lib/favicon-validation.ts`)

```typescript
- ✅ Проверка размера файла (макс 2MB)
- ✅ Проверка MIME типа (PNG, ICO, SVG)
- ✅ Проверка расширения файла
- ✅ Проверка dimensions через sharp (мин 16px, макс 512px)
- ✅ Детальная метаинформация
```

**Пример использования:**

```typescript
import { validateFaviconBuffer } from '@/lib/favicon-validation'

const validation = await validateFaviconBuffer(buffer, file.type, file.name)
if (!validation.valid) {
	console.error(validation.error)
}
```

---

### 2. Версионирование через MD5 хеш (`/src/lib/favicon-storage.ts`)

```typescript
- ✅ Генерация уникального хеша для каждого файла
- ✅ Имя файла: favicon-{hash}.{ext}
- ✅ Автоматическая дедупликация (одинаковые файлы не дублируются)
- ✅ Очистка старых версий
- ✅ Оптимизация хранилища (keepCount)
```

**Структура файлов:**

```
public/
  favicon-a1b2c3d4e5f6.png  ← текущий
  favicon-9876543210ab.png  ← старый (будет удален)
  default-favicon.ico       ← дефолтный
```

---

### 3. Rate Limiting (`/src/lib/rate-limiter.ts`)

```typescript
- ✅ In-memory rate limiting
- ✅ 5 загрузок за 15 минут
- ✅ 10 удалений за 15 минут
- ✅ HTTP заголовки: X-RateLimit-*
- ✅ HTTP 429 при превышении лимита
```

**Лимиты:**

- `FAVICON_UPLOAD`: 5 запросов / 15 минут
- `FAVICON_DELETE`: 10 запросов / 15 минут
- `API_GENERAL`: 100 запросов / 1 минута

**Для production с Redis:**

```typescript
// Замените in-memory limiter на Redis
import Redis from 'ioredis'
const redis = new Redis(process.env.REDIS_URL)
```

---

### 4. Multi-Tenant поддержка (Prisma Schema)

```prisma
model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  faviconUrl  String?
  logoUrl     String?
  settings    OrganizationSettings?
  users       User[]
}

model OrganizationSettings {
  faviconFileHash   String?
  faviconFileName   String?
  faviconSize       Int?
  faviconWidth      Int?
  faviconHeight     Int?
  faviconUpdatedAt  DateTime?
  faviconUpdatedBy  String?
}
```

**Миграция:**

```bash
cd punto-infissi-crm
npx prisma migrate dev --name add-organization-settings
npx prisma generate
```

---

### 5. Cloud Storage интеграция (`/src/lib/cloud-storage.ts`)

```typescript
- ✅ AWS S3 поддержка
- ✅ CloudFlare R2 поддержка
- ✅ CDN интеграция
- ✅ Fallback на локальное хранилище
```

**Настройка (`.env`):**

```bash
CLOUD_STORAGE_ENABLED=true
CLOUD_STORAGE_PROVIDER=s3  # или r2
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET=your-bucket
CDN_URL=https://cdn.example.com
```

**Использование:**

```typescript
import { uploadToCloudStorage } from '@/lib/cloud-storage'

const result = await uploadToCloudStorage(buffer, fileName, contentType)
if (result.success) {
	console.log('URL:', result.url)
}
```

---

### 6. Автотесты Playwright (`/tests/favicon.spec.ts`)

```typescript
- ✅ 9 тестов для favicon системы
- ✅ Тестирование загрузки файла
- ✅ Тестирование persistence после reload
- ✅ Тестирование сброса к дефолтному
- ✅ Тестирование валидации
- ✅ Тестирование rate limiting
- ✅ Тестирование multi-tab синхронизации
```

**Запуск тестов:**

```bash
# Все тесты
npm test

# С UI
npm run test:ui

# Только favicon тесты
npm run test:favicon

# Отчет
npm run test:report
```

---

## 📋 Обновленная архитектура

```
┌─────────────────────────────────────────────────────────┐
│                 PRODUCTION FAVICON SYSTEM               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CLIENT                                                 │
│  ├─ Settings Page                                       │
│  │   ├─ File input                                      │
│  │   ├─ Preview                                         │
│  │   └─ Reset button                                    │
│  │                                                      │
│  └─ FaviconUpdater                                      │
│      ├─ localStorage integration                        │
│      ├─ Event listeners                                 │
│      └─ DOM manipulation                                │
│                                                         │
│  ──────────────────────────────────────────────────    │
│                                                         │
│  SERVER                                                 │
│  ├─ API Route (/api/favicon)                            │
│  │   ├─ Rate Limiting                                   │
│  │   ├─ Validation (size, type, dimensions)            │
│  │   ├─ MD5 Hashing                                     │
│  │   ├─ Storage (local или cloud)                       │
│  │   └─ Cleanup old versions                            │
│  │                                                      │
│  ├─ Validation Library                                  │
│  │   └─ Sharp для проверки dimensions                   │
│  │                                                      │
│  ├─ Storage Library                                     │
│  │   ├─ saveFaviconFile()                               │
│  │   ├─ cleanupOldFavicons()                            │
│  │   └─ optimizeFaviconStorage()                        │
│  │                                                      │
│  ├─ Cloud Storage (optional)                            │
│  │   ├─ S3 Client                                       │
│  │   ├─ R2 Client                                       │
│  │   └─ CDN integration                                 │
│  │                                                      │
│  └─ Database (Prisma)                                   │
│      ├─ Organization                                    │
│      └─ OrganizationSettings                            │
│          └─ Favicon metadata                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Установка и настройка

### 1. Установите зависимости:

```bash
cd punto-infissi-crm
npm install
```

**Уже установлены:**

- `sharp` - обработка изображений
- `crypto-js` - хеширование
- `@prisma/client` - ORM
- `@playwright/test` - тестирование

**Опционально (для S3):**

```bash
npm install @aws-sdk/client-s3
```

### 2. Настройте базу данных:

```bash
npx prisma migrate dev
npx prisma generate
```

### 3. Запустите сервер:

```bash
npm run dev
```

### 4. Запустите тесты:

```bash
# Установите браузеры для Playwright (один раз)
npx playwright install

# Запустите тесты
npm test
```

---

## 🎯 Использование

### Загрузка фавикона:

1. Перейдите на `/settings`
2. Нажмите "Загрузить фавикон"
3. Выберите PNG/ICO/SVG файл (мин 16px, макс 512px, до 2MB)
4. Фавикон применится немедленно
5. Файл сохранится с уникальным хешем: `favicon-{hash}.png`

### Сброс фавикона:

1. Нажмите "Сбросить фавикон"
2. Вернется дефолтный `/default-favicon.ico`

### Programmatic API:

```typescript
// Загрузка через API
const formData = new FormData()
formData.append('file', file)

const response = await fetch('/api/favicon', {
	method: 'POST',
	body: formData,
})

const data = await response.json()
// data.path - путь к файлу
// data.metadata - метаданные (hash, size, dimensions)

// Удаление через API
await fetch('/api/favicon', { method: 'DELETE' })
```

---

## 🚨 Миграция на Cloud Storage

### Шаг 1: Настройте AWS S3 / CloudFlare R2

```bash
# Создайте bucket
aws s3 mb s3://your-favicon-bucket

# Настройте CORS
aws s3api put-bucket-cors --bucket your-favicon-bucket --cors-configuration file://cors.json
```

**cors.json:**

```json
{
	"CORSRules": [
		{
			"AllowedOrigins": ["*"],
			"AllowedMethods": ["GET"],
			"AllowedHeaders": ["*"],
			"MaxAgeSeconds": 3600
		}
	]
}
```

### Шаг 2: Обновите `.env`

```bash
CLOUD_STORAGE_ENABLED=true
CLOUD_STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET=your-favicon-bucket
CDN_URL=https://d123456.cloudfront.net
```

### Шаг 3: Установите SDK

```bash
npm install @aws-sdk/client-s3
```

### Шаг 4: Тестируйте

```typescript
import { testCloudStorageConnection } from '@/lib/cloud-storage'

const result = await testCloudStorageConnection()
console.log(result.success) // true/false
```

---

## 📊 Мониторинг

### Rate Limiting Headers:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1234567890
Retry-After: 60
```

### Логи:

```typescript
// Сервер автоматически логирует:
console.log('Фавикон сохранен: favicon-abc123.png (hash: abc123)')
console.log('Очистка завершена: сохранено 3, удалено 2')
console.log('Удалено 5 фавиконов, ошибок: 0')
```

### Ошибки:

```typescript
// Валидация
{ error: "Файл слишком большой. Максимальный размер: 2MB" }
{ error: "Изображение слишком маленькое. Минимум: 16x16px" }

// Rate Limiting
{ error: "Слишком много запросов. Попробуйте через 60 сек.", retryAfter: 60 }

// Storage
{ error: "Не удалось сохранить файл на сервере" }
```

---

## 🧪 Тестирование

### Ручное тестирование:

```bash
# 1. Загрузка маленького файла (10KB PNG)
curl -X POST http://localhost:3000/api/favicon \
  -F "file=@test-favicon.png" \
  -H "X-Forwarded-For: 1.2.3.4"

# 2. Проверка rate limiting (6 раз подряд)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/favicon \
    -F "file=@test-favicon.png" \
    -H "X-Forwarded-For: 1.2.3.4"
done

# 3. Удаление
curl -X DELETE http://localhost:3000/api/favicon \
  -H "X-Forwarded-For: 1.2.3.4"
```

### Автоматическое тестирование:

```bash
# Все тесты
npm test

# С UI (интерактивно)
npm run test:ui

# Только favicon тесты
npm run test:favicon

# В headless режиме
npm test -- --headed

# Отчет
npm run test:report
```

---

## 📈 Производительность

### Оптимизация:

1. **Хеширование**: Одинаковые файлы не дублируются
2. **Очистка**: Автоматическое удаление старых версий
3. **Cache-busting**: Timestamp в URL для обхода кеша
4. **CDN**: Интеграция с CloudFront/CloudFlare
5. **Compression**: Используйте `sharp` для сжатия

### Пример сжатия:

```typescript
import sharp from 'sharp'

const optimized = await sharp(buffer)
	.resize(32, 32)
	.png({ compressionLevel: 9 })
	.toBuffer()
```

---

## 🔐 Безопасность

### Реализовано:

- ✅ Валидация MIME типа
- ✅ Проверка расширения файла
- ✅ Ограничение размера файла
- ✅ Rate limiting
- ✅ Проверка dimensions через sharp

### Рекомендации:

1. **Используйте HTTPS** в production
2. **Настройте CSP** заголовки
3. **Включите CORS** только для нужных доменов
4. **Добавьте аутентификацию** перед загрузкой
5. **Используйте Redis** для rate limiting

---

## 🎓 Документация

- [Основная документация](./FAVICON_SYSTEM.md)
- [Prisma Schema](./prisma/schema.prisma)
- [Playwright Tests](./tests/favicon.spec.ts)
- [API Documentation](./src/app/api/favicon/route.ts)

---

## 🙌 Готово!

Все 7 задач выполнены:

- ✅ Валидация файлов (размер, тип, dimensions)
- ✅ Версионирование через MD5 хеш
- ✅ Очистка старых файлов
- ✅ Rate limiting на API
- ✅ Prisma схема для multi-tenant
- ✅ Cloud Storage интеграция (S3/R2)
- ✅ Автотесты (Playwright)

**Система готова к production!** 🚀


