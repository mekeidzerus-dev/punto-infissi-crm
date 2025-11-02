# 🎨 DESIGN SYSTEM GUIDE - Punto Infissi CRM

> **КРИТИЧЕСКИ ВАЖНО**: Перед созданием любых новых форм, модалов, кнопок или компонентов - **ОБЯЗАТЕЛЬНО** анализируйте существующий код и предлагайте пользователю варианты реализации на основе существующих паттернов.

---

## 📋 ОГЛАВЛЕНИЕ

1. [Цветовая система](#цветовая-система)
2. [Типографика](#типографика)
3. [Компоненты UI](#компоненты-ui)
4. [Паттерны форм](#паттерны-форм)
5. [Модальные окна](#модальные-окна)
6. [Карточки и контейнеры](#карточки-и-контейнеры)
7. [Кнопки и действия](#кнопки-и-действия)
8. [Инпуты и поля](#инпуты-и-поля)
9. [Сетки и расположение](#сетки-и-расположение)
10. [Стикер-дизайн v2](#стикер-дизайн-v2)
11. [Процесс принятия решений](#процесс-принятия-решений)

---

## 🎨 ЦВЕТОВАЯ СИСТЕМА

### Основная палитра (OKLCH)

**Light Theme:**

- `--background`: `oklch(1 0 0)` - Белый фон
- `--foreground`: `oklch(0.145 0 0)` - Почти черный текст
- `--card`: `oklch(1 0 0)` - Белые карточки
- `--card-foreground`: `oklch(0.145 0 0)` - Текст на карточках

**Primary:**

- `--primary`: `oklch(0.205 0 0)` - **Черный** (основной акцент)
- `--primary-foreground`: `oklch(0.985 0 0)` - Белый текст на черном

**Secondary:**

- `--secondary`: `oklch(0.97 0 0)` - Очень светло-серый
- `--secondary-foreground`: `oklch(0.205 0 0)` - Черный текст

**Muted:**

- `--muted`: `oklch(0.97 0 0)` - Приглушенный фон
- `--muted-foreground`: `oklch(0.556 0 0)` - Приглушенный текст

**Destructive (ошибки, удаление):**

- `--destructive`: `oklch(0.577 0.245 27.325)` - **Красный**
- `destructive-foreground`: Белый

**Акценты:**

- `--accent`: `oklch(0.97 0 0)` - Акцентный фон
- `--accent-foreground`: `oklch(0.205 0 0)` - Акцентный текст

**Границы:**

- `--border`: `oklch(0.922 0 0)` - Светло-серая граница
- `--input`: `oklch(0.922 0 0)` - Граница инпутов
- `--ring`: `oklch(0.708 0 0)` - Фокус ring

### Стикер-дизайн v2 палитра

**Фоны:**

- `--sticker-v2-bg`: `#f8fafc` - Очень светло-серый фон страницы
- `--sticker-v2-card`: `#ffffff` - Белые карточки
- `--sticker-v2-border`: `#e2e8f0` - Тонкие разделители
- `--sticker-v2-border-light`: `#f1f5f9` - Очень светлые разделители

**Акценты (ограничено):**

- `--sticker-v2-accent-primary`: `#ef4444` - **Красный** (важные элементы)
- `--sticker-v2-accent-success`: `#10b981` - **Зеленый** (успех, позитивные действия)
- `--sticker-v2-accent-neutral`: `#6b7280` - **Серый** (нейтральные элементы)

**Текст:**

- `--sticker-v2-text-primary`: `#1f2937` - Основной текст
- `--sticker-v2-text-secondary`: `#6b7280` - Вторичный текст
- `--sticker-v2-text-muted`: `#9ca3af` - Приглушенный текст

**Тени:**

```css
--sticker-v2-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--sticker-v2-shadow-lg: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--sticker-v2-shadow-xl: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
```

### ⚠️ ПРАВИЛА ИСПОЛЬЗОВАНИЯ ЦВЕТОВ

1. **НИКОГДА не используйте произвольные цвета** вроде `bg-[#ff0000]`
2. **Всегда используйте семантические классы**: `bg-primary`, `text-muted-foreground`
3. **Для кнопок действий**:
   - ✅ Зеленый (`bg-green-600`) - создание, сохранение
   - ✅ Красный (`text-red-600`, `border-red-300`) - отмена, удаление
   - ✅ Черный/primary - основные действия
4. **Статусы**:
   - `bg-green-600` - активный, успех
   - `bg-red-500/600` - неактивный, ошибка
   - `bg-gray-200` - нейтральный

---

## 🔤 ТИПОГРАФИКА

### Шрифты

**Основной:** Geist Sans (системный, через CSS переменную `--font-geist-sans`)
**Моно:** Geist Mono (через `--font-geist-mono`)

### Иерархия текста

**Заголовки:**

```tsx
<h1 className="text-2xl font-semibold leading-none">Page Title</h1>
<h2 className="text-lg leading-none font-semibold">Section Title</h2>
<h3 className="font-semibold">Card Title</h3>
```

**Описания и подписи:**

```tsx
<p className="text-sm text-muted-foreground">Description text</p>
<p className="text-xs text-red-600">Error message</p>
```

**Body:**

```tsx
<p className="text-base">Regular text</p>
<p className="text-sm">Small text</p>
```

### Стикер-дизайн v2 типографика

```css
.accent-text-v2 {
	color: var(--sticker-v2-text-primary);
	font-weight: 700;
	font-size: 1.5rem; /* 24px */
	line-height: 1.2;
	letter-spacing: -0.025em;
}

.accent-subtitle-v2 {
	color: var(--sticker-v2-text-secondary);
	font-size: 0.875rem; /* 14px */
	font-weight: 400;
}
```

---

## 🧩 КОМПОНЕНТЫ UI

### Расположение

Все UI компоненты находятся в `/src/components/ui/` на основе **shadcn/ui New York** стиля с базовым цветом `neutral`.

### Доступные компоненты

#### Button (`@/components/ui/button`)

**Варианты:**

- `default` - черный фон, белый текст
- `destructive` - красный фон
- `outline` - прозрачный фон, рамка
- `secondary` - светло-серый фон
- `ghost` - прозрачный, hover акцент
- `link` - текст с подчеркиванием

**Размеры:**

- `default` - `h-9 px-4` (default)
- `sm` - `h-8 px-3`
- `lg` - `h-10 px-6`
- `icon` - `size-9` квадрат
- `icon-sm` - `size-8` квадрат
- `icon-lg` - `size-10` квадрат

**Пример:**

```tsx
import { Button } from '@/components/ui/button'
import { Save, X } from 'lucide-react'

<Button onClick={handleSubmit} className='bg-green-600 hover:bg-green-700 text-white'>
  <Save className='w-4 h-4 mr-2' />
  Сохранить
</Button>

<Button variant='outline' className='border-red-300 text-red-600 hover:bg-red-50'>
  <X className='w-4 h-4 mr-2' />
  Отмена
</Button>
```

#### Dialog (`@/components/ui/dialog`)

**Структура:**

```tsx
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog'

;<Dialog open={isOpen} onOpenChange={handleClose}>
	<DialogContent className='max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto'>
		<DialogHeader>
			<DialogTitle>Заголовок</DialogTitle>
			<DialogDescription>Описание</DialogDescription>
		</DialogHeader>

		{/* Контент */}

		<DialogFooter>
			<Button variant='outline'>Отмена</Button>
			<Button>Сохранить</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
```

#### Input (`@/components/ui/input`)

```tsx
import { Input } from '@/components/ui/input'

;<Input
	id='name'
	value={formData.name}
	onChange={e => setFormData({ ...formData, name: e.target.value })}
	placeholder='Название'
	className={errors.name ? 'border-red-500' : ''}
/>
{
	errors.name && <p className='text-xs text-red-600 mt-1'>{errors.name}</p>
}
```

#### Select (`@/components/ui/select`)

```tsx
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

;<Select
	value={formData.status}
	onValueChange={value => setFormData({ ...formData, status: value })}
>
	<SelectTrigger>
		<SelectValue placeholder='Статус' />
	</SelectTrigger>
	<SelectContent>
		<SelectItem value='active'>Активен</SelectItem>
		<SelectItem value='inactive'>Неактивен</SelectItem>
	</SelectContent>
</Select>
```

#### PhoneInput (`@/components/ui/phone-input`)

```tsx
import { PhoneInput } from '@/components/ui/phone-input'

;<PhoneInput
	value={formData.phone}
	onChange={phone => setFormData({ ...formData, phone })}
	placeholder='Телефон'
	defaultCountry='IT'
	className={errors.phone ? 'border-red-500' : ''}
/>
```

#### Textarea (`@/components/ui/textarea`)

```tsx
import { Textarea } from '@/components/ui/textarea'

;<Textarea
	id='notes'
	value={formData.notes}
	onChange={e => setFormData({ ...formData, notes: e.target.value })}
	placeholder='Примечания'
	rows={3}
	className='resize-none'
/>
```

#### Card (`@/components/ui/card`)

```tsx
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from '@/components/ui/card'

;<Card className='gap-6'>
	<CardHeader className='pb-6'>
		<CardTitle>Заголовок</CardTitle>
		<CardDescription>Описание</CardDescription>
	</CardHeader>
	<CardContent>{/* Контент */}</CardContent>
	<CardFooter className='pt-6'>{/* Футер */}</CardFooter>
</Card>
```

#### Badge (`@/components/ui/badge`)

```tsx
import { Badge } from '@/components/ui/badge'

<Badge variant='default'>По умолчанию</Badge>
<Badge variant='destructive'>Ошибка</Badge>
<Badge variant='secondary'>Вторичный</Badge>
<Badge variant='outline'>Аутлайн</Badge>
```

#### Table (`@/components/ui/table`)

```tsx
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from '@/components/ui/table'

;<Table>
	<TableHeader>
		<TableRow>
			<TableHead>Название</TableHead>
			<TableHead>Email</TableHead>
		</TableRow>
	</TableHeader>
	<TableBody>
		<TableRow>
			<TableCell>Значение</TableCell>
			<TableCell>email@example.com</TableCell>
		</TableRow>
	</TableBody>
</Table>
```

---

## 📝 ПАТТЕРНЫ ФОРМ

### Стандартная структура модальной формы

Все модальные формы в приложении следуют единому паттерну.

#### 1. Базовая структура

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog'
import { Save, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export function StandardFormModal({ isOpen, onClose, onSave, initialData }) {
	const { t } = useLanguage()
	const [formData, setFormData] = useState({
		/* начальные значения */
	})
	const [errors, setErrors] = useState({})

	// Заполнение при редактировании
	useEffect(() => {
		if (initialData) {
			setFormData(prev => ({ ...prev, ...initialData }))
		}
	}, [initialData])

	const validate = () => {
		/* валидация */
	}
	const handleSubmit = () => {
		/* отправка */
	}
	const handleClose = () => {
		/* сброс и закрытие */
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto'>
				{/* Контент */}
			</DialogContent>
		</Dialog>
	)
}
```

#### 2. Разметка формы

```tsx
<DialogContent className='max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto'>
	<DialogHeader>
		<DialogTitle>{initialData ? t('editItem') : t('createItem')}</DialogTitle>
		<DialogDescription>{t('fillInfo')}</DialogDescription>
	</DialogHeader>

	<div className='space-y-4 py-4'>
		{/* Сетка с полями */}
		<div className='sticker-card-v2 p-4'>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3'>
				{/* Поля формы */}
			</div>
		</div>
	</div>

	{/* Кнопки */}
	<div className='flex justify-end gap-3 pt-4 border-t'>
		<Button
			variant='outline'
			onClick={handleClose}
			className='border-red-300 text-red-600 hover:bg-red-50'
		>
			<X className='w-4 h-4 mr-2' />
			{t('cancel')}
		</Button>
		<Button
			onClick={handleSubmit}
			className='bg-green-600 hover:bg-green-700 text-white'
		>
			<Save className='w-4 h-4 mr-2' />
			{initialData ? t('save') : t('createItem')}
		</Button>
	</div>
</DialogContent>
```

#### 3. Сетка полей

**Стандартная сетка:**

- 2 колонки на десктопе (`md:grid-cols-2`)
- 1 колонка на мобильных
- Отступы: `gap-x-6 gap-y-3`
- Поля обернуты в `sticker-card-v2 p-4`

```tsx
<div className='sticker-card-v2 p-4'>
	<div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3'>
		{/* Поле 1 */}
		<div>
			<Input
				id='field1'
				value={formData.field1}
				onChange={e => setFormData({ ...formData, field1: e.target.value })}
				placeholder='Поле 1'
				className={errors.field1 ? 'border-red-500' : ''}
			/>
			{errors.field1 && (
				<p className='text-xs text-red-600 mt-1'>{errors.field1}</p>
			)}
		</div>

		{/* Поле 2 */}
		<div>
			<Input
				id='field2'
				value={formData.field2}
				onChange={e => setFormData({ ...formData, field2: e.target.value })}
				placeholder='Поле 2'
			/>
		</div>

		{/* Textarea на всю ширину */}
		<div className='md:col-span-2'>
			<Textarea
				id='notes'
				value={formData.notes}
				onChange={e => setFormData({ ...formData, notes: e.target.value })}
				placeholder='Примечания'
				rows={3}
				className='resize-none'
			/>
		</div>
	</div>
</div>
```

#### 4. Тумблеры переключения типов

**Примеры: Клиент (Физ/Юр), Установщик (Физ/ИП/Юр)**

```tsx
<div className='flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg'>
	<button
		type='button'
		onClick={() => setFormData({ ...formData, type: 'individual' })}
		className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
			formData.type === 'individual'
				? 'bg-green-600 text-white shadow-md'
				: 'bg-white text-gray-600 hover:bg-gray-100'
		}`}
	>
		<User className='h-4 w-4' />
		{t('individualShort')}
	</button>
	<div className='h-6 w-px bg-gray-300' />
	<button
		type='button'
		onClick={() => setFormData({ ...formData, type: 'company' })}
		className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
			formData.type === 'company'
				? 'bg-green-600 text-white shadow-md'
				: 'bg-white text-gray-600 hover:bg-gray-100'
		}`}
	>
		<Building className='h-4 w-4' />
		{t('companyShort')}
	</button>
</div>
```

### Валидация

**Стандартная функция валидации:**

```tsx
const validate = (): boolean => {
	const newErrors: Record<string, string> = {}

	// Обязательное поле
	if (!formData.name.trim()) {
		newErrors.name = t('requiredField')
	}

	// Телефон
	if (
		!formData.phone.trim() ||
		formData.phone.replace(/[^\d]/g, '').length <= 1
	) {
		newErrors.phone = t('requiredField')
	} else {
		const country = getCountryByDialCode(formData.phone)
		if (country && !validatePhoneForCountry(formData.phone, country)) {
			newErrors.phone = `${t('invalidPhoneFormat')} ${country.name}`
		}
	}

	// Email
	if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
		newErrors.email = t('invalidEmailFormat')
	}

	// Итальянские реквизиты
	if (
		formData.codiceFiscale &&
		!validateCodiceFiscale(formData.codiceFiscale)
	) {
		newErrors.codiceFiscale = t('invalidCodiceFiscaleFormat')
	}

	if (formData.partitaIVA && !validatePartitaIVA(formData.partitaIVA)) {
		newErrors.partitaIVA = t('invalidPartitaIVAFormat')
	}

	setErrors(newErrors)
	return Object.keys(newErrors).length === 0
}
```

---

## 📦 МОДАЛЬНЫЕ ОКНА

### Стандартные размеры и стили

**Максимальная ширина:** `max-w-6xl` (672px)
**Адаптивная ширина:** `w-[95vw]` на мобильных
**Максимальная высота:** `max-h-[90vh]`
**Прокрутка:** `overflow-y-auto`

### Структура DialogContent

```tsx
<DialogContent className='max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto'>
	{/* 1. Заголовок */}
	<DialogHeader>
		<DialogTitle>Заголовок</DialogTitle>
		<DialogDescription>Описание</DialogDescription>
	</DialogHeader>

	{/* 2. Контент с отступами */}
	<div className='space-y-4 py-4'>{/* Форма */}</div>

	{/* 3. Футер с кнопками (граница сверху) */}
	<div className='flex justify-end gap-3 pt-4 border-t'>{/* Кнопки */}</div>
</DialogContent>
```

---

## 🎴 КАРТОЧКИ И КОНТЕЙНЕРЫ

### Sticker Card v2

**Класс:** `sticker-card-v2`

**Стили:**

- Фон: белый
- Скругление: `16px`
- Тень: мягкая
- Рамка: тонкая светлая
- Отступ: `p-4`

```tsx
<div className='sticker-card-v2 p-4'>{/* Контент */}</div>
```

### Content Sticker v2

**Класс:** `content-sticker-v2`

**Отличия от sticker-card-v2:**

- Вертикальные отступы: `16px 24px` (вместо 24px)
- Margin bottom: `20px`

---

## 🔘 КНОПКИ И ДЕЙСТВИЯ

### Стандартные паттерны кнопок

#### 1. Кнопка отмены (красная)

```tsx
<Button
	variant='outline'
	onClick={handleClose}
	className='border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400'
>
	<X className='w-4 h-4 mr-2' />
	{t('cancel')}
</Button>
```

#### 2. Кнопка сохранения (зеленая)

```tsx
<Button
	onClick={handleSubmit}
	className='bg-green-600 hover:bg-green-700 text-white'
>
	<Save className='w-4 h-4 mr-2' />
	{initialData ? t('save') : t('createItem')}
</Button>
```

#### 3. Основное действие (черная)

```tsx
<Button>
	<Plus className='w-4 h-4 mr-2' />
	Создать
</Button>
```

### Расположение кнопок

**Форма с двумя действиями:**

```tsx
<div className='flex justify-end gap-3 pt-4 border-t'>
	<Button variant='outline'>Отмена</Button>
	<Button>Сохранить</Button>
</div>
```

**Форма с одним действием:**

```tsx
<div className='flex justify-center gap-3 pt-4'>
	<Button>Продолжить</Button>
</div>
```

---

## 📊 СЕТКИ И РАСПОЛОЖЕНИЕ

### Основные паттерны сеток

#### 1. Сетка формы (2 колонки)

```tsx
<div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3'>
	{/* Поля */}
</div>
```

#### 2. Сетка статистики (4 колонки)

```tsx
<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
	{/* Статистика */}
</div>
```

#### 3. Flex-контейнер с отступами

```tsx
<div className='flex items-center gap-2'>
  {/* Элементы */}
</div>

<div className='flex justify-between items-center'>
  {/* Элементы */}
</div>

<div className='flex justify-end gap-3'>
  {/* Кнопки */}
</div>
```

### Отступы

**Стандартные:**

- `gap-2` (8px) - Компактный
- `gap-3` (12px) - Между кнопками
- `gap-4` (16px) - По умолчанию
- `gap-6` (24px) - Большой

**Padding:**

- `p-3` (12px) - Маленький
- `p-4` (16px) - Стандартный
- `p-6` (24px) - Большой

---

## 🎯 СТИКЕР-ДИЗАЙН V2

### Философия

Стикер-дизайн v2 - это минималистичный, современный стиль с акцентом на:

- Белые карточки с мягкими тенями
- Закругленные углы (16px)
- Тонкие границы
- Ограниченная цветовая палитра (только красный/зеленый)
- Много воздуха между элементами

### Применение

Дизайн применяется через атрибут `[data-design='sticker-v2']`.

**Основные классы:**

- `.sticker-card-v2` - Карточка
- `.content-sticker-v2` - Контентный блок
- `.stat-sticker-v2` - Статистика
- `.unified-nav-v2` - Навигация
- `.breadcrumbs-wrapper-v2` - Хлебные крошки
- `.sticker-header-with-logo-v2` - Хедер с логотипом

### Цветовые акценты

**Только два цвета:**

1. **Зеленый** (`#10b981`) - успех, позитивные действия
2. **Красный** (`#ef4444`) - ошибки, удаление

**Все остальные акценты** переназначены на серый (`#6b7280`).

---

## ⚡ ПРОЦЕСС ПРИНЯТИЯ РЕШЕНИЙ

### Критическое правило

**ПЕРЕД СОЗДАНИЕМ ЛЮБОГО НОВОГО КОМПОНЕНТА:**

1. ✅ **Проанализируй существующие формы** в проекте
2. ✅ **Определи паттерны** и повторяющиеся элементы
3. ✅ **Предложи пользователю варианты**:
   - Переиспользовать существующую форму?
   - Создать новую на основе шаблона?
   - Модифицировать существующую?

### Анализ существующих форм

**Формы в проекте:**

1. **ClientFormModal** (`client-form-modal.tsx`)

   - С тумблером Физ/Юр лицо
   - Имя/Фамилия или Название компании
   - Телефон, email, адрес
   - Реквизиты (для юрлиц)
   - Источник, примечания

2. **SupplierFormModal** (`supplier-form-modal.tsx`)

   - Название компании
   - Контакты
   - Реквизиты
   - Условия оплаты
   - Сроки поставки
   - Минимальная сумма
   - Рейтинг
   - Статус

3. **PartnerFormModal** (`partner-form-modal.tsx`)

   - Название
   - Контакты
   - Тип партнера (select)
   - Регион работы
   - Комиссия
   - Реквизиты
   - Статус

4. **InstallerFormModal** (`installer-form-modal.tsx`)
   - С тумблером Физ/ИП/Юр лицо
   - ФИО/Название
   - Контакты
   - Специализация
   - Опыт
   - Инструменты
   - Транспорт
   - Тариф
   - График работы
   - Доступность

### Шаблон для новой формы

Когда пользователь просит создать форму, **АВТОМАТИЧЕСКИ** предложи:

```
Я нашел в проекте несколько существующих форм:
1. ClientFormModal - для клиентов
2. SupplierFormModal - для поставщиков
3. PartnerFormModal - для партнеров
4. InstallerFormModal - для установщиков

Какую форму использовать как основу?
- [ ] Переиспользовать существующую
- [ ] Создать новую на основе шаблона
- [ ] Модифицировать существующую

Если создаем новую, какие поля нужны?
```

### Чек-лист перед созданием формы

**Обязательно проверить:**

- [ ] Использую компоненты из `/src/components/ui/`
- [ ] Сетка: `grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3`
- [ ] Обертка: `sticker-card-v2 p-4`
- [ ] Dialog: `max-w-6xl w-[95vw] max-h-[90vh]`
- [ ] Кнопки: красная отмена, зеленая сохранение
- [ ] Валидация с отображением ошибок
- [ ] Использую `useLanguage` для переводов
- [ ] Цвета через семантические классы
- [ ] Иконки из lucide-react
- [ ] Стили через Tailwind, не inline

---

## 🎨 ПРИМЕРЫ СМЕШИВАНИЯ КОМПОНЕНТОВ

### Модальная форма с тумблером + сетка полей

```tsx
<div className='space-y-4 py-4'>
	{/* Тумблер */}
	<div className='flex items-center justify-center gap-4 p-3 bg-gray-50 rounded-lg'>
		<button className='bg-green-600 text-white px-6 py-2 rounded-lg'>
			Вариант 1
		</button>
		<div className='h-6 w-px bg-gray-300' />
		<button className='bg-white text-gray-600 px-6 py-2 rounded-lg'>
			Вариант 2
		</button>
	</div>

	{/* Сетка полей */}
	<div className='sticker-card-v2 p-4'>
		<div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3'>
			{/* Поля */}
		</div>
	</div>
</div>
```

### Таблица с кнопками действий

```tsx
<Table>
	<TableHeader>
		<TableRow>
			<TableHead>Название</TableHead>
			<TableHead>Статус</TableHead>
			<TableHead className='text-right'>Действия</TableHead>
		</TableRow>
	</TableHeader>
	<TableBody>
		<TableRow>
			<TableCell>Элемент</TableCell>
			<TableCell>
				<Badge variant='default'>Активен</Badge>
			</TableCell>
			<TableCell className='text-right'>
				<div className='flex gap-2 justify-end'>
					<Button variant='ghost' size='icon-sm'>
						<Edit className='w-4 h-4' />
					</Button>
					<Button variant='ghost' size='icon-sm'>
						<Trash className='w-4 h-4 text-red-600' />
					</Button>
				</div>
			</TableCell>
		</TableRow>
	</TableBody>
</Table>
```

---

## 🚫 ЧТО НЕЛЬЗЯ ДЕЛАТЬ

### ❌ Запрещено

1. **Создавать кастомные кнопки** - использовать Button из `/ui`
2. **Использовать произвольные цвета** типа `bg-[#ff0000]`
3. **Инлайн стили** когда есть Tailwind классы
4. **Создавать дубликаты компонентов** - проверить `/ui` сначала
5. **Игнорировать существующие паттерны** форм
6. **Создавать новые формы без анализа** существующих
7. **Смешивать стили дизайн-систем** (sticker-v2 + обычная)

### ✅ Правильно

1. Импортировать компоненты из `/src/components/ui/`
2. Использовать семантические классы цветов
3. Следовать установленным паттернам
4. Анализировать существующий код перед созданием
5. Предлагать варианты реализации пользователю
6. Использовать существующие формы как основу

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

### Файлы для изучения

1. **Дизайн-система:** `src/styles/sticker-design-v2.css`
2. **Глобальные стили:** `src/app/globals.css`
3. **Примеры форм:**
   - `src/components/client-form-modal.tsx`
   - `src/components/supplier-form-modal.tsx`
   - `src/components/partner-form-modal.tsx`
   - `src/components/installer-form-modal.tsx`
4. **UI компоненты:** `src/components/ui/`
5. **Правила:** `.cursorrules`

### Иконки

**Библиотека:** `lucide-react`

**Популярные иконки:**

- `Save`, `X`, `Plus`, `Edit`, `Trash`
- `User`, `Building`, `Mail`, `Phone`
- `Search`, `Filter`, `ChevronDown`
- `Check`, `AlertCircle`

### Инструменты

- **Tailwind CSS v4** - стилизация
- **shadcn/ui** - компоненты (New York стиль)
- **Radix UI** - примитивы
- **CVA** (Class Variance Authority) - варианты
- **Lucide React** - иконки
- **OKLCH** - цветовая модель

---

## 🎯 ИТОГОВЫЙ ЧЕКЛИСТ

Перед созданием любого нового компонента проверь:

- [ ] Изучил существующие формы в проекте?
- [ ] Предложил пользователю варианты реализации?
- [ ] Использую компоненты из `/src/components/ui/`?
- [ ] Следую паттернам существующих форм?
- [ ] Использую семантические цвета Tailwind?
- [ ] Правильная сетка и отступы?
- [ ] Кнопки в правильном стиле (красная/зеленая)?
- [ ] Валидация с отображением ошибок?
- [ ] Переводы через `useLanguage`?
- [ ] Нет произвольных цветов и инлайн стилей?

---

**Последнее обновление:** 2024
**Версия:** 1.0
