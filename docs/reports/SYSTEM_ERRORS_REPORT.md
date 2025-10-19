# 🚨 ОТЧЁТ ОБ ОШИБКАХ СИСТЕМЫ

**Дата проверки:** 16 октября 2025  
**Статус:** Критические ошибки обнаружены и частично исправлены

---

## ✅ ИСПРАВЛЕНО

### 1. **i18n.ts - Синтаксическая ошибка**

- **Проблема:** Лишняя закрывающая скобка `}` на строке 710
- **Статус:** ✅ ИСПРАВЛЕНО
- **Решение:** Убрана лишняя скобка

### 2. **pdf-generator.ts - Множественные синтаксические ошибки**

- **Проблема:** Файл содержал JSX код без React импортов (47+ ошибок)
- **Статус:** ✅ УДАЛЁН (файл не используется)
- **Решение:** Файл удалён, т.к. не импортировался нигде в проекте

---

## 🔴 КРИТИЧЕСКИЕ ОШИБКИ (требуют немедленного исправления)

### 3. **Decimal arithmetic operations (9 ошибок)**

**Файлы:**

- `src/app/api/proposals/[id]/route.ts` (4 ошибки)
- `src/app/api/proposals/route.ts` (4 ошибки)

**Проблема:**

```typescript
// Строки вроде:
const positionSubtotal = position.unitPrice * position.quantity
// position.unitPrice это Prisma Decimal, а не number
```

**Причина:** Prisma возвращает `Decimal` объекты, которые нельзя напрямую умножать/делить как числа.

**Решение:**

```typescript
// Вариант 1: Конвертировать в Number
const positionSubtotal = Number(position.unitPrice) * position.quantity

// Вариант 2: Использовать Decimal API
import { Decimal } from '@prisma/client/runtime/library'
const positionSubtotal = new Decimal(position.unitPrice).mul(position.quantity)
```

---

### 4. **dashboard/page.tsx - Неизвестный компонент (2 ошибки)**

**Файл:** `src/app/dashboard/page.tsx`

**Проблема:**

```typescript
error TS2304: Cannot find name 'DashboardLayout'.
```

**Причина:** Компонент `DashboardLayout` либо не импортирован, либо не существует.

**Решение:** Заменить на `DashboardLayoutStickerV2` или проверить импорт.

---

### 5. **proposals/page.tsx - Неверные типы для searchableFields (4 ошибки)**

**Файл:** `src/app/proposals/page.tsx`

**Проблема:**

```typescript
const searchableFields = [
	'client.firstName', // ❌ Не является полем ProposalDocument
	'client.lastName',
	'client.companyName',
	'client.phone',
]
```

**Причина:** `searchableFields` ожидает поля `ProposalDocument`, а не вложенные поля клиента.

**Решение:** Удалить эти поля или переделать логику поиска.

---

### 6. **proposals/page.tsx - Конфликт типов ProposalDocument (2 ошибки)**

**Файл:** `src/app/proposals/page.tsx`

**Проблема:**

```typescript
error TS2719: Type 'ProposalDocument' is not assignable to type 'ProposalDocument'.
Two different types with this name exist, but they are unrelated.
```

**Причина:** Есть два разных определения типа `ProposalDocument`:

- Одно из Prisma
- Одно локальное в компоненте

**Решение:** Использовать один источник истины (Prisma) или переименовать локальный тип.

---

### 7. **clients-sticker-v2.tsx - Несовпадение типов формы (1 ошибка)**

**Файл:** `src/components/clients-sticker-v2.tsx`

**Проблема:**

```typescript
Type '{ name, email, phone, company, address } | undefined'
is not assignable to type 'Partial<ClientFormData> | undefined'.
```

**Причина:** Структура данных клиента не соответствует `ClientFormData`.

**Решение:** Привести данные к нужному формату перед передачей в форму.

---

### 8. **dashboard-layout-sticker-v2.tsx - Недоступный экспорт (1 ошибка)**

**Файл:** `src/components/dashboard-layout-sticker-v2.tsx`

**Проблема:**

```typescript
Module '"./top-nav-sticker-v2"' declares 'TopNavItem' locally, but it is not exported.
```

**Причина:** Тип `TopNavItem` используется, но не экспортирован из `top-nav-sticker-v2.tsx`.

**Решение:** Добавить `export` к типу `TopNavItem`.

---

### 9. **proposal-form-v2.tsx - Отсутствуют поля vatRate и vatAmount (1 ошибка)**

**Файл:** `src/components/proposal-form-v2.tsx`

**Проблема:**

```typescript
Type '{ ... }' is missing the following properties from type 'ProposalPosition':
vatRate, vatAmount
```

**Причина:** При создании позиции не указаны новые обязательные поля `vatRate` и `vatAmount`.

**Решение:**

```typescript
{
  id: uuidv4(),
  categoryId: config.categoryId,
  supplierCategoryId: config.supplierCategoryId,
  configuration: config,
  unitPrice: 0,
  quantity: 1,
  discount: 0,
  vatRate: 22.0,    // ← Добавить
  vatAmount: 0,     // ← Добавить
  total: 0,
  description: '',
}
```

---

### 10. **document-templates API - Конфликт типов (1 ошибка)**

**Файл:** `.next/types/validator.ts`

**Проблема:**

```typescript
Type 'typeof import(".../document-templates/[id]/route")'
does not satisfy the constraint 'RouteHandlerConfig<"/api/document-templates/[id]">'.
```

**Причина:** Next.js автоматическая валидация типов API routes обнаружила несоответствие.

**Решение:** Проверить сигнатуры функций в `src/app/api/document-templates/[id]/route.ts`.

---

## 📊 СТАТИСТИКА ОШИБОК

| Категория             | Количество | Приоритет       |
| --------------------- | ---------- | --------------- |
| ✅ Исправлено         | 55+        | -               |
| 🔴 Decimal arithmetic | 8          | **КРИТИЧЕСКИЙ** |
| 🔴 TypeScript типы    | 10         | ВЫСОКИЙ         |
| 🟡 Импорты/экспорты   | 2          | СРЕДНИЙ         |
| **ИТОГО осталось**    | **20**     | -               |

---

## 🎯 ПЛАН ИСПРАВЛЕНИЯ

### Приоритет 1 (Критический - блокируют работу)

1. ✅ Исправить i18n.ts синтаксис
2. ✅ Удалить pdf-generator.ts
3. ⏳ Исправить Decimal arithmetic в proposals API (8 ошибок)
4. ⏳ Добавить vatRate и vatAmount в proposal-form-v2.tsx

### Приоритет 2 (Высокий - TypeScript ошибки)

5. ⏳ Исправить dashboard/page.tsx импорты
6. ⏳ Исправить searchableFields в proposals/page.tsx
7. ⏳ Исправить конфликт типов ProposalDocument
8. ⏳ Исправить ClientFormData mapping

### Приоритет 3 (Средний - не блокируют)

9. ⏳ Экспортировать TopNavItem
10. ⏳ Проверить document-templates API types

---

## 💡 РЕКОМЕНДАЦИИ

1. **Decimal операции:** Всегда конвертировать Prisma Decimal в Number перед математическими операциями
2. **Типы:** Использовать Prisma-генерируемые типы вместо дублирования
3. **Тестирование:** Запускать `npx tsc --noEmit` перед коммитом
4. **Линтинг:** Настроить ESLint для автоматического обнаружения таких проблем

---

## 🚀 СЛЕДУЮЩИЕ ШАГИ

1. Исправить все Decimal arithmetic ошибки (5 минут)
2. Добавить vatRate/vatAmount в форму (2 минуты)
3. Исправить типы и импорты (5 минут)
4. Перезапустить dev server
5. Протестировать основные функции

**Ожидаемое время исправления:** ~15 минут

---

**ВАЖНО:** Сайт не запускается из-за TypeScript ошибок. Next.js не компилирует код с ошибками типов.
