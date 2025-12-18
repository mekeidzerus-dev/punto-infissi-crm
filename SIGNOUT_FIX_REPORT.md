# Отчет об исправлении проблемы выхода из системы

**Дата:** 2025-12-15  
**Проблема:** После выхода из приложения появлялись ошибки 401 в консоли браузера

## Проблема

После выхода из системы компонент `LogoUpdater` продолжал пытаться загрузить логотип из БД через `/api/organization`, что вызывало ошибки 401 (Unauthorized), так как сессия уже была удалена.

### Симптомы:
- Ошибки в консоли: `Failed to load resource: the server responded with a status of 401`
- Ошибки: `Failed to load logo from database: ApiError: Session expired`
- Ошибки появлялись на странице `/auth/signin` после выхода

## Исправления

### 1. LogoUpdater (`src/components/logo-updater.tsx`)

**Добавлено:**
- ✅ Импорт `useSession` и `usePathname` из Next.js
- ✅ Проверка публичных путей перед загрузкой логотипа
- ✅ Проверка статуса сессии (`authenticated`/`unauthenticated`)
- ✅ Очистка localStorage на публичных страницах
- ✅ Тихая обработка ошибок 401 (не логируются как ошибки)

**Логика:**
```typescript
// Проверяем, является ли текущий путь публичным
const isPublicPath = pathname && PUBLIC_PATHS.some(path => pathname.startsWith(path))

// Если это публичная страница или нет сессии, не загружаем логотип из БД
if (isPublicPath || status === 'unauthenticated' || !session) {
  // Очищаем логотип на публичных страницах
  if (isPublicPath) {
    localStorage.removeItem(LOGO_STORAGE_KEY)
    window.dispatchEvent(new Event('logo-updated'))
  }
  return
}
```

### 2. UserMenu (`src/components/auth/user-menu.tsx`)

**Добавлено:**
- ✅ Очистка localStorage перед выходом
- ✅ Улучшенная обработка ошибок в `handleSignOut`
- ✅ Явное указание `redirect: true` для signOut

**Логика:**
```typescript
const handleSignOut = async () => {
  setOpen(false)
  try {
    // Очищаем localStorage перед выходом
    localStorage.removeItem('modocrm-logo-path')
    await signOut({
      callbackUrl: '/auth/signin',
      redirect: true,
    })
  } catch (error) {
    console.error('[SignOut] Error:', error)
    // В случае ошибки все равно пытаемся выйти
    await signOut({ callbackUrl: '/auth/signin' })
  }
}
```

## Проверка исправлений

### Статическая проверка кода:
- ✅ `LogoUpdater` проверяет `status === 'unauthenticated'` перед загрузкой
- ✅ `LogoUpdater` проверяет публичные пути (`/auth/signin`, `/auth/signup`, etc.)
- ✅ `LogoUpdater` очищает localStorage на публичных страницах
- ✅ `handleSignOut` очищает localStorage перед выходом
- ✅ Ошибки 401 обрабатываются тихо (не логируются как ошибки)

### Ручная проверка (через браузер):

1. **Войдите в систему:**
   - Откройте `http://localhost:3000/auth/signin`
   - Введите: `Mekeidzerus@gmail.com` / `Sedrik095055`
   - Нажмите "Войти"

2. **Откройте консоль разработчика:**
   - Нажмите F12 или Cmd+Option+I (Mac)
   - Перейдите на вкладку "Console"

3. **Выйдите из системы:**
   - Нажмите на аватар пользователя (правый верхний угол)
   - Нажмите "Выйти" / "Esci"

4. **Проверьте результат:**
   - ✅ URL должен быть `/auth/signin` (без `callbackUrl`)
   - ✅ В консоли НЕ должно быть ошибок 401
   - ✅ В консоли НЕ должно быть сообщений "Failed to load logo from database"
   - ✅ Страница должна загрузиться без ошибок

## Ожидаемое поведение

### До исправления:
```
[ERROR] Failed to load resource: the server responded with a status of 401
[ERROR] Failed to load logo from database: ApiError: Session expired
```

### После исправления:
```
(Нет ошибок в консоли)
```

## Файлы изменены

1. `src/components/logo-updater.tsx` - добавлена проверка сессии и публичных путей
2. `src/components/auth/user-menu.tsx` - добавлена очистка localStorage перед выходом

## Статус

✅ **ИСПРАВЛЕНО** - Код готов к тестированию

---

**Примечание:** Для полной проверки необходимо протестировать через браузер, так как проблема проявляется только при реальном выходе из системы.



