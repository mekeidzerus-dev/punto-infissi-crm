# ✅ Исправление контейнера формы конфигуратора

## 🎯 ЧТО СДЕЛАНО:

### 1. **Скопировал стиль из формы "Nuovo preventivo"**

**Было:**
```tsx
<DialogContent
  className='max-w-6xl max-h-[90vh] w-full p-0 rounded-lg'
  showCloseButton={false}
>
  <div className='flex overflow-hidden h-[90vh]'>
```

**Стало (как в форме "Nuovo preventivo"):**
```tsx
<DialogContent
  className='max-w-6xl max-h-[90vh] overflow-y-auto'
  showCloseButton={false}
>
  <div className='flex overflow-hidden'>
```

### 2. **Что изменилось в DialogContent:**

| Параметр | Было | Стало | Причина |
|----------|------|-------|---------|
| max-w | max-w-6xl | max-w-6xl | Чуть меньше чем форма (у неё max-w-7xl) ✅ |
| max-h | max-h-[90vh] | max-h-[90vh] | Такая же как в форме ✅ |
| w-full | ДА | НЕТ | Убрал - пусть браузер управляет ✅ |
| p-0 | ДА | НЕТ | Убрал - DialogContent имеет свой padding ✅ |
| rounded-lg | ДА | НЕТ | Убрал - DialogContent уже имеет скругления ✅ |
| overflow-y-auto | НЕТ | ДА | Добавил - как в форме "Nuovo preventivo" ✅ |

### 3. **Что изменилось во внутреннем контейнере:**

| Параметр | Было | Стало | Причина |
|----------|------|-------|---------|
| h-[90vh] | ДА | НЕТ | Убрал - overflow-y-auto управляет высотой ✅ |

### 4. **Результат:**

✅ **Форма конфигуратора теперь:**
- Имеет ТАКОЙ ЖЕ стиль контейнера как форма "Nuovo preventivo"
- Чуть меньше размером (max-w-6xl вместо max-w-7xl)
- Углы НЕ обрезаются (DialogContent сам управляет скруглениями)
- Правильный overflow (overflow-y-auto)
- Правильная высота (автоматическая, через max-h)

## 📊 Сравнение форм:

| Параметр | Nuovo preventivo | Конфигуратор | Разница |
|----------|------------------|--------------|---------|
| max-w | max-w-7xl (1280px) | max-w-6xl (1152px) | -128px ✅ |
| max-h | max-h-[90vh] | max-h-[90vh] | Одинаково ✅ |
| overflow | overflow-y-auto | overflow-y-auto | Одинаково ✅ |
| rounded | Стандартный DialogContent | Стандартный DialogContent | Одинаково ✅ |

## 🚀 ИТОГ:
Форма конфигуратора теперь использует ТОЧНО ТАКОЙ ЖЕ стиль контейнера как форма "Nuovo preventivo", но чуть меньше по ширине. Углы работают правильно, форма выглядит профессионально! ✨
