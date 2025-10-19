# 📞 Руководство по компоненту PhoneInput

## 🎯 Описание

Компонент `PhoneInput` предоставляет универсальное поле ввода телефонного номера с выбором страны и автоматическим форматированием.

---

## ✨ Возможности

### 1️⃣ **Выбор страны с флагами**

- 🇮🇹 Италия (по умолчанию)
- 🇫🇷 Франция
- 🇩🇪 Германия
- 🇪🇸 Испания
- 🇨🇭 Швейцария
- 🇦🇹 Австрия
- 🇬🇧 Великобритания
- 🇺🇸 США
- 🇷🇺 Россия
- 🇵🇱 Польша
- 🇳🇱 Нидерланды
- 🇧🇪 Бельгия

### 2️⃣ **Автоматическое форматирование**

- Каждая страна имеет свой формат номера
- Форматирование происходит при вводе
- Автоматическая подстановка кода страны

### 3️⃣ **Валидация**

- Проверка длины номера для каждой страны
- Проверка формата
- Сообщения об ошибках на русском языке

---

## 📦 Использование

### Импорт компонента

```tsx
import { PhoneInput } from '@/components/ui/phone-input'
```

### Базовый пример

```tsx
const [phone, setPhone] = useState('+39 ')

<PhoneInput
  value={phone}
  onChange={setPhone}
  placeholder='Телефон *'
  defaultCountry='IT'
/>
```

### С валидацией

```tsx
import { validatePhoneForCountry, getCountryByDialCode } from '@/lib/countries'

const validate = () => {
	if (!phone.trim() || phone.replace(/[^\d]/g, '').length <= 1) {
		setError('Обязательное поле')
	} else {
		const country = getCountryByDialCode(phone)
		if (country && !validatePhoneForCountry(phone, country)) {
			setError(`Неверный формат номера для ${country.name}`)
		}
	}
}
```

---

## 🔧 API

### Props

| Prop             | Тип                       | По умолчанию | Описание                    |
| ---------------- | ------------------------- | ------------ | --------------------------- |
| `value`          | `string`                  | -            | Текущее значение номера     |
| `onChange`       | `(value: string) => void` | -            | Callback при изменении      |
| `placeholder`    | `string`                  | `'Телефон'`  | Placeholder для поля        |
| `className`      | `string`                  | `''`         | CSS класс для стилизации    |
| `defaultCountry` | `string`                  | `'IT'`       | ISO код страны по умолчанию |

---

## 📚 Утилиты

### `countries.ts`

#### `COUNTRIES: Country[]`

Массив всех доступных стран с данными:

```ts
interface Country {
	code: string // ISO код (IT, FR, DE...)
	name: string // Название страны
	dialCode: string // Телефонный код (+39, +33...)
	flag: string // Emoji флаг (🇮🇹, 🇫🇷...)
	format?: string // Формат номера
}
```

#### `getCountryByCode(code: string): Country | undefined`

Получить страну по ISO коду.

#### `getCountryByDialCode(dialCode: string): Country | undefined`

Определить страну по телефонному коду.

#### `formatPhoneForCountry(phone: string, country: Country): string`

Форматировать номер для выбранной страны.

#### `validatePhoneForCountry(phone: string, country: Country): boolean`

Проверить валидность номера для страны.

---

## 🎨 Примеры форматирования

| Страна      | Формат               | Пример               |
| ----------- | -------------------- | -------------------- |
| 🇮🇹 Италия   | `+39 XXX XXX XXXX`   | `+39 333 123 4567`   |
| 🇺🇸 США      | `+1 (XXX) XXX-XXXX`  | `+1 (555) 123-4567`  |
| 🇷🇺 Россия   | `+7 (XXX) XXX-XX-XX` | `+7 (999) 123-45-67` |
| 🇫🇷 Франция  | `+33 X XX XX XX XX`  | `+33 6 12 34 56 78`  |
| 🇩🇪 Германия | `+49 XXX XXXXXXX`    | `+49 151 1234567`    |

---

## 🔄 Интеграция в формы

Компонент интегрирован в следующие формы:

- ✅ `ClientFormModal` - Форма клиента
- ✅ `SupplierFormModal` - Форма поставщика
- ✅ `PartnerFormModal` - Форма партнера
- ✅ `InstallerFormModal` - Форма монтажника

---

## 🌍 Добавление новой страны

1. Добавьте страну в `COUNTRIES` в `src/lib/countries.ts`:

```ts
{
  code: 'PT',
  name: 'Португалия',
  dialCode: '+351',
  flag: '🇵🇹',
  format: 'XXX XXX XXX',
}
```

2. (Опционально) Добавьте специфичное форматирование в `formatPhoneForCountry()`.

3. (Опционально) Добавьте специфичную валидацию в `validatePhoneForCountry()`.

---

## 🐛 Troubleshooting

### Проблема: Номер не форматируется

**Решение:** Убедитесь, что используете `onChange={phone => setFormData({ ...formData, phone })}`, а не `onChange={e => ...}`.

### Проблема: Валидация не работает

**Решение:** Проверьте, что используете `getCountryByDialCode()` для определения страны перед валидацией.

### Проблема: Флаги не отображаются

**Решение:** Убедитесь, что шрифт поддерживает emoji. Используйте системные шрифты.

---

## 📝 Примечания

- По умолчанию используется Италия (`IT`)
- Компонент автоматически определяет страну по введенному коду
- При смене страны в селекторе, код автоматически меняется
- Все форматы адаптированы под европейские стандарты

---

**Создано:** 14 октября 2025  
**Версия:** 1.0.0
