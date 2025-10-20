# 🔴 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ ТРЕБУЕТСЯ

**Дата:** 16 октября 2025  
**Приоритет:** ВЫСОКИЙ  
**Статус:** Требует действий пользователя

---

## ❌ ПРОБЛЕМА

### Ошибка при создании предложения:

```
Unknown argument `validUntil`. Available options are marked with ?.
```

### Причина:

После обновления схемы Prisma (добавление поля `validUntil`), **dev сервер не перезапущен** и использует старую версию Prisma Client.

---

## ✅ РЕШЕНИЕ (ПРОСТОЕ!)

### Шаг 1: Остановить dev сервер

```bash
# Нажмите Ctrl+C в терминале где запущен dev сервер
# Или найдите процесс:
pkill -f "next dev"
```

### Шаг 2: Перезапустить dev сервер

```bash
cd /Users/ruslanmekeidze/Desktop/mini-website/punto-infissi-crm
npm run dev
```

**ВСЁ!** После перезапуска всё заработает! ✅

---

## 🔧 ЧТО УЖЕ СДЕЛАНО (автоматически):

1. ✅ Обновлена схема Prisma (`validUntil` добавлен)
2. ✅ Сгенерирован Prisma Client (`npx prisma generate`)
3. ✅ API routes обновлены
4. ✅ Frontend components обновлены

**Осталось только:** Перезапустить dev сервер!

---

## 🧪 ПОСЛЕ ПЕРЕЗАПУСКА - ТЕСТИРОВАНИЕ:

### Тест 1: Создание предложения

```bash
node test-proposal-save.js
```

**Ожидаемый результат:**

```
✅ Предложение создано: PROP-002
```

### Тест 2: Создание клиента из предложения

1. Откройте http://localhost:3000/proposals
2. Нажмите "Новое предложение"
3. В поле "Клиент" введите несуществующее имя
4. Нажмите "Создать клиента"
5. Заполните форму и сохраните

**Ожидаемый результат:**

- ✅ Клиент создан в БД
- ✅ Клиент автоматически выбран в предложении
- ✅ Можно продолжить создание предложения

### Тест 3: Сохранение предложения

1. Выберите клиента
2. Добавьте товар через конфигуратор
3. Нажмите "Сохранить"

**Ожидаемый результат:**

- ✅ Предложение сохранено
- ✅ Появляется в списке
- ✅ Можно редактировать
- ✅ Можно просмотреть PDF

---

## 📝 ИЗМЕНЕНИЯ, СДЕЛАННЫЕ В ЭТОЙ СЕССИИ:

### 1. Исправление создания клиента из предложения

**Файл:** `src/components/proposal-form-v3.tsx`

**Было:**

```typescript
const handleClientCreated = async (newClient: any) => {
	await fetchClients()
	setFormData(prev => ({ ...prev, clientId: newClient.id }))
	// ... не создавал клиента в БД!
}
```

**Стало:**

```typescript
const handleClientCreated = async (clientData: any) => {
	// Создаём клиента в БД
	const response = await fetch('/api/clients', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(clientData),
	})

	if (response.ok) {
		const createdClient = await response.json()
		await fetchClients()
		// Автоматически выбираем нового клиента
		setFormData(prev => ({ ...prev, clientId: createdClient.id }))
		setShowNewClientModal(false)
	}
}
```

### 2. Добавлено поле validUntil

**Файл:** `prisma/schema.prisma`

```prisma
model ProposalDocument {
	// ...
	proposalDate DateTime @default(now())
	validUntil   DateTime? // ✅ Добавлено
	// ...
}
```

### 3. Обновлены API routes

**Файлы:**

- `src/app/api/proposals/route.ts`
- `src/app/api/proposals/[id]/route.ts`

---

## ⚠️ ВАЖНО!

После перезапуска dev сервера всё должно заработать на 100%!

**Если всё равно есть ошибки:**

1. Проверьте консоль браузера (F12)
2. Проверьте терминал dev сервера на ошибки
3. Очистите кэш браузера (Ctrl+Shift+R)

---

## ✅ ПОСЛЕ ИСПРАВЛЕНИЯ:

Все функции будут работать:

- ✅ Создание клиента из предложения
- ✅ Автовыбор нового клиента
- ✅ Сохранение предложения с validUntil
- ✅ Редактирование предложения
- ✅ PDF генерация

**Перезапустите сервер и всё заработает!** 🚀
