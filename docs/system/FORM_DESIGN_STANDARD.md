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

## 📄 Связанные документы

- `STICKER_V2_DESIGN_GUIDE.md` - общий дизайн системы
- `SEARCH_AND_SORT_GUIDE.md` - поиск и сортировка
- `MULTI_SEARCH_GUIDE.md` - множественный поиск

---

## 🔄 История изменений

### **Версия 1.0 (13 октября 2025)**

- ✅ Создан стандарт на основе формы клиента
- ✅ Определены правила выравнивания
- ✅ Установлены визуальные параметры
- ✅ Добавлены примеры реализации

---

_Этот стандарт является обязательным для всех новых форм в системе._  
_Последнее обновление: 13 октября 2025_
