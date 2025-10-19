# 🔍 АУДИТ РАЗДЕЛА КОНТРАГЕНТЫ - НЕПЕРЕВЕДЁННЫЕ ТЕКСТЫ

**Дата проверки:** 16 октября 2025  
**Проверяемые разделы:** Клиенты, Поставщики, Партнёры, Монтажники

---

## 📊 ОБЩАЯ СТАТИСТИКА

| Компонент              | Статус перевода | Непереведённых строк |
| ---------------------- | --------------- | -------------------- |
| **ClientFormModal**    | ✅ 100%         | 0                    |
| **SupplierFormModal**  | ✅ 100%         | 0                    |
| **PartnerFormModal**   | ✅ 100%         | 0                    |
| **InstallerFormModal** | ✅ 100%         | 0                    |
| **ClientsStickerV2**   | ✅ 100%         | 0                    |
| **Suppliers Page**     | ❌ 40%          | **18 строк**         |
| **Partners Page**      | ❌ Неизвестно   | Требует проверки     |
| **Installers Page**    | ❌ Неизвестно   | Требует проверки     |

---

## 🔴 SUPPLIERS PAGE - 18 непереведённых строк

### Файл: `src/app/suppliers/page.tsx`

#### 1. Комментарии (3 строки) - некритично

```typescript
39: // Загрузка поставщиков из API
59: // Множественная фильтрация
67: // Сортировка
```

**Решение:** Можно оставить как есть (комментарии для разработчиков)

---

#### 2. Alert сообщения (3 строки) - КРИТИЧНО

```typescript
92: alert('Ошибка при сохранении поставщика')
102: if (!confirm('Вы уверены, что хотите удалить этого поставщика?'))
109: alert('Ошибка при удалении поставщика')
```

**Решение:** Заменить на `t('errorSaving')`, `t('confirmDelete')`, `t('errorDeleting')`

---

#### 3. Навигация UnifiedNavV2 (4 строки) - КРИТИЧНО

```typescript
118: { id: 'clients', name: 'Клиенты', href: '/clients' },
121: name: 'Поставщики',
126: { id: 'partners', name: 'Партнеры', href: '/partners' },
127: { id: 'installers', name: 'Монтажники', href: '/installers' },
133: addButtonText='Добавить'
```

**Решение:**

```typescript
{ id: 'clients', name: t('clients'), href: '/clients' },
{ id: 'suppliers', name: t('suppliers'), href: '/suppliers', ... },
{ id: 'partners', name: t('partners'), href: '/partners' },
{ id: 'installers', name: t('installers'), href: '/installers' },
addButtonText={t('add')}
```

---

#### 4. Поиск (2 строки) - КРИТИЧНО

```typescript
146: {/* Поиск */}
151: placeholder='Поиск поставщиков...'
```

**Решение:**

```typescript
placeholder={t('searchSuppliers')}
```

---

#### 5. Заголовки таблицы (6 строк) - КРИТИЧНО

```typescript
167: Название {getSortIcon('name')}
175: Контактное лицо {getSortIcon('contact')}
178: Телефон
185: Статус {getSortIcon('status')}
188: Действия
273-277: (дубликат в старом коде)
```

**Решение:**

```typescript
{
	t('name')
}
{
	getSortIcon('name')
}
{
	t('contactPerson')
}
{
	getSortIcon('contact')
}
{
	t('phone')
}
{
	t('status')
}
{
	getSortIcon('status')
}
{
	t('actions')
}
```

---

#### 6. Badge статуса (1 строка) - КРИТИЧНО

```typescript
213: {supplier.status === 'active' ? 'Активен' : 'Неактивен'}
```

**Решение:**

```typescript
{
	supplier.status === 'active' ? t('activeStatus') : t('inactiveStatus')
}
```

---

#### 7. Старый неиспользуемый код (5 строк) - УДАЛИТЬ

```typescript
245-290: // Старый код (не используется)
```

**Решение:** Удалить весь блок старого кода

---

## 🔍 ПРОВЕРКА ДРУГИХ СТРАНИЦ

### Partners Page - требует проверки

Вероятные непереведённые тексты:

- Навигация
- Заголовки таблицы
- Alert сообщения
- Placeholder поиска
- Badge статусов

### Installers Page - требует проверки

Вероятные непереведённые тексты:

- Навигация
- Заголовки таблицы
- Alert сообщения
- Placeholder поиска
- Badge статусов

---

## 📋 ПЛАН ИСПРАВЛЕНИЯ

### Этап 1: Suppliers Page (10 минут)

1. ✅ Добавить `useLanguage()` hook
2. ✅ Заменить alerts на `t()`
3. ✅ Перевести навигацию
4. ✅ Перевести заголовки таблицы
5. ✅ Перевести Badge статусов
6. ✅ Перевести placeholder поиска
7. ✅ Удалить старый код

### Этап 2: Partners Page (8 минут)

1. Добавить `useLanguage()` hook
2. Применить те же изменения

### Этап 3: Installers Page (8 минут)

1. Добавить `useLanguage()` hook
2. Применить те же изменения

**Общее время:** ~25 минут

---

## 🎯 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ

После исправления:

- ✅ Suppliers Page: 100% перевод
- ✅ Partners Page: 100% перевод
- ✅ Installers Page: 100% перевод
- ✅ Полная локализация раздела "Контрагенты"

---

## ✨ ДОПОЛНИТЕЛЬНЫЕ НАХОДКИ

### Проверить также:

1. **Orders Page** - вероятно есть непереведённые тексты
2. **Settings Page** - точно есть непереведённые тексты
3. **Dashboard Page** - карточки статистики

---

## 📝 РЕКОМЕНДАЦИЯ

Начать с Suppliers Page как самой важной, затем Partners и Installers по тому же шаблону.

**Приступаем к исправлению?**
