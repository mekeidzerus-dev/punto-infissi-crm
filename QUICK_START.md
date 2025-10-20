# 🚀 Быстрый старт — Punto Infissi CRM v1.0.0

## ⚡ Запуск за 5 минут

### Шаг 1: Установка зависимостей

```bash
cd punto-infissi-crm
npm install
```

### Шаг 2: Настройка базы данных

```bash
# Создайте .env.local
echo 'DATABASE_URL="file:./dev.db"' > .env.local

# Примените миграции
npx prisma migrate deploy

# Загрузите тестовые данные
npx prisma db seed
```

### Шаг 3: Запуск

```bash
npm run dev
```

Откройте: **http://localhost:3000**

---

## 🎯 Первые шаги в системе

### 1. Настройте компанию

```
Settings → Azienda
  → Загрузите логотип
  → Укажите название, телефон, email, адрес
```

### 2. Создайте категорию

```
Settings → Categorie
  → Aggiungi categoria
  → Название: "Porte interne" / "Двери внутренние"
  → Выберите иконку: 🚪
```

### 3. Добавьте параметры

```
Settings → Parametri
  → Создайте параметры:
    • Larghezza (NUMBER, 600-3000 mm, шаг 10)
    • Altezza (NUMBER, 1800-2400 mm, шаг 10)
    • Materiale (SELECT)
    • Colore telaio (COLOR) ← HEX → RAL!
```

### 4. Добавьте значения для SELECT параметров

```
Settings → Parametri → "Materiale" → Gestisci valori
  → Aggiungi:
    • MDF / МДФ
    • Legno massello / Массив дерева
```

### 5. Добавьте цвета с RAL

```
Settings → Parametri → "Colore telaio" → Gestisci valori
  → Выберите цвет в picker: #F1F0EA
  → Система покажет: "Codice RAL: RAL 9016"
  → Название: "Bianco traffico"
  → Сохраните
```

### 6. Привяжите параметры к категории

```
Settings → Categorie → "Porte interne" → Parametri
  → Выберите все созданные параметры
  → Отметьте как обязательные (isRequired)
```

### 7. Создайте поставщика

```
Fornitori → Aggiungi fornitore
  → Название: "Design Doors SRL"
  → Контакты, адрес
  → Вкладка "Categorie": выберите "Porte interne"
```

### 8. Создайте клиента

```
Clienti → Aggiungi cliente
  → Tipo: Privato (физ. лицо)
  → Nome: Mario
  → Cognome: Rossi
  → Телефон: +39 333 1234567
```

### 9. Создайте предложение

```
Proposte → Crea proposta
  → Шаг 1: Выберите клиента "Mario Rossi"
  → Aggiungi posizione:
    1. Categoria: Porte interne
    2. Fornitore: Design Doors SRL
    3. Параметры:
       - Larghezza: 800 mm
       - Altezza: 2000 mm
       - Materiale: Legno massello
       - Colore telaio: Bianco traffico (RAL 9016)
  → Salva prodotto
  → Imposta prezzo: 500 €
  → IVA: 22%
  → Salva proposta
```

### 10. Сгенерируйте PDF

```
Proposte → Выберите созданное предложение
  → Нажмите "PDF 👁" (кнопка предпросмотра)
  → Проверьте документ
  → Скачайте PDF
```

---

## 🎨 Попробуйте HEX → RAL

### Тест 1: Inline добавление цвета

```
1. Proposals → Crea → Aggiungi posizione
2. Выберите категорию и поставщика
3. SELECT "Colore telaio" → нажмите "+"
4. Введите: "Grigio antracite"
5. Выберите в picker: серый (#383E42)
6. ✅ Увидите: "HEX: #383E42 • RAL: RAL 7016"
7. Enter → цвет сохранён с RAL!
```

### Тест 2: Модальное окно

```
1. SELECT "Colore telaio" → "📋 Mostra tutto..."
2. Aggiungi valore
3. Valore (IT): "Marrone noce"
4. Выберите коричневый (#5A3A29)
5. ✅ Синяя плашка: "Codice RAL: RAL 8011"
6. Salva → в таблице колонка RAL!
```

---

## 🌍 Попробуйте приоритет языка

### Тест с итальянским

```
1. Переключите язык на 🇮🇹 (флаг в шапке)
2. Settings → Parametri → "Materiale" → Gestisci valori
3. Aggiungi valore
4. ✅ Первое поле: "Valore (IT)" с autoFocus!
5. Введите: "Rovere naturale"
6. Второе поле пустое → автозаполнится
```

### Тест с русским

```
1. Переключите на 🇷🇺
2. Повторите шаги
3. ✅ Первое поле: "Значение (RU)" с autoFocus!
4. Таблица: колонки поменялись местами!
```

---

## 📋 Чеклист перед production

### Обязательно:

- [ ] Настроить PostgreSQL
- [ ] Применить миграции
- [ ] Загрузить начальные данные
- [ ] Настроить .env.local
- [ ] Загрузить логотип компании
- [ ] Создать 2-3 категории
- [ ] Добавить параметры для каждой категории
- [ ] Добавить поставщиков

### Опционально:

- [ ] Настроить SSL
- [ ] Настроить домен
- [ ] Интегрировать мониторинг (Sentry)
- [ ] Настроить резервное копирование БД

---

## 🆘 Устранение проблем

### Проблема: База данных не подключается

```bash
# Проверьте DATABASE_URL в .env.local
cat .env.local

# Пересоздайте базу
rm prisma/dev.db
npx prisma migrate deploy
npx prisma db seed
```

### Проблема: Порт 3000 занят

```bash
# Убить процесс на порту 3000
npx kill-port 3000

# Или использовать другой порт
PORT=3001 npm run dev
```

### Проблема: Ошибки компиляции

```bash
# Очистить кеш
rm -rf .next
npm run dev
```

---

## 📖 Дополнительные ресурсы

- **README.md** — Полный обзор проекта
- **ARCHITECTURE.md** — Техническая документация
- **PARAMETERS_GUIDE.md** — Работа с параметрами
- **SYSTEM_STATUS.md** — Статус и roadmap

---

**Версия:** 1.0.0  
**Статус:** Production Ready  
**Документ обновлён:** 19 октября 2025

🎉 **Готово к использованию!**
