# 🚀 ИНСТРУКЦИЯ ПО ЗАГРУЗКЕ НА GITHUB

**Проект:** PUNTO INFISSI CRM  
**Версия:** 1.0.0  
**Дата:** 19 октября 2025

---

## ✅ ЧТО УЖЕ СДЕЛАНО

1. ✅ Вся документация организована в папку `docs/`
2. ✅ Создан главный документ `docs/FINAL_DOCUMENTATION.md`
3. ✅ Версия проекта обновлена до 1.0.0
4. ✅ Добавлен Footer с версией на сайте
5. ✅ Создан CHANGELOG.md
6. ✅ Создан README.md
7. ✅ Создан env.example (шаблон .env)
8. ✅ Сделан Git commit

---

## 📋 СЛЕДУЮЩИЕ ШАГИ (выполните вручную)

### ШАГ 1: Создайте репозиторий на GitHub

1. Откройте: **https://github.com/new**

2. Заполните форму:

   ```
   Repository name: punto-infissi-crm
   Description: CRM система для продажи окон и дверей с автоматическим расчетом цен
   Visibility: 🔒 Private (выберите это!)

   ❌ НЕ добавляйте:
   - README (уже есть)
   - .gitignore (уже есть)
   - License (не нужно для private)
   ```

3. Нажмите **"Create repository"**

---

### ШАГ 2: Подключите локальный репозиторий

GitHub покажет вам команды. Используйте эти (для **existing repository**):

```bash
# В терминале выполните:
cd /Users/ruslanmekeidze/Desktop/mini-website/punto-infissi-crm

# Добавьте remote (ЗАМЕНИТЕ YOUR_USERNAME на ваш GitHub username!)
git remote add origin https://github.com/YOUR_USERNAME/punto-infissi-crm.git

# Проверьте
git remote -v

# Должно показать:
# origin  https://github.com/YOUR_USERNAME/punto-infissi-crm.git (fetch)
# origin  https://github.com/YOUR_USERNAME/punto-infissi-crm.git (push)
```

---

### ШАГ 3: Загрузите код на GitHub

```bash
# Запушьте код
git push -u origin main
```

**Если попросит авторизацию:**

GitHub может запросить:

- **Username:** ваш GitHub username
- **Password:** НЕ ПАРОЛЬ! Нужен **Personal Access Token**

---

### ШАГ 4: Создайте Personal Access Token (если нужно)

Если GitHub попросит пароль:

1. Откройте: **https://github.com/settings/tokens**

2. Нажмите **"Generate new token" → "Generate new token (classic)"**

3. Настройки:

   ```
   Note: Punto Infissi CRM Deploy
   Expiration: 90 days (или No expiration)
   Select scopes:
     ✅ repo (отметьте все подпункты)
   ```

4. Нажмите **"Generate token"**

5. **⚠️ ВАЖНО:** Скопируйте токен (он больше НЕ отобразится!)

   ```
   ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

6. Используйте токен вместо пароля при `git push`
   ```
   Username: ваш_username
   Password: ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

---

### ШАГ 5: Проверьте загрузку

1. Откройте репозиторий:

   ```
   https://github.com/YOUR_USERNAME/punto-infissi-crm
   ```

2. Проверьте:
   - ✅ Файлы загружены (должно быть ~280 файлов)
   - ✅ README.md отображается на главной
   - ✅ Есть папка `docs/` с документацией
   - ✅ Есть папки `src/`, `prisma/`, `public/`
   - ✅ **НЕТ** файлов `.env` (это важно!)
   - ✅ **НЕТ** папки `node_modules/` (она в .gitignore)

---

## 🎉 ГОТОВО!

После успешной загрузки вы можете:

### Клонировать на другой компьютер:

```bash
git clone https://github.com/YOUR_USERNAME/punto-infissi-crm.git
cd punto-infissi-crm
npm install
cp env.example .env
# Отредактировать .env
npx prisma migrate dev
npm run dev
```

### Приглашать коллег:

1. Repository Settings → Collaborators
2. Add people → Введите их GitHub username
3. Они получат доступ к коду

### Защитить main ветку:

1. Settings → Branches
2. Add rule → Branch name pattern: `main`
3. Отметьте:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass

---

## 🔄 ДАЛЬНЕЙШАЯ РАБОТА С GIT

### Для новых изменений:

```bash
# 1. Сделайте изменения в коде

# 2. Проверьте что изменилось
git status

# 3. Добавьте файлы
git add .

# 4. Коммит (следуйте Conventional Commits)
git commit -m "feat: добавил новую функцию"
# или
git commit -m "fix: исправил баг"
# или
git commit -m "docs: обновил документацию"

# 5. Загрузите на GitHub
git push
```

### Типы коммитов:

- `feat:` - новая функция
- `fix:` - исправление бага
- `docs:` - изменения в документации
- `style:` - форматирование кода
- `refactor:` - рефакторинг
- `test:` - добавление тестов
- `chore:` - рутинные задачи

---

## 🎯 ВЕРСИОНИРОВАНИЕ

Мы используем [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH
  |     |     |
  |     |     └─ Исправления багов (1.0.0 → 1.0.1)
  |     └─────── Новая функциональность (1.0.0 → 1.1.0)
  └───────────── Несовместимые изменения (1.0.0 → 2.0.0)
```

### Как изменить версию:

1. Обновите `package.json`:

   ```json
   "version": "1.0.1"
   ```

2. Обновите `CHANGELOG.md`:

   ```md
   ## [1.0.1] - 2025-10-20

   ### Fixed

   - Исправил баг с ...
   ```

3. Коммит:

   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore: Bump version to 1.0.1"
   git tag v1.0.1
   git push --tags
   ```

4. Версия автоматически отобразится внизу сайта! ✅

---

## 🛡️ БЕЗОПАСНОСТЬ

### ⚠️ ВАЖНО ПЕРЕД ЗАГРУЗКОЙ:

Проверьте что эти файлы **НЕ попадут** в репозиторий:

```bash
# Проверка
git status

# НЕ ДОЛЖНО БЫТЬ:
# .env
# .env.local
# .env.production
# node_modules/
# .next/
```

Если видите `.env` в списке:

```bash
# Убедитесь что в .gitignore есть
cat .gitignore | grep "env"

# Должно вывести: .env*
```

---

## 📞 НУЖНА ПОМОЩЬ?

### Ошибка: "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/punto-infissi-crm.git
```

### Ошибка: "failed to push"

```bash
git pull origin main --rebase
git push origin main
```

### Ошибка: "Authentication failed"

Используйте Personal Access Token вместо пароля (см. Шаг 4 выше).

---

## ✅ ЧЕК-ЛИСТ

- [ ] Создал репозиторий на GitHub (Private)
- [ ] Выполнил `git remote add origin`
- [ ] Выполнил `git push -u origin main`
- [ ] Проверил что код загружен
- [ ] Проверил что .env файлы НЕ загружены
- [ ] Пригласил коллег (если нужно)
- [ ] Настроил branch protection (если нужно)

**Если все галочки стоят — готово!** 🎉

---

_Подготовил: AI CTO Partner_  
_Дата: 19 октября 2025_


