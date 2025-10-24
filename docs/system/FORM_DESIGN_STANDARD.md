# 📋 Стандарт дизайна форм

**Версия:** 1.0  
**Дата создания:** 13 октября 2025  
**Базовая форма:** Карточка клиента

---

## 🎯 Основные принципы

### **1. Минимализм**

- ❌ Никаких лишних заголовков и разделителей
- ❌ Никаких Label над полями
- ✅ Только placeholder внутри полей
- ✅ Чистый, лаконичный дизайн

### **2. Идеальное выравнивание**

- ✅ Единая сетка для всех полей
- ✅ Все поля на одной линии (как конструктор)
- ✅ Одинаковая высота всех элементов
- ✅ Равные отступы между строками

### **3. Компактность**

- ✅ Всё на одном экране (минимум прокрутки)
- ✅ Экономия времени сотрудника
- ✅ Быстрое заполнение

### **4. Адаптивность**

- ✅ Desktop (≥1024px): 2 колонки
- ✅ Mobile (<1024px): 1 колонка
- ✅ Автоматическая перестройка

---

## 📐 Структура формы

### **Базовая структура:**

```tsx
<Dialog open={isOpen} onOpenChange={onClose}>
	<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
		<DialogHeader>
			<DialogTitle>Создать/Редактировать</DialogTitle>
			<DialogDescription>Описание формы</DialogDescription>
		</DialogHeader>

		<div className='space-y-4 py-4'>
			{/* Тумблер (если нужен) */}
			<div className='flex items-center justify-center gap-4 p-3 bg-gray-50 rounded-lg'>
				<button>Вариант 1</button>
				<div className='h-6 w-px bg-gray-300' />
				<button>Вариант 2</button>
			</div>

			{/* ЕДИНАЯ СЕТКА */}
			<div className='sticker-card-v2 p-4'>
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-3'>
					{/* Поля формы */}
					<div>
						<Input placeholder='Поле 1 *' />
					</div>
					<div>
						<Input placeholder='Поле 2 *' />
					</div>
					<div>
						<Input placeholder='Поле 3' />
					</div>
					<div>
						<Input placeholder='Поле 4' />
					</div>

					{/* Примечания - на всю ширину */}
					<div className='lg:col-span-2'>
						<Textarea placeholder='Примечания' rows={3} />
					</div>
				</div>
			</div>
		</div>

		{/* Кнопки */}
		<div className='flex justify-end gap-2 pt-4 border-t'>
			<Button variant='outline'>Отмена</Button>
			<Button className='sticker-btn-primary-v2'>Сохранить</Button>
		</div>
	</DialogContent>
</Dialog>
```

---

## 🎨 Визуальные параметры

### **Размеры:**

- **Ширина модального окна:** `max-w-4xl` (896px)
- **Максимальная высота:** `max-h-[90vh]` (90% высоты экрана)
- **Padding карточки:** `p-4` (16px)
- **Отступы между полями:**
  - Горизонтальные: `gap-x-4` (16px)
  - Вертикальные: `gap-y-3` (12px)

### **Сетка:**

- **Desktop:** `lg:grid-cols-2` (2 колонки)
- **Mobile:** `grid-cols-1` (1 колонка)
- **Примечания:** `lg:col-span-2` (на всю ширину)

### **Поля ввода:**

- **Placeholder:** Название поля + `*` для обязательных
- **Примеры:**
  - `placeholder='ФИО *'`
  - `placeholder='Телефон *'`
  - `placeholder='Email'`
  - `placeholder='Адрес'`

### **Цвета:**

- **Основной фон:** белый
- **Тумблер активный:** `bg-green-600 text-white`
- **Тумблер неактивный:** `bg-white text-gray-600`
- **Условные блоки (юрлицо):** `bg-blue-50 border-blue-200`
- **Ошибки:** `border-red-500`, `text-red-600`

---

## 🔧 Компоненты

### **Обязательные импорты:**

```tsx
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
```

---

## 📝 Правила именования

### **Компоненты форм:**

- `ClientFormModal` - форма клиента
- `SupplierFormModal` - форма поставщика
- `PartnerFormModal` - форма партнера
- `InstallerFormModal` - форма монтажника

### **Props интерфейсы:**

```tsx
interface FormModalProps {
	isOpen: boolean
	onClose: () => void
	onSave: (data: FormData) => void
	initialData?: Partial<FormData>
}
```

---

## 🎯 Обязательные элементы

### **1. Тумблер (если нужен выбор типа):**

```tsx
<div className='flex items-center justify-center gap-4 p-3 bg-gray-50 rounded-lg'>
	<button
		type='button'
		onClick={() => setFormData({ ...formData, type: 'option1' })}
		className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
			formData.type === 'option1'
				? 'bg-green-600 text-white shadow-md'
				: 'bg-white text-gray-600 hover:bg-gray-100'
		}`}
	>
		<Icon className='h-4 w-4' />
		Вариант 1
	</button>
	<div className='h-6 w-px bg-gray-300' />
	<button>Вариант 2</button>
</div>
```

### **2. Единая сетка:**

```tsx
<div className='sticker-card-v2 p-4'>
	<div className='grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-3'>
		{/* Поля */}
	</div>
</div>
```

### **3. Поля ввода:**

```tsx
<div>
	<Input
		id='fieldName'
		value={formData.fieldName}
		onChange={e => setFormData({ ...formData, fieldName: e.target.value })}
		placeholder='Название поля *'
		className={errors.fieldName ? 'border-red-500' : ''}
	/>
	{errors.fieldName && (
		<p className='text-xs text-red-600 mt-1'>{errors.fieldName}</p>
	)}
</div>
```

### **4. Примечания (всегда внизу):**

```tsx
<div className='lg:col-span-2'>
	<Textarea
		id='notes'
		value={formData.notes}
		onChange={e => setFormData({ ...formData, notes: e.target.value })}
		placeholder='Примечания'
		rows={3}
		className='resize-none'
	/>
</div>
```

### **5. Кнопки:**

```tsx
<div className='flex justify-end gap-2 pt-4 border-t'>
	<Button variant='outline' onClick={onClose}>
		Отмена
	</Button>
	<Button onClick={handleSubmit} className='sticker-btn-primary-v2'>
		Сохранить
	</Button>
</div>
```

---

## ✅ Валидация

### **Обязательные поля:**

```tsx
const validate = (): boolean => {
	const newErrors: Record<string, string> = {}

	if (!formData.name.trim()) {
		newErrors.name = 'Обязательное поле'
	}

	if (!formData.phone.trim()) {
		newErrors.phone = 'Обязательное поле'
	}

	// Email (если заполнен)
	if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
		newErrors.email = 'Неверный формат email'
	}

	setErrors(newErrors)
	return Object.keys(newErrors).length === 0
}
```

---

## 🇮🇹 Итальянская специфика

### **Валюта:**

- ✅ Всегда использовать **€ (EUR)**
- ❌ Никогда не использовать рубли (₽)

### **Реквизиты:**

| Тип     | Поле           | Формат                      |
| ------- | -------------- | --------------------------- |
| Физлицо | Codice Fiscale | 16 символов (буквы + цифры) |
| Юрлицо  | Partita IVA    | 11 цифр                     |

### **Телефон:**

- Формат: `+39 xxx xxx xxxx`
- Пример: `+39 333 123 4567`

### **Адрес:**

- Формат: `Via/Piazza [название], [номер], [город]`
- Пример: `Via Roma, 123, Milano`

---

## 📦 Структура полей по разделам

### **👤 КЛИЕНТЫ:**

```
Строка 1: ФИО/Название * | Телефон *
Строка 2: Email | Адрес
Строка 3 (юрлицо): Codice Fiscale | Partita IVA
Строка 4 (юрлицо): Юр. адрес | Контакт. лицо
Строка 5: Источник | (пусто)
Строка 6: Примечания (на всю ширину)
```

### **🏭 ПОСТАВЩИКИ:**

```
Строка 1: Название * | Телефон *
Строка 2: Email | Контакт. лицо
Строка 3: Адрес | Codice Fiscale
Строка 4: Partita IVA | Юр. адрес
Строка 5: Условия оплаты | Срок поставки (дней)
Строка 6: Мин. сумма заказа | Рейтинг
Строка 7: Статус | (пусто)
Строка 8: Примечания (на всю ширину)
```

### **🤝 ПАРТНЕРЫ:**

```
Строка 1: Название * | Телефон *
Строка 2: Email | Контакт. лицо
Строка 3: Адрес | Тип партнера
Строка 4: Регион работы | Процент комиссии (%)
Строка 5: Codice Fiscale | Partita IVA
Строка 6: Юр. адрес | Статус
Строка 7: Примечания (на всю ширину)
```

### **🔧 МОНТАЖНИКИ:**

```
Строка 1: ФИО/Название * | Телефон *
Строка 2: Email | Тип (Физлицо/ИП/Компания)
Строка 3: Специализация | Опыт работы (лет)
Строка 4: Инструмент | Транспорт
Строка 5: Тариф | Цена (€)
Строка 6: График работы | Доступность
Строка 7: Рейтинг | Статус
Строка 8: Примечания (на всю ширину)
```

---

## 🎨 Визуальные стандарты

### **Отступы:**

- **Внешние:** `space-y-4` (16px)
- **Внутри карточки:** `p-4` (16px)
- **Между полями:**
  - Горизонтальные: `gap-x-4` (16px)
  - Вертикальные: `gap-y-3` (12px)

### **Размеры:**

- **Модальное окно:** `max-w-4xl` (896px)
- **Высота:** `max-h-[90vh]`
- **Input высота:** стандартная (40px)
- **Textarea строки:** 3 (для примечаний)

### **Шрифты:**

- **Заголовок:** `text-lg font-semibold`
- **Описание:** `text-sm text-gray-600`
- **Placeholder:** `text-sm text-gray-400`
- **Ошибки:** `text-xs text-red-600`

### **Цвета:**

- **Активный элемент:** `bg-green-600 text-white`
- **Неактивный элемент:** `bg-white text-gray-600`
- **Условные блоки:** `bg-blue-50 border-blue-200`
- **Ошибки:** `border-red-500`
- **Акценты:** только красный и зеленый

---

## 🔄 Условные поля

### **Правило:**

Если поля зависят от выбора (например, тип клиента), используйте условный рендеринг:

```tsx
{
	formData.type === 'company' && (
		<>
			<div>
				<Input placeholder='Codice Fiscale' />
			</div>
			<div>
				<Input placeholder='Partita IVA' />
			</div>
		</>
	)
}
```

### **Выравнивание:**

- Условные поля **встраиваются** в общую сетку
- Не создают отдельные блоки
- Появляются **на тех же линиях**, где должны быть

---

## 📱 Адаптивность

### **Breakpoints:**

```css
/* Mobile: < 1024px */
grid-cols-1

/* Desktop: ≥ 1024px */
lg:grid-cols-2
```

### **Правила:**

1. На мобильных все поля в **1 колонку**
2. На десктопе поля в **2 колонки**
3. Примечания **всегда** на всю ширину (`lg:col-span-2`)

---

## 🚫 Что НЕ использовать

### **Запрещено:**

- ❌ Label над полями (только placeholder)
- ❌ Заголовки блоков ("Основная информация", "Реквизиты")
- ❌ Иконки внутри полей
- ❌ Accordion/Collapsible (всё всегда видно)
- ❌ Разные размеры полей в одной строке
- ❌ Лишние отступы и padding
- ❌ Анимации и transition (кроме тумблера)

### **Исключения:**

- ✅ Тумблер может иметь `transition-all` для плавного переключения
- ✅ Кнопки могут иметь `hover:bg-gray-100`

---

## 🔍 Интеграция со справочниками

### **Dropdown из справочника:**

```tsx
// Загрузка из localStorage
const [sources, setSources] = useState([])

useEffect(() => {
  const saved = localStorage.getItem('dictionary_sources')
  if (saved) {
    const allSources = JSON.parse(saved)
    setSources(allSources.filter(s => s.isActive))
  }
}, [isOpen])

// Использование
<Select value={formData.source} onValueChange={...}>
  <SelectTrigger>
    <SelectValue placeholder='Источник' />
  </SelectTrigger>
  <SelectContent>
    {sources.map(source => (
      <SelectItem key={source.id} value={source.name}>
        {source.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

---

## ✅ Чек-лист для новой формы

Перед созданием новой формы проверьте:

- [ ] Ширина модального окна: `max-w-4xl`
- [ ] Единая сетка: `grid-cols-1 lg:grid-cols-2`
- [ ] Отступы: `gap-x-4 gap-y-3`
- [ ] Placeholder вместо Label
- [ ] Примечания внизу: `lg:col-span-2`
- [ ] Валидация обязательных полей
- [ ] Адаптивность для мобильных
- [ ] Итальянская локализация (€, Codice Fiscale, Partita IVA)
- [ ] Интеграция со справочниками (если нужно)
- [ ] Кнопки: Отмена + Сохранить

---

## 📊 Примеры реализации

### **Пример 1: Простая форма (без условных полей)**

```tsx
<div className='grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-3'>
	<div>
		<Input placeholder='Название *' />
	</div>
	<div>
		<Input placeholder='Телефон *' />
	</div>
	<div>
		<Input placeholder='Email' />
	</div>
	<div>
		<Input placeholder='Адрес' />
	</div>
	<div className='lg:col-span-2'>
		<Textarea placeholder='Примечания' rows={3} />
	</div>
</div>
```

### **Пример 2: Форма с условными полями**

```tsx
<div className='grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-3'>
	{/* Основные поля */}
	<div>
		<Input placeholder='Название *' />
	</div>
	<div>
		<Input placeholder='Телефон *' />
	</div>

	{/* Условные поля */}
	{type === 'company' && (
		<>
			<div>
				<Input placeholder='Codice Fiscale' />
			</div>
			<div>
				<Input placeholder='Partita IVA' />
			</div>
		</>
	)}

	{/* Примечания */}
	<div className='lg:col-span-2'>
		<Textarea placeholder='Примечания' rows={3} />
	</div>
</div>
```

---

## 🎯 Лучшие практики

### **1. Порядок полей:**

1. **Обязательные** поля вверху (имя, телефон)
2. **Важные** поля в середине (email, адрес)
3. **Дополнительные** поля ниже
4. **Примечания** всегда внизу

### **2. Группировка:**

- Логически связанные поля **рядом** (ФИО + Телефон)
- Реквизиты **вместе** (Codice Fiscale + Partita IVA)
- Условия работы **вместе** (Тариф + Цена)

### **3. Симметрия:**

- Если в строке 1 поле - добавить пустую ячейку `<div></div>`
- Примечания всегда `lg:col-span-2`
- Все поля одинаковой высоты

---

## 🚀 Применение стандарта

### **Шаг 1: Создать компонент**

Скопировать `ClientFormModal` как шаблон

### **Шаг 2: Адаптировать поля**

Заменить поля согласно структуре раздела

### **Шаг 3: Интегрировать**

Добавить в страницу раздела

### **Шаг 4: Тестировать**

- Проверить на desktop (2 колонки)
- Проверить на mobile (1 колонка)
- Проверить валидацию

---

---

## 🎨 СПЕЦИАЛЬНАЯ ФОРМА: КОНФИГУРАТОР ПРОДУКТОВ V2

### **📋 Особенности:**

Форма конфигуратора имеет уникальный дизайн с левой панелью навигации по шагам.

### **📐 Структура (LOCKED 🔒):**

```
┌─────────────────────────────────────────────────────────┐
│  [← Назад]                                     [X]      │  ← Тонкая панель навигации
├──────────────┬──────────────────────────────────────────┤
│  LEFT PANEL  │         CONTENT AREA                     │
│  (w-56)      │         (flex-1, ml-4)                   │
│              │                                          │
│  ┌────────┐  │  Seleziona categoria     [Button]        │
│  │Categoria│  │                                          │
│  │rounded-md│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐          │
│  │bg-blue-50│  │  │ □  │ │ □  │ │ □  │ │ □  │          │
│  └────────┘  │  │ icon │ │icon│ │icon│ │icon│          │
│              │  │ name │ │name│ │name│ │name│          │
│  (rounded-md)│  │  0│0  │ │ 0│0│ │ 0│0│ │ 0│0│          │
│  (bg-gray-50)│  └─────┘ └────┘ └────┘ └────┘          │
└──────────────┴──────────────────────────────────────────┘
```

### **🎨 Зафиксированные стили:**

#### **DialogContent:**

```tsx
<DialogContent
  className='max-w-6xl max-h-[90vh] overflow-y-auto'
  showCloseButton={false}
>
```

#### **Верхняя навигация (h-12):**

```tsx
<div className='absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-4 border-b border-gray-100'>
	{/* Левая сторона - стрелка назад + текст "Назад" */}
	{currentStep > 1 ? (
		<div className='flex items-center gap-2'>
			<Button variant='ghost' size='icon-sm' onClick={handleBack}>
				<ArrowLeft className='h-4 w-4' />
			</Button>
			<span className='text-sm text-gray-600'>Назад</span>
		</div>
	) : (
		<div className='w-8'></div>
	)}

	{/* Правая сторона - крестик закрытия */}
	<Button variant='ghost' size='icon-sm' onClick={onClose}>
		<X className='h-4 w-4' />
	</Button>
</div>
```

#### **Основной контент (pt-8):**

```tsx
<div className='flex overflow-hidden pt-8'>
	{/* Левая панель */}
	<div className='w-56 bg-gray-50 p-6 rounded-md'>{/* Шаги */}</div>

	{/* Правая область */}
	<div className='flex-1 p-8 bg-white overflow-auto ml-4'>
		{/* Контент шага */}
	</div>
</div>
```

#### **Шаг навигации (LOCKED 🔒):**

```tsx
<div className='flex items-center px-4 py-3 border rounded-md transition-all duration-200 bg-blue-50 border-blue-300'>
	<div className='flex items-center gap-3'>
		<List className='h-5 w-5 text-gray-700' />
		<span className='text-sm font-medium text-gray-800'>Categoria</span>
	</div>
</div>
```

#### **Заголовок контента (LOCKED 🔒):**

```tsx
<h3 className='text-2xl font-medium text-gray-900'>Seleziona categoria</h3>
```

#### **Карточки категорий (LOCKED 🔒):**

```tsx
<Card className='cursor-pointer rounded-md aspect-square border border-gray-200 hover:border-blue-300'>
	<CardContent className='p-4 h-full flex flex-col items-center justify-center text-center gap-2'>
		{/* Индикатор выбора (w-2.5 h-2.5) */}
		<div className='absolute top-2 left-2'>
			<div className='w-2.5 h-2.5 bg-blue-500 rounded-full'></div>
		</div>

		{/* Иконка (mb-1) */}
		<div className='mb-1'>{renderIcon(category.icon)}</div>

		{/* Название (text-xs font-medium) */}
		<h4 className='font-medium text-gray-900 text-xs line-clamp-2 min-h-[2rem] flex items-center'>
			{category.name}
		</h4>

		{/* Счетчики (px-2 py-1 text-xs, rounded-md) */}
		<div className='flex gap-1.5 w-full mt-auto'>
			<div className='bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 flex-1 rounded-md'>
				{category.parametersCount}
			</div>
			<div className='bg-green-50 px-2 py-1 text-xs font-medium text-green-700 flex-1 rounded-md'>
				{category.suppliersCount}
			</div>
		</div>
	</CardContent>
</Card>
```

### **🔐 Консистентность скруглений:**

| Элемент            | Скругление                    | Статус    |
| ------------------ | ----------------------------- | --------- |
| DialogContent      | Стандартное                   | 🔒 LOCKED |
| Верхняя панель     | НЕТ (absolute)                | 🔒 LOCKED |
| **Левая панель**   | `rounded-md`                  | 🔒 LOCKED |
| Шаги навигации     | `rounded-md`                  | 🔒 LOCKED |
| Карточки категорий | `rounded-md`, `aspect-square` | 🔒 LOCKED |
| Счетчики           | `rounded-md`                  | 🔒 LOCKED |
| Кнопки             | `rounded-md`                  | 🔒 LOCKED |

### **📏 Зафиксированные размеры:**

- **DialogContent:** `max-w-6xl` (1152px), `max-h-[90vh]`
- **Верхняя панель:** `h-12` (48px)
- **Отступ контента:** `pt-8` (32px)
- **Левая панель:** `w-56` (224px), padding `p-6` (24px)
- **Правая область:** `flex-1`, padding `p-8` (32px), отступ `ml-4` (16px)
- **Карточки:** `aspect-square`, padding `p-4` (16px), gap `gap-2` (8px)
- **Счетчики:** `px-2 py-1 text-xs`

### **🎯 Ключевые особенности:**

1. **Левая панель - самостоятельный элемент:**

   - Скругление со всех сторон (`rounded-md`)
   - Без правой границы
   - Визуально отделена от контента отступом `ml-4`
   - Серый фон (`bg-gray-50`) выделяется на белом

2. **Карточки квадратные:**

   - `aspect-square` для правильной пропорции
   - Компактные отступы (`p-4`)
   - Счетчики со скруглением (`rounded-md`)

3. **Верхняя навигация:**

   - Тонкая полоска (`h-12`)
   - Текст "Назад" рядом со стрелкой (не tooltip)
   - Смещает контент вниз (`pt-8`)

4. **Tooltips для счетчиков:**

   - Settings (🔧) → "Parametri disponibili"
   - Building2 (🏢) → "Fornitori disponibili"
   - Курсор `cursor-help` при наведении

5. **Логика состояний по этапам:**

   - Этап 1: "📋 Categoria" (синий, без галочки)
   - Этап 2+: "📋 ✅ [Название]" (зеленый, с галочкой)
   - Возврат на этап 1: снова "📋 Categoria"

6. **Прокрутка зоны категорий:**

   - `max-h-[60vh]` - ограничение высоты
   - `overflow-y-auto` - вертикальная прокрутка
   - `pr-2` - отступ для скроллбара

7. **Увеличенные иконки категорий:**
   - Размер: `w-12 h-12` (48px, было 32px)
   - Увеличение на 50%
   - Карточки остались квадратными

### **🚫 Что НЕ менять:**

- ❌ Размеры левой панели (`w-56`)
- ❌ Отступы между панелями (`ml-4`)
- ❌ Скругления элементов (`rounded-md`)
- ❌ Размеры карточек (`aspect-square`, `p-4`)
- ❌ Высоту верхней панели (`h-12`)
- ❌ Отступ контента (`pt-8`)

### **✅ Дизайн полностью готов:**

- Левая панель - самостоятельный элемент ✅
- Все скругления консистентны ✅
- Отступы оптимизированы ✅
- Шрифты правильные ✅
- Карточки квадратные и компактные ✅

**ДИЗАЙН КОНФИГУРАТОРА БОЛЬШЕ НЕ ТРОГАЕМ!** 🔒

---

## 📄 Связанные документы

- `STICKER_V2_DESIGN_GUIDE.md` - общий дизайн системы
- `SEARCH_AND_SORT_GUIDE.md` - поиск и сортировка
- `MULTI_SEARCH_GUIDE.md` - множественный поиск
- `DESIGN_LOCKED.md` - зафиксированный дизайн конфигуратора

---

## 🔄 История изменений

### **Версия 1.2 (22 октября 2025)**

- ✅ Обновлен раздел о форме конфигуратора продуктов V2
- ✅ Добавлены tooltips для счетчиков (Settings, Building2)
- ✅ Реализована логика состояний по этапам (галочка/название)
- ✅ Добавлена прокрутка зоны категорий
- ✅ Увеличены иконки категорий (w-12 h-12)
- ✅ Улучшены счетчики с иконками и компактным дизайном
- ✅ Проведено комплексное тестирование первого этапа

### **Версия 1.1 (21 октября 2025)**

- ✅ Добавлен раздел о форме конфигуратора продуктов V2
- ✅ Зафиксирован дизайн конфигуратора (LOCKED)
- ✅ Документированы все размеры и стили
- ✅ Добавлены примеры кода для конфигуратора

### **Версия 1.0 (13 октября 2025)**

- ✅ Создан стандарт на основе формы клиента
- ✅ Определены правила выравнивания
- ✅ Установлены визуальные параметры
- ✅ Добавлены примеры реализации

---

_Этот стандарт является обязательным для всех новых форм в системе._  
_Последнее обновление: 21 октября 2025_
