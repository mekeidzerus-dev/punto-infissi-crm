# 🎨 Руководство по дизайну "Стикер v2"

## 📋 Оглавление

- [Цветовая схема](#цветовая-схема)
- [Компоненты](#компоненты)
- [Типографика](#типографика)
- [Отступы и размеры](#отступы-и-размеры)
- [Примеры использования](#примеры-использования)

---

## 🎨 Цветовая схема

### **Основные цвета:**

```css
--sticker-v2-bg: #f8fafc           /* Фон страницы - очень светло-серый */
--sticker-v2-card: #ffffff         /* Фон карточек/блоков - белый */
--sticker-v2-border: #e2e8f0       /* Разделители - светло-серый */
--sticker-v2-border-light: #f1f5f9 /* Очень светлые разделители */
```

### **Акцентные цвета (ТОЛЬКО эти!):**

```css
--sticker-v2-accent-primary: #ef4444  /* ❤️ КРАСНЫЙ - для важных элементов, предупреждений */
--sticker-v2-accent-success: #10b981  /* 💚 ЗЕЛЕНЫЙ - для успеха, позитивных действий */
--sticker-v2-accent-neutral: #6b7280  /* 🔘 СЕРЫЙ - для нейтральных элементов */
```

### **Текст:**

```css
--sticker-v2-text-primary: #1f2937   /* Основной текст - темно-серый */
--sticker-v2-text-secondary: #6b7280 /* Вторичный текст - серый */
--sticker-v2-text-muted: #9ca3af     /* Приглушенный текст - светло-серый */
```

### **Тени:**

```css
--sticker-v2-shadow: 0 1px 3px rgba(0,0,0,0.1)       /* Обычная тень */
--sticker-v2-shadow-lg: 0 4px 6px rgba(0,0,0,0.1)    /* Большая тень */
--sticker-v2-shadow-xl: 0 10px 15px rgba(0,0,0,0.1)  /* Очень большая тень */
```

---

## 🧩 Компоненты

### **1. Layout (Структура страницы)**

#### Обертка всей страницы:

```tsx
<div className='layout-wrapper' data-design='sticker-v2'>
	<div className='header-full'>
		<HeaderWithLogoV2 />
	</div>
	<div className='layout-grid'>
		<div className='sidebar'>
			<Sidebar />
		</div>
		<div className='main-content'>{children}</div>
	</div>
</div>
```

**Правила:**

- `layout-wrapper` - всегда для корневого элемента
- `header-full` - хедер на всю ширину сверху
- `layout-grid` - flex-контейнер для сайдбара и контента
- `gap: 16px` между сайдбаром и контентом

---

### **2. Unified Navigation (Объединенная навигация)**

#### Использование:

```tsx
<UnifiedNavV2
	items={[
		{ id: 'clients', name: 'Клиенты', href: '/clients', icon: Users, count: 3 },
		{ id: 'suppliers', name: 'Поставщики', href: '/suppliers' },
	]}
	onAddClick={() => setDialogOpen(true)}
	addButtonText='Добавить'
/>
```

**Правила:**

- Используется для навигации по связанным разделам (Клиенты, Поставщики и т.д.)
- Активная вкладка имеет **серый фон** (не синий!)
- Иконка и счетчик только для активной вкладки
- Кнопка "Добавить" справа в той же панели

**CSS классы:**

- `.unified-nav-v2` - контейнер
- `.nav-item-unified` - элемент навигации
- `.nav-item-unified.active` - активный элемент (серый фон)
- `.nav-count` - счетчик в скобках

---

### **3. Content Blocks (Контентные блоки)**

#### Использование:

```tsx
<div className='content-sticker-v2'>{/* Ваш контент */}</div>
```

**Правила:**

- `border-radius: 16px` - скругленные углы
- `padding: 16px 24px` - компактные отступы
- `box-shadow: var(--sticker-v2-shadow)` - легкая тень
- `margin-bottom: 20px` - отступ снизу

---

### **4. Statistics Cards (Статистические карточки)**

#### Использование:

```tsx
<div className='stats-grid-v2'>
	<div className='stat-sticker-v2'>
		<div className='accent-label green'>Новые</div>
		<h3>Всего клиентов</h3>
		<div className='text-2xl font-bold'>124</div>
		<div>+12%</div>
	</div>
</div>
```

**Правила:**

- `stats-grid-v2` - 4 колонки на десктопе, responsive
- `height: 140px` - фиксированная высота для симметрии
- Акцентные метки: `.accent-label.red` или `.accent-label.green`
- **НЕ использовать синие, оранжевые, фиолетовые метки!**

---

### **5. Buttons (Кнопки)**

#### Основная кнопка:

```tsx
<Button className='sticker-btn-primary-v2'>
	<Plus className='h-4 w-4 mr-2' />
	Добавить
</Button>
```

**Правила:**

- Зеленый фон для позитивных действий
- Красный фон для опасных действий (удаление)
- Серый фон для нейтральных действий
- `size='sm'` для компактности

---

### **6. Accent Labels (Акцентные метки)**

#### Использование:

```tsx
<div className='accent-label red'>Важно</div>
<div className='accent-label green'>Активно</div>
```

**Доступные цвета:**

- ❤️ `red` - для важных/срочных элементов
- 💚 `green` - для активных/успешных элементов
- **ЗАПРЕЩЕНО:** blue, orange, purple (заменяются на red/green)

---

## 📝 Типографика

### **Заголовки:**

#### Большой заголовок (редко используется):

```tsx
<h1 className='accent-text-v2'>Панель управления</h1>
<p className='accent-subtitle-v2'>Описание</p>
```

- `font-size: 1.5rem` (24px) - компактный
- `font-weight: 700`
- `margin-bottom: 4px`

#### Обычный заголовок:

```tsx
<h2 className='text-xl font-bold text-gray-900'>Последние заказы</h2>
<p className='text-gray-600 mt-1 text-sm'>Описание</p>
```

### **Текст в таблицах:**

```css
Заголовки столбцов: text-xs
Содержимое ячеек: text-sm
```

---

## 📏 Отступы и размеры

### **Spacing System:**

```css
Между блоками: 16px (margin-bottom: 16px)
Внутри блоков: 16px-24px (padding)
Между элементами: 4px-8px (gap)
```

### **Border Radius:**

```css
Карточки/блоки: 16px
Навигация: 12px
Кнопки/поля: 8px
```

### **Heights (Высоты):**

```css
Хедер: padding: 12px 24px (компактный)
Навигация: padding: 8px 16px
Статистические карточки: height: 140px (фиксированная)
```

---

## 💡 Примеры использования

### **Пример 1: Страница со списком (Клиенты, Поставщики и т.д.)**

```tsx
import { UnifiedNavV2 } from '@/components/unified-nav-v2'
import { Users } from 'lucide-react'

export default function ClientsPage() {
  const [items, setItems] = useState([...])
  const [searchTerm, setSearchTerm] = useState('')

  const designVersion = DESIGN_CONFIG.getDesignVersion()

  if (designVersion === 'sticker-v2') {
    return (
      <DashboardLayoutStickerV2 hideTopNav={true}>
        <div className='space-y-4'>
          {/* Объединенная навигация */}
          <UnifiedNavV2
            items={[
              { id: 'clients', name: 'Клиенты', href: '/clients', icon: Users, count: items.length },
              { id: 'suppliers', name: 'Поставщики', href: '/suppliers' },
            ]}
            onAddClick={() => setDialogOpen(true)}
            addButtonText='Добавить'
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
              {/* Ваша таблица */}
            </Table>
          </div>
        </div>
      </DashboardLayoutStickerV2>
    )
  }

  // Классический дизайн
  return <DashboardLayout>...</DashboardLayout>
}
```

---

### **Пример 2: Дашборд со статистикой**

```tsx
<div className='stats-grid-v2'>
	<div className='stat-sticker-v2'>
		<div className='accent-label green'>Активные</div>
		<div className='flex items-center justify-between'>
			<h3 className='text-xs font-medium text-gray-600 uppercase'>
				Всего клиентов
			</h3>
			<Users className='h-5 w-5 text-gray-600' />
		</div>
		<div className='text-2xl font-bold text-gray-900'>124</div>
		<div className='flex items-center text-xs'>
			<TrendingUp className='h-3 w-3 text-green-600 mr-1' />
			<span className='text-green-600 font-medium'>+12%</span>
		</div>
	</div>
</div>
```

---

## ⚠️ **ВАЖНЫЕ ПРАВИЛА:**

### **ОБЯЗАТЕЛЬНО:**

1. ✅ Всегда используйте `data-design='sticker-v2'` для применения стилей
2. ✅ Используйте только **красный** и **зеленый** для акцентов
3. ✅ Применяйте компактные размеры (text-sm, text-xs)
4. ✅ Используйте `content-sticker-v2` для блоков контента
5. ✅ Добавляйте иконки для визуального понимания

### **ЗАПРЕЩЕНО:**

1. ❌ НЕ использовать синий, оранжевый, фиолетовый для акцентов
2. ❌ НЕ делать большие заголовки (max: text-xl)
3. ❌ НЕ использовать breadcrumbs (они не нужны)
4. ❌ НЕ создавать отдельные блоки для заголовков (использовать UnifiedNavV2)
5. ❌ НЕ добавлять лишние разделительные линии (border)

---

## 🔄 Процесс добавления нового раздела

### **Шаг 1: Проверить дизайн**

```tsx
const designVersion = DESIGN_CONFIG.getDesignVersion()
if (designVersion === 'sticker-v2') {
	return <YourStickerV2Component />
}
```

### **Шаг 2: Использовать layout**

```tsx
<DashboardLayoutStickerV2 hideTopNav={true}>
	{/* Ваш контент */}
</DashboardLayoutStickerV2>
```

### **Шаг 3: Добавить навигацию**

```tsx
<UnifiedNavV2
  items={[...]}
  onAddClick={handleAdd}
  addButtonText='Добавить'
/>
```

### **Шаг 4: Обернуть контент**

```tsx
<div className='content-sticker-v2'>{/* Поиск, таблица, формы и т.д. */}</div>
```

---

## 📦 Готовые компоненты

### **Layout компоненты:**

- `DashboardLayoutStickerV2` - основной layout
- `HeaderWithLogoV2` - хедер с логотипом
- `UnifiedNavV2` - объединенная навигация

### **UI компоненты:**

- `.content-sticker-v2` - контентный блок
- `.stat-sticker-v2` - статистическая карточка
- `.sticker-card-v2` - обычная карточка
- `.accent-label` - акцентная метка

### **Утилиты:**

- `.sticker-btn-primary-v2` - основная кнопка
- `.breadcrumbs-v2` - хлебные крошки (НЕ использовать!)

---

## 🎯 Примеры правильного использования

### ✅ **ПРАВИЛЬНО:**

```tsx
// Красная кнопка для удаления
<Button className='hover:bg-red-50 hover:text-red-600'>
  <Trash2 className='h-4 w-4' />
</Button>

// Зеленая кнопка для добавления
<Button className='sticker-btn-primary-v2'>
  <Plus className='h-4 w-4 mr-2' />
  Добавить
</Button>

// Серый активный таб
<nav className='unified-nav-v2'>
  <Link className='nav-item-unified active'>Клиенты (3)</Link>
</nav>

// Акцентные метки
<div className='accent-label red'>Срочно</div>
<div className='accent-label green'>Активно</div>
```

### ❌ **НЕПРАВИЛЬНО:**

```tsx
// НЕ используйте синий для акцентов
<Button className='bg-blue-500'>Добавить</Button>

// НЕ используйте большие заголовки
<h1 className='text-3xl'>Клиенты</h1>

// НЕ используйте breadcrumbs
<BreadcrumbsV2 items={[...]} />

// НЕ используйте оранжевые/фиолетовые метки
<div className='accent-label orange'>Важно</div>
```

---

## 🚀 Быстрый старт

### **Создание новой страницы в стиле "Стикер v2":**

1. Импортируйте компоненты:

```tsx
import { DashboardLayoutStickerV2 } from '@/components/dashboard-layout-sticker-v2'
import { UnifiedNavV2 } from '@/components/unified-nav-v2'
import { DESIGN_CONFIG } from '@/lib/design-config'
```

2. Добавьте проверку дизайна:

```tsx
const designVersion = DESIGN_CONFIG.getDesignVersion()
if (designVersion === 'sticker-v2') {
	return <YourStickerComponent />
}
```

3. Используйте готовую структуру:

```tsx
<DashboardLayoutStickerV2 hideTopNav={true}>
  <div className='space-y-4'>
    <UnifiedNavV2 items={[...]} onAddClick={...} />
    <div className='content-sticker-v2'>
      {/* Ваш контент */}
    </div>
  </div>
</DashboardLayoutStickerV2>
```

4. Применяйте правильные цвета:

- 🔴 Красный: удаление, предупреждения, срочные задачи
- 🟢 Зеленый: добавление, успех, активные элементы
- ⚪ Серый: активные вкладки, нейтральные элементы

---

## 📊 Адаптивность

### **Desktop (>768px):**

- Статистика: 4 колонки (`grid-template-columns: repeat(4, 1fr)`)
- Сайдбар: фиксированная ширина 80px
- Все блоки видны

### **Tablet (768px-480px):**

- Статистика: 2 колонки
- Сайдбар: скрывается
- Уменьшенные отступы

### **Mobile (<480px):**

- Статистика: 1 колонка
- Все элементы в колонку
- Минимальные отступы

---

## 🎨 Цветовая палитра для копирования

```
Красный (Primary):   #ef4444
Зеленый (Success):   #10b981
Серый (Neutral):     #6b7280
Фон страницы:        #f8fafc
Карточки:            #ffffff
Разделители:         #e2e8f0
Текст основной:      #1f2937
Текст вторичный:     #6b7280
```

---

## 📌 Checklist для нового компонента

- [ ] Добавлена проверка `designVersion === 'sticker-v2'`
- [ ] Используется `DashboardLayoutStickerV2`
- [ ] Используется `UnifiedNavV2` (если есть навигация)
- [ ] Контент обернут в `content-sticker-v2`
- [ ] Используются только красный/зеленый для акцентов
- [ ] Компактные размеры текста (text-sm, text-xs)
- [ ] Иконки добавлены для визуального понимания
- [ ] Нет лишних breadcrumbs
- [ ] Нет больших заголовков
- [ ] Скругленные углы (12px-16px)

---

**Последнее обновление:** 13.10.2025  
**Версия:** 2.0  
**Автор:** PUNTO INFISSI CRM Team
