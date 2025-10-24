# 🎨 Зоны стилей формы конфигуратора

## 📋 Структура формы

```
┌─────────────────────────────────────────────────────────────┐
│                    ZONE 1: HEADER                           │
│  [← Arrow]     Catalogo (title)          [X Close]          │
│  px-4 py-2 border-b border-gray-200                         │
└─────────────────────────────────────────────────────────────┘
┌──────────────┬─────────────────────────────────────────────┐
│  ZONE 2:     │         ZONE 3: CONTENT AREA                │
│  LEFT PANEL  │                                              │
│              │  ┌────────────────────────────────────────┐ │
│  w-40        │  │ ZONE 3A: TITLE BAR                     │ │
│  p-3         │  │ "Seleziona categoria" + [Button]       │ │
│              │  │ mb-4, text-base                        │ │
│  ┌────────┐  │  └────────────────────────────────────────┘ │
│  │CATEGORIA│  │                                              │
│  │icon+text│  │  ┌────────────────────────────────────────┐ │
│  │p-3 items│  │  │ ZONE 3B: GRID OF CARDS                 │ │
│  └────────┘  │  │ grid-cols-4 gap-3                      │ │
│              │  │                                          │ │
│              │  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │ │
│              │  │ │CARD 1│ │CARD 2│ │CARD 3│ │CARD 4│   │ │
│              │  │ │Icon  │ │Icon  │ │Icon  │ │Icon  │   │ │
│              │  │ │Name  │ │Name  │ │Name  │ │Name  │   │ │
│              │  │ │[0][0]│ │[0][0]│ │[0][0]│ │[0][0]│   │ │
│              │  │ └──────┘ └──────┘ └──────┘ └──────┘   │ │
│              │  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │ │
│              │  │ │CARD 5│ │CARD 6│ │CARD 7│ │CARD 8│   │ │
│              │  │ └──────┘ └──────┘ └──────┘ └──────┘   │ │
│              │  │                                          │ │
│              │  │ p-4 bg-white overflow-auto              │ │
│              │  └────────────────────────────────────────┘ │
│              │                                              │
└──────────────┴─────────────────────────────────────────────┘
```

## 🔍 Детальное описание зон

### ZONE 1: HEADER (Заголовок)
**Файл:** `product-configurator-v2.tsx` (строки ~246-273)
**Классы:** `px-4 py-2 border-b border-gray-200 flex items-center justify-between`
**Элементы:**
- Стрелка назад: `Button variant='ghost' size='sm' className='h-8 w-8 p-0'`
- Заголовок: `h2 className='text-lg font-semibold text-gray-900'`
- Крестик: `Button variant='ghost' size='sm' className='h-8 w-8 p-0'`

### ZONE 2: LEFT PANEL (Левая панель с этапами)
**Файл:** `product-configurator-v2.tsx` (строки ~278-297)
**Классы:** `w-40 bg-white border-r border-gray-200 p-3`
**Элементы:**
- Контейнер этапов: `space-y-3`
- Этап "Categoria": 
  - Контейнер: `flex items-center p-3 rounded-lg border transition-all duration-200`
  - Активный: `bg-blue-50 border-blue-200`
  - Завершенный: `bg-green-50 border-green-200`
  - Обычный: `bg-white border-gray-200`
  - Иконка: `List className='h-4 w-4 mr-2 text-gray-600'`
  - Текст: `text-sm font-medium text-gray-700`

### ZONE 3: CONTENT AREA (Правая рабочая область)
**Файл:** `product-configurator-v2.tsx` (строки ~300-320)
**Классы:** `flex-1 p-4 bg-white overflow-auto`

#### ZONE 3A: TITLE BAR (Заголовок секции + кнопка)
**Файл:** `product-configurator-v2.tsx` (строки ~137-150)
**Классы:** `mb-4 flex items-center justify-between`
**Элементы:**
- Заголовок: `h3 className='text-base font-medium text-gray-900'`
- Кнопка: `bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-sm`
- Иконка в кнопке: `Plus className='h-3 w-3 mr-1.5'`

#### ZONE 3B: GRID OF CARDS (Сетка карточек категорий)
**Файл:** `product-configurator-v2.tsx` (строки ~158-198)
**Классы:** `grid grid-cols-4 gap-3`
**Элементы карточки:**
- Card контейнер: 
  - Обычный: `border border-gray-200 hover:border-gray-300 bg-white`
  - Выбранный: `border-2 border-blue-500 bg-blue-50 shadow-lg`
  - Hover: `hover:shadow-lg`
- CardContent: `p-3 h-full flex flex-col items-center justify-center text-center`
- Индикатор выбора: `absolute top-1.5 left-1.5` → `w-2 h-2 bg-blue-500 rounded-full`
- Иконка: `mb-2` (SVG рендерится через dangerouslySetInnerHTML)
- Название: `font-medium text-gray-900 text-xs mb-1 line-clamp-2`
- Счетчики (контейнер): `flex gap-1 w-full`
  - Счетчик 1 (синий): `bg-blue-50 px-1 py-0.5 rounded text-xs text-blue-700 flex-1`
  - Счетчик 2 (зеленый): `bg-green-50 px-1 py-0.5 rounded text-xs text-green-700 flex-1`

### ZONE 4: DIALOG CONTAINER (Внешний контейнер)
**Файл:** `product-configurator-v2.tsx` (строки ~230-244)
**Классы:** `max-w-5xl max-h-[85vh] w-full h-full p-0`

## 📏 Размеры и отступы

| Элемент | Ширина | Высота | Padding | Margin |
|---------|--------|--------|---------|--------|
| Dialog | max-w-5xl | max-h-[85vh] | p-0 | - |
| Header | full | auto | px-4 py-2 | - |
| Left Panel | w-40 | full | p-3 | - |
| Content Area | flex-1 | full | p-4 | - |
| Title Bar | full | auto | - | mb-4 |
| Grid | full | auto | - | - |
| Card | auto | auto | p-3 | - |
| Grid gap | - | - | - | gap-3 |

## 🎨 Цветовая схема

| Элемент | Цвет фона | Цвет текста | Цвет границы |
|---------|-----------|-------------|--------------|
| Header | white | gray-900 | gray-200 |
| Left Panel | white | gray-700 | gray-200 |
| Активный этап | blue-50 | gray-700 | blue-200 |
| Content Area | white | gray-900 | - |
| Card обычная | white | gray-900 | gray-200 |
| Card выбранная | blue-50 | gray-900 | blue-500 |
| Кнопка добавить | green-600 | white | - |
| Счетчик синий | blue-50 | blue-700 | - |
| Счетчик зеленый | green-50 | green-700 | - |

## 📝 Типографика

| Элемент | Font Size | Font Weight | Line Height |
|---------|-----------|-------------|-------------|
| Dialog Title | text-lg | font-semibold | - |
| Section Title | text-base | font-medium | - |
| Step Label | text-sm | font-medium | - |
| Card Title | text-xs | font-medium | - |
| Counter | text-xs | - | - |
| Button Text | text-sm | - | - |

## 🔄 Состояния

### Левая панель (этапы)
1. **Активный** (`currentStep === 1`):
   - bg-blue-50 border-blue-200
2. **Завершенный** (`selectedCategory !== null`):
   - bg-green-50 border-green-200
3. **Обычный**:
   - bg-white border-gray-200

### Карточки категорий
1. **Обычная**:
   - border border-gray-200 bg-white
2. **Hover**:
   - hover:border-gray-300 hover:shadow-lg
3. **Выбранная** (`selectedCategory?.id === category.id`):
   - border-2 border-blue-500 bg-blue-50 shadow-lg

## 🎯 Как указать проблему

Пожалуйста, укажите:
1. **Номер зоны** (например: "ZONE 3B - карточки")
2. **Конкретный элемент** (например: "название карточки", "кнопка добавить")
3. **Что не так** (например: "слишком большой размер", "неправильный цвет")

Например:
```
ZONE 1 (Header):
- Заголовок слишком большой → нужно text-base вместо text-lg

ZONE 3B (Cards):
- Карточки слишком высокие → нужно уменьшить padding
- Название слишком мелкое → нужно text-sm вместо text-xs
```
