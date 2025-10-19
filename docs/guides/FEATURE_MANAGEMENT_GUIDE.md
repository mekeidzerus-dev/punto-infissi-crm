# 🎛️ УПРАВЛЕНИЕ ФУНКЦИЯМИ СИСТЕМЫ

## 📋 ОПИСАНИЕ

Эта система позволяет включать и отключать новые функции без нарушения существующего функционала.

## 🔧 КАК ВКЛЮЧИТЬ/ОТКЛЮЧИТЬ ФУНКЦИИ

### **1. Через переменные окружения**

Создайте файл `.env.local` в корне проекта:

```bash
# Включить все новые функции
NEXT_PUBLIC_ADVANCED_PARAMETERS=true
NEXT_PUBLIC_USER_SUGGESTIONS=true
NEXT_PUBLIC_PRODUCT_VISUALIZATION=true
NEXT_PUBLIC_COLOR_SQUARES=true
NEXT_PUBLIC_CUSTOM_NOTES=true
```

### **2. Через код (временно)**

В файле `src/lib/feature-flags.ts` измените значения:

```typescript
export const FEATURE_FLAGS = {
	ADVANCED_PARAMETERS: true, // Включить
	USER_SUGGESTIONS: false, // Отключить
	// ...
} as const
```

## 🎯 ДОСТУПНЫЕ ФУНКЦИИ

### **ADVANCED_PARAMETERS**

- ✅ Система шаблонов параметров
- ✅ Переопределения для поставщиков
- ✅ Централизованное управление

### **USER_SUGGESTIONS**

- ✅ Предложения пользователей
- ✅ Система одобрения администратором
- ✅ Проверка дублирования

### **PRODUCT_VISUALIZATION**

- ✅ Инфографическая визуализация
- ✅ Размерные линии
- ✅ Паттерны открытия

### **COLOR_SQUARES**

- ✅ Цветовые квадратики
- ✅ RAL коды
- ✅ Визуальный выбор цветов

### **CUSTOM_NOTES**

- ✅ Дополнительные заметки
- ✅ Свободный текст в конфигураторе

## 🚀 ПОШАГОВОЕ ВКЛЮЧЕНИЕ

### **Шаг 1: Включить визуализацию**

```bash
NEXT_PUBLIC_PRODUCT_VISUALIZATION=true
```

### **Шаг 2: Включить цветовые квадратики**

```bash
NEXT_PUBLIC_COLOR_SQUARES=true
```

### **Шаг 3: Включить заметки**

```bash
NEXT_PUBLIC_CUSTOM_NOTES=true
```

### **Шаг 4: Включить предложения**

```bash
NEXT_PUBLIC_USER_SUGGESTIONS=true
```

### **Шаг 5: Включить новую систему параметров**

```bash
NEXT_PUBLIC_ADVANCED_PARAMETERS=true
```

## 🔄 ОТКЛЮЧЕНИЕ ФУНКЦИЙ

### **Быстрое отключение всех функций:**

```bash
# В .env.local
NEXT_PUBLIC_ADVANCED_PARAMETERS=false
NEXT_PUBLIC_USER_SUGGESTIONS=false
NEXT_PUBLIC_PRODUCT_VISUALIZATION=false
NEXT_PUBLIC_COLOR_SQUARES=false
NEXT_PUBLIC_CUSTOM_NOTES=false
```

### **Отключение конкретной функции:**

```bash
NEXT_PUBLIC_PRODUCT_VISUALIZATION=false
```

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ

### **1. Перезапуск сервера**

После изменения переменных окружения необходимо перезапустить сервер:

```bash
npm run dev
```

### **2. База данных**

- Функции `ADVANCED_PARAMETERS` и `USER_SUGGESTIONS` требуют новых таблиц
- При первом включении запустите миграции:

```bash
npx prisma migrate dev --name add-advanced-parameters
```

### **3. Fallback поведение**

- При отключении функций система автоматически использует старые компоненты
- Никакой существующий функционал не сломается

## 🧪 ТЕСТИРОВАНИЕ

### **Включить все функции для тестирования:**

```bash
# В .env.local
NEXT_PUBLIC_ADVANCED_PARAMETERS=true
NEXT_PUBLIC_USER_SUGGESTIONS=true
NEXT_PUBLIC_PRODUCT_VISUALIZATION=true
NEXT_PUBLIC_COLOR_SQUARES=true
NEXT_PUBLIC_CUSTOM_NOTES=true
```

### **Проверить работу:**

1. Откройте конфигуратор товаров
2. Проверьте визуализацию
3. Попробуйте цветовые квадратики
4. Добавьте заметки
5. Предложите новое значение

## 🔧 УСТРАНЕНИЕ ПРОБЛЕМ

### **Если функция не работает:**

1. Проверьте переменные окружения
2. Перезапустите сервер
3. Проверьте консоль браузера на ошибки
4. Убедитесь что миграции выполнены

### **Если нужно полностью отключить:**

1. Установите все флаги в `false`
2. Перезапустите сервер
3. Система вернется к исходному состоянию

## 📞 ПОДДЕРЖКА

При возникновении проблем:

1. Проверьте логи сервера
2. Проверьте консоль браузера
3. Убедитесь что все зависимости установлены
4. Проверьте миграции базы данных
