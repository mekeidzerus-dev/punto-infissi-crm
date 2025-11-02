# План выполнения задач

## ✅ Задача 1: Вынести типы и константы - ЗАВЕРШЕНО

**Структура:**

```
src/types/
  - client.ts      - типы клиентов
  - proposal.ts     - типы предложений
  - parameter.ts    - типы параметров
  - supplier.ts     - типы поставщиков
  - common.ts       - общие типы (VATRate, ProductCategory)
src/constants/
  - routes.ts       - API маршруты
  - statuses.ts     - статусы
```

**Выполнено:**

- ✅ Созданы папки и файлы
- ✅ Вынесены типы из proposal-form-v3.tsx
- ✅ Обновлены импорты
- ⚠️ ESLint ошибки (не критично)

---

## Задача 2: Тестирование

1. Перезапуск приложения
2. Проверка компиляции (npm run build)
3. Проверка основных функций
4. Ручные тесты

---

## Задача 3: Анализ конфигуратора

**Цель конфигуратора:**
Пользователь заполняет параметры → нажимает "Conferma" → товар появляется в документе предложения с заполненными параметрами и рассчитанной ценой.

**Текущий поток:**

1. Шаг 1: Выбор категории → `handleCategorySelect`
2. Шаг 2: Выбор поставщика → `handleSupplierSelect`
3. Шаг 3: Заполнение параметров → `ParametersConfiguration`
4. Нажатие "Conferma" → `handleConfigurationComplete`
5. Создание product объекта:
   ```ts
   {
     category: selectedCategory,
     supplier: selectedSupplier,
     configuration: configuration,
     parameters: parameters,
   }
   ```
6. `onProductCreated(product)` → `handleConfiguratorV2Complete` в proposal-form-v3
7. Получение `supplierCategoryId` из API
8. Расчет цены через `calculateProductPrice`
9. Создание `ProposalPosition` с параметрами
10. Добавление в `formData.groups[currentGroupIndex].positions`

**Что проверить:**

- ✅ Все параметры передаются корректно
- ✅ Цена рассчитывается автоматически
- ✅ Товар отображается в списке позиций
- ✅ Параметры сохраняются в конфигурации
- ✅ Описание генерируется автоматически

**Файлы для анализа:**

- `src/components/product-configurator-v2.tsx` (строка 345-410)
- `src/components/proposal-form-v3.tsx` (строка 542-600)
- `src/lib/price-calculator.ts`
- `src/lib/product-name-generator.ts`
