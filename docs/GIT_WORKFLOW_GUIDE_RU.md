# 🌿 Руководство по работе с Git для PUNTO INFISSI CRM

## 📖 ЧТО ТАКОЕ GIT ВЕТКИ? (Простым языком)

Представь, что твой проект - это **дерево**:

- **main** (ствол) - это **рабочий сайт**, который видят пользователи
- **develop** (большая ветка) - это **место для разработки** новых функций
- **feature/\*** (маленькие ветки) - это **эксперименты** с новыми идеями

**Зачем это нужно?**
Чтобы ты мог добавлять новые функции и исправлять ошибки, не боясь сломать работающий сайт!

---

## 🗺️ СХЕМА ВЕТОК

```
main (ПРОДАКШН)
  └─ https://infissi.omoxsoft.com.ua
     └─ Это рабочий сайт, его видят клиенты
     └─ Здесь только стабильный, проверенный код

develop (РАЗРАБОТКА)
  └─ https://staging.infissi.omoxsoft.com.ua
     └─ Это тестовый сайт для проверки
     └─ Здесь ты тестируешь новые функции

feature/* (ЭКСПЕРИМЕНТЫ)
  └─ Временные ветки для новых функций
  └─ Например: feature/add-new-product-type
```

---

## 🎯 КАК РАБОТАТЬ С ВЕТКАМИ?

### **СЦЕНАРИЙ 1: Добавляешь новую функцию**

#### **Шаг 1: Создай ветку для новой функции**

```bash
# Переключаемся на develop
git checkout develop

# Создаем новую ветку для функции
git checkout -b feature/add-client-search

# Теперь ты в отдельной ветке!
```

**Что произошло?**
Ты создал "копию" проекта, где можешь экспериментировать, не затрагивая основной код.

---

#### **Шаг 2: Делаешь изменения**

```bash
# Вносишь изменения в файлы
# Например, добавляешь поиск клиентов

# Проверяешь что изменилось
git status

# Добавляешь файлы
git add .

# Создаешь коммит (сохраняешь изменения)
git commit -m "feat: Добавлен поиск клиентов"
```

**Что произошло?**
Ты "сфотографировал" свои изменения. Теперь их можно отправить на сервер.

---

#### **Шаг 3: Отправляешь на GitHub**

```bash
# Отправляешь ветку на GitHub
git push -u origin feature/add-client-search
```

**Что произошло?**
Твой код теперь на GitHub. Другие разработчики (или ты сам) можете его увидеть.

---

#### **Шаг 4: Тестируешь на Staging**

```bash
# Переключаемся на develop
git checkout develop

# Добавляем изменения из feature в develop
git merge feature/add-client-search

# Отправляем на GitHub
git push origin develop
```

**Что произошло?**

- GitHub Actions **автоматически** задеплоит код на **staging.infissi.omoxsoft.com.ua**
- Ты открываешь этот адрес и **тестируешь** новую функцию
- **Основной сайт** (infissi.omoxsoft.com.ua) **не затронут**!

---

#### **Шаг 5: Если всё работает - переносишь в продакшн**

```bash
# Переключаемся на main
git checkout main

# Добавляем изменения из develop в main
git merge develop

# Отправляем на GitHub
git push origin main
```

**Что произошло?**

- GitHub Actions **автоматически** задеплоит код на **основной сайт**
- Но теперь это будет **безоткатный деплой** (сайт не упадет!)
- Новая версия запустится на другом порту, проверится, и только потом переключится

---

### **СЦЕНАРИЙ 2: Срочное исправление ошибки**

#### **Если на рабочем сайте нашлась ошибка:**

```bash
# Создаем ветку hotfix прямо от main
git checkout main
git checkout -b hotfix/fix-price-calculation

# Исправляешь ошибку
# ... вносишь изменения ...

# Сохраняешь
git add .
git commit -m "fix: Исправлен расчет цены"

# Мержишь сразу в main
git checkout main
git merge hotfix/fix-price-calculation
git push origin main

# И также в develop, чтобы исправление было везде
git checkout develop
git merge hotfix/fix-price-calculation
git push origin develop

# Удаляешь ветку hotfix
git branch -d hotfix/fix-price-calculation
```

---

## 🎨 НАЗВАНИЯ ВЕТОК (Правила)

### **Типы веток:**

- `feature/*` - новая функция

  - Пример: `feature/add-client-search`
  - Пример: `feature/pdf-export-improvement`

- `bugfix/*` - исправление ошибки (не срочное)

  - Пример: `bugfix/fix-table-sorting`

- `hotfix/*` - срочное исправление (для продакшна)

  - Пример: `hotfix/fix-critical-login-bug`

- `refactor/*` - улучшение кода без изменения функций
  - Пример: `refactor/optimize-database-queries`

### **Правила названий:**

1. Используй латиницу (английский)
2. Используй дефисы `-` вместо пробелов
3. Будь конкретным: `feature/add-client-search` лучше чем `feature/search`

---

## 🔄 АВТОМАТИЧЕСКИЙ ДЕПЛОЙ (Как это работает?)

### **Когда ты делаешь `git push`:**

#### **1. Если push в `develop`:**

```
develop → GitHub → GitHub Actions → Staging Server
                                  ↓
                    https://staging.infissi.omoxsoft.com.ua
```

**Результат:** Код автоматически задеплоится на **тестовый сайт**

---

#### **2. Если push в `main`:**

```
main → GitHub → GitHub Actions → Production Server (Blue-Green)
                              ↓
                    https://infissi.omoxsoft.com.ua
                    (Сайт НЕ упадет!)
```

**Результат:**

1. Новая версия запускается на порту 3001
2. Проверяется, работает ли она
3. Если работает - старая версия (3000) останавливается
4. Nginx переключается на новую версию
5. **Сайт не падает ни на секунду!**

---

## 🛡️ БЕЗОПАСНОСТЬ (Защита от ошибок)

### **Правило 1: Никогда не пушь сразу в `main`**

```bash
# ❌ ПЛОХО (опасно!)
git checkout main
# делаешь изменения
git push origin main

# ✅ ХОРОШО (безопасно!)
git checkout develop
# делаешь изменения
git push origin develop
# тестируешь на staging
# только потом мержишь в main
```

### **Правило 2: Всегда тестируй на staging**

```bash
# 1. Разработка
git checkout develop
# ... изменения ...
git push origin develop

# 2. Открываешь staging.infissi.omoxsoft.com.ua
# 3. Тестируешь всё

# 4. Если всё ОК - только тогда в продакшн
git checkout main
git merge develop
git push origin main
```

---

## 📊 ТАБЛИЦА: КОГДА КАКУЮ ВЕТКУ ИСПОЛЬЗОВАТЬ?

| Ситуация                     | Ветка                    | Куда деплоится |
| ---------------------------- | ------------------------ | -------------- |
| Добавляю новую функцию       | `feature/*` → `develop`  | Staging        |
| Исправляю ошибку (не срочно) | `bugfix/*` → `develop`   | Staging        |
| СРОЧНО! Сайт сломан!         | `hotfix/*` → `main`      | Production     |
| Улучшаю код                  | `refactor/*` → `develop` | Staging        |
| Готов к релизу               | `develop` → `main`       | Production     |

---

## 🎓 ШПАРГАЛКА: Основные команды Git

### **Просмотр веток:**

```bash
# Показать все ветки
git branch -a

# Показать текущую ветку
git branch
```

### **Переключение между ветками:**

```bash
# Переключиться на develop
git checkout develop

# Переключиться на main
git checkout main

# Создать новую ветку и переключиться на неё
git checkout -b feature/new-feature
```

### **Сохранение изменений:**

```bash
# Посмотреть что изменилось
git status

# Добавить все файлы
git add .

# Сохранить изменения (коммит)
git commit -m "описание изменений"

# Отправить на GitHub
git push origin название-ветки
```

### **Объединение веток:**

```bash
# Переключиться на целевую ветку
git checkout develop

# Добавить изменения из другой ветки
git merge feature/new-feature

# Отправить на GitHub
git push origin develop
```

### **Удаление ветки:**

```bash
# Удалить локальную ветку
git branch -d feature/old-feature

# Удалить ветку на GitHub
git push origin --delete feature/old-feature
```

---

## ❓ ЧАСТЫЕ ВОПРОСЫ

### **Q: Я внес изменения, но забыл создать новую ветку. Что делать?**

```bash
# Создай новую ветку ПРЯМО СЕЙЧАС (изменения сохранятся)
git checkout -b feature/forgot-to-create-branch

# Продолжай работать как обычно
git add .
git commit -m "мои изменения"
git push -u origin feature/forgot-to-create-branch
```

---

### **Q: Я работаю в `develop`, но мне нужны свежие изменения из `main`**

```bash
# Переключись на main и обнови
git checkout main
git pull origin main

# Вернись в develop
git checkout develop

# Добавь изменения из main в develop
git merge main
```

---

### **Q: Как откатить изменения, если я что-то сломал?**

```bash
# Если ещё не сделал commit:
git checkout .

# Если уже сделал commit, но не push:
git reset --soft HEAD~1

# Если уже сделал push (будь осторожен!):
git revert HEAD
git push origin название-ветки
```

---

## 🎯 ИТОГОВАЯ РЕКОМЕНДАЦИЯ

### **Ежедневный workflow:**

1. **Утро:** `git checkout develop` → `git pull origin develop`
2. **Работа:** Создаешь `feature/*` ветку → вносишь изменения
3. **Тестирование:** Мержишь в `develop` → проверяешь на staging
4. **Релиз:** Мержишь `develop` в `main` → деплой на продакшн

### **Золотое правило:**

> **"Сначала тестируй на staging, потом выкатывай на продакшн"**

---

## 🆘 НУЖНА ПОМОЩЬ?

Если что-то пошло не так:

1. Не паникуй! Git позволяет откатить любые изменения
2. Посмотри `git status` - он подскажет, что делать
3. Используй `git log` чтобы увидеть историю
4. В крайнем случае - создай резервную копию и начни заново

---

**Удачи! 🚀 Теперь ты знаешь как работать с Git как профессионал!**
