# 📋 ПЛАН: Реорганизация формы предложения

**Дата:** 16 октября 2025  
**Статус:** В разработке

---

## ✅ ЧТО УЖЕ СДЕЛАНО:

1. **Переводы добавлены (RU/IT):**

   - `systemInformation` / `Informazioni di sistema`
   - `proposalValidUntil` / `Valido fino al`
   - `step` / `Passo`
   - `stepClientInfo` / `Informazioni cliente`
   - `stepProducts` / `Prodotti e servizi`
   - `stepTotals` / `Totale finale`

2. **Схема обновлена:**
   - Добавлено поле `validUntil: DateTime?` в `ProposalDocument`
   - Prisma client сгенерирован

---

## 🎯 ЧТО НУЖНО ДОРАБОТАТЬ:

### 1️⃣ AUTOCOMPLETE (ПРИОРИТЕТ ВЫСОКИЙ)

**Текущая проблема:**
Список клиентов отображается в отдельной Card ниже, а не прямо под input-полем.

**Решение:**

```tsx
<div className='relative'>
	{' '}
	{/* Обёртка для позиционирования */}
	<Input
		placeholder={t('searchClient')}
		value={clientSearchTerm}
		onChange={e => {
			setClientSearchTerm(e.target.value)
			setShowClientSearch(true)
		}}
	/>
	{/* Список прямо под полем! */}
	{showClientSearch && !selectedClient && (
		<div className='absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto'>
			{/* Здесь список результатов */}
		</div>
	)}
</div>
```

**Ключевые изменения:**

- `position: relative` на обёртке
- `position: absolute` на списке
- `z-index: 50` для отображения поверх других элементов
- `top-full mt-1` для размещения прямо под полем

---

### 2️⃣ СИСТЕМНЫЙ БЛОК (ПРИОРИТЕТ ВЫСОКИЙ)

**Добавить в начало формы:**

```tsx
{
	/* ⚙️ СИСТЕМНАЯ ИНФОРМАЦИЯ */
}
;<Card className='p-4 bg-gray-50 border-gray-300 mb-6'>
	<div className='flex items-center gap-2 mb-3'>
		<Settings className='h-5 w-5 text-gray-600' />
		<h3 className='font-semibold text-gray-700'>{t('systemInformation')}</h3>
	</div>

	<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
		{/* Номер документа (авто) */}
		<div>
			<Label className='text-xs text-gray-600'>{t('proposalNumber')}</Label>
			<div className='font-mono font-semibold text-sm mt-1'>
				{proposal?.number || 'PROP-XXX'}
			</div>
		</div>

		{/* Дата */}
		<div>
			<Label className='text-xs text-gray-600'>{t('date')}</Label>
			<Input
				type='date'
				value={formData.proposalDate}
				onChange={e =>
					setFormData({ ...formData, proposalDate: e.target.value })
				}
				className='h-8 text-sm'
			/>
		</div>

		{/* Срок действия */}
		<div>
			<Label className='text-xs text-gray-600'>{t('proposalValidUntil')}</Label>
			<Input
				type='date'
				value={formData.validUntil || ''}
				onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
				className='h-8 text-sm'
			/>
		</div>

		{/* Менеджер */}
		<div>
			<Label className='text-xs text-gray-600'>{t('responsibleManager')}</Label>
			<Input
				value={formData.responsibleManager || ''}
				onChange={e =>
					setFormData({ ...formData, responsibleManager: e.target.value })
				}
				className='h-8 text-sm'
			/>
		</div>
	</div>
</Card>
```

---

### 3️⃣ ВИЗУАЛЬНЫЕ ИНДИКАТОРЫ ШАГОВ

**Компонент индикатора шага:**

```tsx
interface StepHeaderProps {
	step: number
	totalSteps: number
	title: string
	isComplete?: boolean
}

function StepHeader({ step, totalSteps, title, isComplete }: StepHeaderProps) {
	const { t } = useLanguage()

	return (
		<div className='flex items-center justify-between mb-4'>
			<div className='flex items-center gap-3'>
				<div
					className={`
          flex items-center justify-center w-10 h-10 rounded-full font-bold
          ${
						isComplete
							? 'bg-green-100 text-green-700'
							: 'bg-blue-100 text-blue-700'
					}
        `}
				>
					{isComplete ? '✓' : step}
				</div>
				<div>
					<div className='text-xs text-gray-500'>
						{t('step')} {step} {t('of')} {totalSteps}
					</div>
					<h3 className='font-semibold text-lg'>{title}</h3>
				</div>
			</div>
			{isComplete && (
				<div className='text-green-600 font-medium text-sm'>
					✓ {t('completed')}
				</div>
			)}
		</div>
	)
}
```

**Использование:**

```tsx
{
	/* ШАГ 1: КЛИЕНТ */
}
;<Card className='p-6 mb-6 border-2 border-blue-200'>
	<StepHeader
		step={1}
		totalSteps={3}
		title={t('stepClientInfo')}
		isComplete={!!selectedClient}
	/>
	{/* Содержимое шага */}
</Card>

{
	/* ШАГ 2: ТОВАРЫ */
}
;<Card className='p-6 mb-6 border-2 border-green-200'>
	<StepHeader
		step={2}
		totalSteps={3}
		title={t('stepProducts')}
		isComplete={formData.groups.length > 0}
	/>
	{/* Содержимое шага */}
</Card>

{
	/* ШАГ 3: ИТОГО */
}
;<Card className='p-6 mb-6 border-2 border-green-200'>
	<StepHeader
		step={3}
		totalSteps={3}
		title={t('stepTotals')}
		isComplete={formData.total > 0}
	/>
	{/* Содержимое шага */}
</Card>
```

---

## 🎨 ЦВЕТОВАЯ СХЕМА:

- **Системный блок:** `bg-gray-50 border-gray-300` (нейтральный)
- **Шаг 1 (Клиент):** `border-blue-200` (важный)
- **Шаг 2 (Товары):** `border-green-200` (основной контент)
- **Шаг 3 (Итого):** `border-green-200` (результат)

---

## 📊 СТРУКТУРА ФОРМЫ (ФИНАЛЬНАЯ):

```
┌─────────────────────────────────────────────────────┐
│ ПРЕДЛОЖЕНИЕ #PROP-003                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ⚙️ СИСТЕМНАЯ ИНФОРМАЦИЯ                            │
│ ┌─────────────────────────────────────────────────┐ │
│ │ #PROP-003 │ 16.10.25 │ 30.10.25 │ Ruslan       │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                     │
│ 👤 ШАГ 1/3: ИНФОРМАЦИЯ О КЛИЕНТЕ              ✅   │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Поиск: [Mario_____]                             │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ ☑️ Mario Rossi - +39 333 1234567           │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                     │
│ 📦 ШАГ 2/3: ТОВАРЫ И УСЛУГИ                        │
│ ┌─────────────────────────────────────────────────┐ │
│ │ [Таблица товаров]                               │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                     │
│ 💰 ШАГ 3/3: ИТОГОВАЯ СУММА                    ✅   │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ИТОГО: 1,866.60 €                               │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ [👁 PDF] [❌ Отмена] [💾 Сохранить]               │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 СЛЕДУЮЩИЕ ШАГИ:

1. ✅ Переводы добавлены
2. ✅ Схема обновлена
3. ⏳ Реализовать autocomplete
4. ⏳ Добавить системный блок
5. ⏳ Добавить индикаторы шагов
6. ⏳ Обновить API для поддержки `validUntil`
7. ⏳ Обновить PDF с визуализацией

**Готово к реализации!** 🎯
