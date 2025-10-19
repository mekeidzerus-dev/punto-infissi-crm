# 🖼️ Система управления фавиконом

## 📋 Обзор

Система позволяет динамически загружать и применять кастомный фавикон без перезагрузки приложения.

## 🏗️ Архитектура

### Компоненты:

1. **API Route** (`/app/api/favicon/route.ts`)

   - POST: Загрузка файла на сервер
   - DELETE: Удаление файла
   - Хранение: `public/custom-favicon.{ext}`

2. **FaviconUpdater** (`/components/favicon-updater.tsx`)

   - Client-side компонент
   - Управление `<link rel="icon">` в DOM
   - Синхронизация через localStorage + events

3. **Settings Page** (`/app/settings/page.tsx`)
   - UI для загрузки
   - Превью
   - Интеграция с API

## 🚀 Использование

### Для пользователей:

1. Перейти в `/settings`
2. Загрузить PNG/ICO/SVG файл (32x32 или 64x64 px)
3. Фавикон применится немедленно
4. Сохранится после перезагрузки

### Для разработчиков:

#### Проверка текущего фавикона:

```javascript
const path = localStorage.getItem('punto-infissi-favicon-path')
console.log('Текущий фавикон:', path || 'дефолтный')
```

#### Программное обновление:

```javascript
localStorage.setItem('punto-infissi-favicon-path', '/my-favicon.png')
window.dispatchEvent(new Event('favicon-updated'))
```

#### Сброс:

```javascript
localStorage.removeItem('punto-infissi-favicon-path')
window.dispatchEvent(new Event('favicon-updated'))
```

## ⚙️ Конфигурация

### Дефолтный фавикон:

- Путь: `public/default-favicon.ico`
- Используется, если кастомный не загружен

### Поддерживаемые форматы:

- PNG (рекомендуется)
- ICO
- SVG

### Хранение:

- **Файл**: `public/custom-favicon.{ext}`
- **Путь**: `localStorage['punto-infissi-favicon-path']`

## 🔒 Ограничения

### Текущие:

- ❌ Нет валидации размера файла
- ❌ Нет валидации типа файла на сервере
- ❌ Один файл для всех пользователей (глобальный)
- ❌ Локальное хранение (не подходит для serverless)

### Рекомендации для production:

#### 1. Валидация файла:

```typescript
// В /api/favicon/route.ts
const MAX_SIZE = 1024 * 1024 // 1MB
const ALLOWED_TYPES = ['image/png', 'image/x-icon', 'image/svg+xml']

if (file.size > MAX_SIZE) {
	return NextResponse.json(
		{ error: 'Файл слишком большой (макс 1MB)' },
		{ status: 400 }
	)
}

if (!ALLOWED_TYPES.includes(file.type)) {
	return NextResponse.json(
		{ error: 'Неподдерживаемый формат' },
		{ status: 400 }
	)
}
```

#### 2. Для multi-instance окружений (AWS, Vercel):

```typescript
// Использовать S3 или другой object storage
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({ region: process.env.AWS_REGION })

await s3.send(
	new PutObjectCommand({
		Bucket: process.env.S3_BUCKET,
		Key: `favicons/${fileName}`,
		Body: buffer,
		ContentType: file.type,
		ACL: 'public-read',
	})
)

const cdnUrl = `https://cdn.example.com/favicons/${fileName}`
```

#### 3. Для multi-tenant (разные фавиконы для разных пользователей):

```typescript
// Сохранять в БД с привязкой к организации/пользователю
await prisma.organizationSettings.update({
	where: { id: organizationId },
	data: { faviconUrl: cdnUrl },
})

// В FaviconUpdater загружать из API:
const { faviconUrl } = await fetch('/api/settings').then(r => r.json())
```

#### 4. Очистка старых файлов:

```typescript
// При загрузке нового файла удалять старый
const oldFiles = await readdir(publicPath)
const oldFavicons = oldFiles.filter(f => f.startsWith('custom-favicon.'))
for (const file of oldFavicons) {
	await unlink(join(publicPath, file))
}
```

#### 5. Версионирование через хеш:

```typescript
import crypto from 'crypto'

const hash = crypto.createHash('md5').update(buffer).digest('hex')
const fileName = `favicon-${hash.slice(0, 8)}.${ext}`

// Это предотвратит конфликты и позволит кешировать файлы навсегда
```

## 🧪 Тестирование

### Ручное:

1. Загрузить файл → проверить вкладку браузера
2. Перезагрузить страницу → фавикон остался
3. Сбросить → вернулся дефолтный
4. Открыть в новой вкладке → фавикон синхронизирован

### Автоматическое (для CI/CD):

```typescript
// tests/favicon.spec.ts
import { test, expect } from '@playwright/test'

test('favicon upload and persistence', async ({ page }) => {
	await page.goto('/settings')

	// Загрузка файла
	const fileInput = page.locator('input[type="file"]')
	await fileInput.setInputFiles('test-favicon.png')

	// Проверка применения
	await page.waitForSelector('img[alt="Favicon preview"]')
	const favicon = await page.locator('link[rel="icon"]').getAttribute('href')
	expect(favicon).toContain('/custom-favicon.png')

	// Перезагрузка
	await page.reload()
	const faviconAfterReload = await page
		.locator('link[rel="icon"]')
		.getAttribute('href')
	expect(faviconAfterReload).toContain('/custom-favicon.png')

	// Сброс
	await page.click('text=Сбросить фавикон')
	const faviconAfterReset = await page
		.locator('link[rel="icon"]')
		.getAttribute('href')
	expect(faviconAfterReset).toContain('/default-favicon.ico')
})
```

## 📝 Changelog

### v1.0.0 (текущая)

- ✅ Загрузка файла через API
- ✅ Динамическое применение без перезагрузки
- ✅ Сохранение после перезагрузки
- ✅ Сброс к дефолтному
- ✅ Превью в настройках
- ✅ Cache-busting через timestamp

### Планируется:

- [ ] Валидация размера и типа файла
- [ ] Интеграция с S3/CloudStorage
- [ ] Multi-tenant поддержка
- [ ] Версионирование файлов
- [ ] Автотесты
- [ ] Оптимизация изображений (сжатие)
- [ ] Поддержка разных размеров (16x16, 32x32, 64x64)

## 🔗 Связанные файлы

- `/app/api/favicon/route.ts` - API endpoint
- `/components/favicon-updater.tsx` - Client updater
- `/app/settings/page.tsx` - UI
- `/app/layout.tsx` - Integration point
- `/public/default-favicon.ico` - Default favicon

## 📞 Поддержка

При проблемах проверьте:

1. Консоль браузера на наличие ошибок
2. Кеш браузера (очистить и попробовать снова)
3. localStorage: `punto-infissi-favicon-path`
4. Файл существует в `public/`
5. Сервер перезапущен после изменений в `public/`
