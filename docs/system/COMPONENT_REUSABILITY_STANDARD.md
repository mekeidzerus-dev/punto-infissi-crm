# 🔄 Стандарт переиспользования компонентов

**Версия:** 1.0  
**Дата создания:** 13 октября 2025

---

## 🎯 Основной принцип

**Один компонент = Одна функция = Много мест использования**

Каждый стандартный элемент (кнопка, поиск, форма) должен быть **универсальным** и использоваться **везде**, где это логично, но выполнять **разные функции** в зависимости от контекста.

---

## 🔘 Стандартные компоненты

### **1. Кнопка "Добавить"**

#### **Где используется:**

- ✅ Клиенты → Добавить клиента
- ✅ Поставщики → Добавить поставщика
- ✅ Партнеры → Добавить партнера
- ✅ Монтажники → Добавить монтажника
- ✅ Продукты → Добавить продукт
- ✅ Заказы → Добавить заказ
- ✅ Предложения → Добавить предложение
- ✅ Справочники → Добавить элемент

#### **Реализация:**

**Вариант 1: В UnifiedNavV2 (рекомендуется)**

```tsx
<UnifiedNavV2
  items={[...]}
  onAddClick={() => setIsFormOpen(true)}
  addButtonText='Добавить'
/>
```

**Вариант 2: Отдельная кнопка**

```tsx
<Button onClick={() => setIsFormOpen(true)} className='sticker-btn-primary-v2'>
	<Plus className='h-4 w-4 mr-2' />
	Добавить
</Button>
```

#### **Стиль:**

- Класс: `sticker-btn-primary-v2`
- Иконка: `Plus` (lucide-react)
- Размер иконки: `h-4 w-4`
- Отступ: `mr-2` (между иконкой и текстом)

---

### **2. Поиск**

#### **Где используется:**

- ✅ Все разделы со списками
- ✅ Модальные окна выбора (ClientPicker, ProductPicker)
- ✅ Справочники

#### **Реализация:**

```tsx
<div className='mb-4'>
	<div className='relative'>
		<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
		<Input
			placeholder='Поиск...'
			value={searchTerm}
			onChange={e => setSearchTerm(e.target.value)}
			className='pl-10 bg-gray-50 border-gray-200 rounded-xl'
		/>
	</div>
</div>
```

#### **Стиль:**

- Иконка слева: `absolute left-3`
- Padding слева: `pl-10`
- Фон: `bg-gray-50`
- Скругление: `rounded-xl`

---

### **3. Модальная форма**

#### **Где используется:**

- ✅ Создание/редактирование клиентов
- ✅ Создание/редактирование поставщиков
- ✅ Создание/редактирование партнеров
- ✅ Создание/редактирование монтажников
- ✅ Создание/редактирование продуктов
- ✅ Создание/редактирование элементов справочников

#### **Структура:**

```tsx
<Dialog open={isOpen} onOpenChange={onClose}>
	<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
		<DialogHeader>
			<DialogTitle>Создать/Редактировать</DialogTitle>
			<DialogDescription>Описание</DialogDescription>
		</DialogHeader>

		<div className='space-y-4 py-4'>
			{/* Тумблер (опционально) */}
			{/* Единая сетка */}
			<div className='sticker-card-v2 p-4'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-3'>
					{/* Поля */}
				</div>
			</div>
		</div>

		<div className='flex justify-end gap-2 pt-4 border-t'>
			<Button variant='outline' onClick={onClose}>
				Отмена
			</Button>
			<Button className='sticker-btn-primary-v2'>Сохранить</Button>
		</div>
	</DialogContent>
</Dialog>
```

---

### **4. Таблица со списком**

#### **Где используется:**

- ✅ Все разделы со списками
- ✅ Справочники

#### **Структура:**

```tsx
<div className='content-sticker-v2'>
	{/* Поиск */}
	<div className='mb-4'>...</div>

	{/* Таблица */}
	<Table>
		<TableHeader>
			<TableRow>
				<TableHead
					className='cursor-pointer'
					onClick={() => requestSort('name')}
				>
					<div className='flex items-center gap-1'>
						Название {getSortIcon('name')}
					</div>
				</TableHead>
				<TableHead className='text-right'>Действия</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{sortedItems.map(item => (
				<TableRow key={item.id}>
					<TableCell>{highlightText(item.name, searchTerm)}</TableCell>
					<TableCell className='text-right'>
						<Button variant='ghost' size='sm' onClick={() => handleEdit(item)}>
							<Edit className='h-4 w-4' />
						</Button>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => handleDelete(item.id)}
						>
							<Trash2 className='h-4 w-4 text-red-600' />
						</Button>
					</TableCell>
				</TableRow>
			))}
		</TableBody>
	</Table>
</div>
```

---

### **5. Кнопки действий (Редактировать/Удалить)**

#### **Где используется:**

- ✅ Все таблицы со списками

#### **Реализация:**

```tsx
<div className='flex justify-end gap-2'>
	<Button variant='ghost' size='sm' onClick={() => handleEdit(item)}>
		<Edit className='h-4 w-4' />
	</Button>
	<Button variant='ghost' size='sm' onClick={() => handleDelete(item.id)}>
		<Trash2 className='h-4 w-4 text-red-600' />
	</Button>
</div>
```

#### **Стиль:**

- Вариант: `ghost` (прозрачный фон)
- Размер: `sm` (маленький)
- Иконка удаления: `text-red-600` (красная)

---

### **6. UnifiedNavV2 (Объединенная навигация)**

#### **Где используется:**

- ✅ Клиенты
- ✅ Поставщики
- ✅ Партнеры
- ✅ Монтажники

#### **Реализация:**

```tsx
<UnifiedNavV2
	items={[
		{
			id: 'clients',
			name: 'Клиенты',
			href: '/clients',
			icon: Users,
			count: 10,
		},
		{ id: 'suppliers', name: 'Поставщики', href: '/suppliers' },
		{ id: 'partners', name: 'Партнеры', href: '/partners' },
		{ id: 'installers', name: 'Монтажники', href: '/installers' },
	]}
	onAddClick={() => setIsFormOpen(true)}
	addButtonText='Добавить'
/>
```

#### **Особенности:**

- Автоматически определяет активную вкладку
- Встроенная кнопка "Добавить"
- Счетчик элементов (опционально)

---

## 📦 Паттерн интеграции формы

### **Шаблон для любого раздела:**

```tsx
'use client'

import { useState } from 'react'
import { DashboardLayoutStickerV2 } from '@/components/dashboard-layout-sticker-v2'
import { UnifiedNavV2 } from '@/components/unified-nav-v2'
import { [Entity]FormModal } from '@/components/[entity]-form-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, ... } from '@/components/ui/table'
import { Search, Edit, Trash2, [Icon] } from 'lucide-react'
import { highlightText } from '@/lib/highlight-text'
import { multiSearch } from '@/lib/multi-search'
import { useSorting } from '@/hooks/use-sorting'

export default function [Entity]Page() {
  const [items, setItems] = useState([...])
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  // Множественный поиск
  const filteredItems = multiSearch(items, searchTerm, ['name', 'phone', 'email'])

  // Сортировка
  const { sortedItems, requestSort, getSortIcon } = useSorting(filteredItems, 'name')

  const handleSave = (formData) => {
    if (editingItem) {
      // Редактирование
      setItems(items.map(item =>
        item.id === editingItem.id ? { ...item, ...formData } : item
      ))
    } else {
      // Создание
      const newItem = {
        id: Math.max(...items.map(i => i.id), 0) + 1,
        ...formData,
        createdAt: new Date().toISOString(),
      }
      setItems([...items, newItem])
    }
    setEditingItem(null)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const handleDelete = (id) => {
    if (!confirm('Удалить?')) return
    setItems(items.filter(item => item.id !== id))
  }

  return (
    <DashboardLayoutStickerV2 hideTopNav={true}>
      <div className='space-y-4'>
        {/* Навигация с кнопкой "Добавить" */}
        <UnifiedNavV2
          items={[...]}
          onAddClick={() => {
            setEditingItem(null)
            setIsFormOpen(true)
          }}
          addButtonText='Добавить'
        />

        {/* Форма */}
        <[Entity]FormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false)
            setEditingItem(null)
          }}
          onSave={handleSave}
          initialData={editingItem}
        />

        {/* Контент */}
        <div className='content-sticker-v2'>
          {/* Поиск */}
          <div className='mb-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <Input
                placeholder='Поиск...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-10 bg-gray-50 border-gray-200 rounded-xl'
              />
            </div>
          </div>

          {/* Таблица */}
          <Table>
            {/* ... */}
          </Table>
        </div>
      </div>
    </DashboardLayoutStickerV2>
  )
}
```

---

## 🎯 Стандартные элементы

### **1. Кнопка "Добавить"**

**Стандарт:**

- Всегда в `UnifiedNavV2`
- Всегда справа
- Всегда открывает модальную форму
- Всегда сбрасывает `editingItem` в `null`

**Код:**

```tsx
onAddClick={() => {
  setEditingItem(null)
  setIsFormOpen(true)
}}
```

---

### **2. Кнопки "Редактировать" и "Удалить"**

**Стандарт:**

- Всегда в последней колонке таблицы
- Всегда `variant='ghost' size='sm'`
- Удалить всегда красная: `text-red-600`

**Код:**

```tsx
<TableCell className='text-right'>
	<div className='flex justify-end gap-2'>
		<Button variant='ghost' size='sm' onClick={() => handleEdit(item)}>
			<Edit className='h-4 w-4' />
		</Button>
		<Button variant='ghost' size='sm' onClick={() => handleDelete(item.id)}>
			<Trash2 className='h-4 w-4 text-red-600' />
		</Button>
	</div>
</TableCell>
```

---

### **3. Поиск**

**Стандарт:**

- Всегда над таблицей
- Всегда с иконкой `Search` слева
- Всегда использует `multiSearch`
- Всегда с подсветкой `highlightText`

**Код:**

```tsx
// State
const [searchTerm, setSearchTerm] = useState('')

// Фильтрация
const filteredItems = multiSearch(items, searchTerm, ['name', 'phone', 'email'])

// UI
<div className='mb-4'>
  <div className='relative'>
    <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
    <Input
      placeholder='Поиск...'
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      className='pl-10 bg-gray-50 border-gray-200 rounded-xl'
    />
  </div>
</div>
```

---

### **4. Сортировка**

**Стандарт:**

- Всегда в заголовках таблицы
- Всегда с иконкой направления (↑↓↕️)
- Всегда `cursor-pointer`

**Код:**

```tsx
// Hook
const { sortedItems, requestSort, getSortIcon } = useSorting(filteredItems, 'name')

// UI
<TableHead className='cursor-pointer' onClick={() => requestSort('name')}>
  <div className='flex items-center gap-1'>
    Название {getSortIcon('name')}
  </div>
</TableHead>
```

---

### **5. Модальная форма**

**Стандарт:**

- Всегда `max-w-4xl`
- Всегда двухколоночная сетка
- Всегда с валидацией
- Всегда с кнопками "Отмена" и "Сохранить"

**Код:**

```tsx
<[Entity]FormModal
  isOpen={isFormOpen}
  onClose={() => {
    setIsFormOpen(false)
    setEditingItem(null)
  }}
  onSave={handleSave}
  initialData={editingItem}
/>
```

---

## 🔄 Логика работы

### **Создание:**

```tsx
onAddClick={() => {
  setEditingItem(null)      // Сброс редактирования
  setIsFormOpen(true)       // Открыть форму
}}
```

### **Редактирование:**

```tsx
const handleEdit = item => {
	setEditingItem(item) // Установить редактируемый элемент
	setIsFormOpen(true) // Открыть форму
}
```

### **Сохранение:**

```tsx
const handleSave = formData => {
	if (editingItem) {
		// Редактирование
		setItems(
			items.map(item =>
				item.id === editingItem.id ? { ...item, ...formData } : item
			)
		)
	} else {
		// Создание
		const newItem = {
			id: Math.max(...items.map(i => i.id), 0) + 1,
			...formData,
			createdAt: new Date().toISOString(),
		}
		setItems([...items, newItem])
	}
	setEditingItem(null)
}
```

### **Удаление:**

```tsx
const handleDelete = id => {
	if (!confirm('Вы уверены, что хотите удалить?')) return
	setItems(items.filter(item => item.id !== id))
}
```

---

## 📋 Обязательные хуки и утилиты

### **Для каждого раздела со списком:**

```tsx
import { useState } from 'react'
import { highlightText } from '@/lib/highlight-text'
import { multiSearch } from '@/lib/multi-search'
import { useSorting } from '@/hooks/use-sorting'

// State
const [items, setItems] = useState([])
const [searchTerm, setSearchTerm] = useState('')
const [isFormOpen, setIsFormOpen] = useState(false)
const [editingItem, setEditingItem] = useState(null)

// Поиск
const filteredItems = multiSearch(items, searchTerm, ['name', 'phone', 'email'])

// Сортировка
const { sortedItems, requestSort, getSortIcon } = useSorting(
	filteredItems,
	'name'
)
```

---

## 🎨 Стандартные классы

### **Кнопки:**

- Основная: `sticker-btn-primary-v2`
- Отмена: `variant='outline'`
- Действия: `variant='ghost' size='sm'`

### **Карточки:**

- Основная: `sticker-card-v2`
- С padding: `sticker-card-v2 p-4`
- Контент: `content-sticker-v2`

### **Сетка:**

- Адаптивная: `grid grid-cols-1 lg:grid-cols-2`
- Отступы: `gap-x-4 gap-y-3`
- На всю ширину: `lg:col-span-2`

---

## 📂 Структура файлов

### **Компоненты форм:**

```
/src/components/
  ├── client-form-modal.tsx
  ├── supplier-form-modal.tsx
  ├── partner-form-modal.tsx
  ├── installer-form-modal.tsx
  └── [entity]-form-modal.tsx
```

### **Страницы разделов:**

```
/src/app/
  ├── clients/page.tsx
  ├── suppliers/page.tsx
  ├── partners/page.tsx
  ├── installers/page.tsx
  └── [entity]/page.tsx
```

---

## ✅ Чек-лист интеграции

При добавлении формы в раздел проверьте:

- [ ] Импортирован `[Entity]FormModal`
- [ ] Добавлен `const [isFormOpen, setIsFormOpen] = useState(false)`
- [ ] Добавлен `const [editingItem, setEditingItem] = useState(null)`
- [ ] `UnifiedNavV2` имеет `onAddClick`
- [ ] Реализован `handleSave`
- [ ] Реализован `handleEdit`
- [ ] Реализован `handleDelete`
- [ ] Форма передает `initialData={editingItem}`
- [ ] Кнопки редактирования в таблице работают

---

## 🚀 Примеры использования

### **Пример 1: Интеграция в Suppliers**

```tsx
import { SupplierFormModal } from '@/components/supplier-form-modal'

export default function SuppliersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)

  return (
    <DashboardLayoutStickerV2 hideTopNav={true}>
      <UnifiedNavV2
        items={[...]}
        onAddClick={() => {
          setEditingSupplier(null)
          setIsFormOpen(true)
        }}
        addButtonText='Добавить'
      />

      <SupplierFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingSupplier(null)
        }}
        onSave={handleSaveSupplier}
        initialData={editingSupplier}
      />

      {/* Таблица */}
    </DashboardLayoutStickerV2>
  )
}
```

---

## 🎯 Преимущества стандартизации

### **Для разработчика:**

- ✅ Быстрая разработка (копируй-вставь)
- ✅ Единый код для всех разделов
- ✅ Легкое обслуживание
- ✅ Меньше ошибок

### **Для пользователя:**

- ✅ Привычный интерфейс везде
- ✅ Не нужно переучиваться
- ✅ Быстрая работа
- ✅ Меньше ошибок ввода

---

## 📝 Правила

### **ВСЕГДА:**

- ✅ Используйте `UnifiedNavV2` для кнопки "Добавить"
- ✅ Используйте `multiSearch` для поиска
- ✅ Используйте `useSorting` для сортировки
- ✅ Используйте `highlightText` для подсветки
- ✅ Используйте стандартные классы (`sticker-btn-primary-v2`)

### **НИКОГДА:**

- ❌ Не создавайте отдельные кнопки "Добавить" вне `UnifiedNavV2`
- ❌ Не используйте разные стили для одинаковых элементов
- ❌ Не дублируйте код - переиспользуйте компоненты
- ❌ Не нарушайте структуру формы (двухколоночная сетка)

---

_Этот стандарт обязателен для всех новых компонентов._  
_Последнее обновление: 13 октября 2025_
