# Release Notes

## 2025-01-XX - MekeidzeRH

### Исправления безопасности и архитектуры API

**Файлы изменены:**
- `src/lib/api-handler.ts` - добавлен `withAuthApiHandler` для автоматической проверки auth
- `src/lib/prisma-helpers.ts` - создан (новый файл) с функциями для фильтрации по organizationId
- `src/app/api/categories/route.ts` - исправлена аутентификация и фильтрация
- `src/app/api/categories/helpers.ts` - добавлена поддержка organizationId
- `src/app/api/product-categories/route.ts` - исправлена аутентификация и фильтрация
- `src/app/api/product-categories/helpers.ts` - обновлена для поддержки organizationId
- `src/app/api/parameters/route.ts` - добавлена аутентификация и фильтрация
- `src/app/api/parameters/helpers.ts` - добавлена поддержка organizationId
- `src/app/api/dictionaries/route.ts` - добавлена аутентификация
- `src/app/api/dictionaries/helpers.ts` - обновлена для поддержки organizationId
- `src/app/api/categories/[id]/route.ts` - добавлена аутентификация и проверка принадлежности
- `src/app/api/categories/with-counts/route.ts` - добавлена аутентификация и фильтрация
- `prisma/seed-default-data.ts` - исправлена ошибка с isSystem в Client

**Новые функции:**
- `withAuthApiHandler` - автоматическая проверка аутентификации для всех API маршрутов
- `withOrganizationFilter` - автоматическая фильтрация Prisma запросов по organizationId
- `withOrganizationId` - автоматическая установка organizationId при создании записей

**Исправленные проблемы:**
- Ошибка 400 Bad Request при загрузке категорий (отсутствие аутентификации)
- Отсутствие фильтрации по organizationId в запросах категорий
- Отсутствие проверки принадлежности записей к организации при обновлении/удалении
- Утечки данных между организациями в multi-tenant системе

**Тестирование:**
- Созданы e2e тесты: `tests/categories-e2e.spec.ts`
- Созданы API тесты: `tests/api-categories.spec.ts`, `tests/api-backend.spec.ts`
- Создан скрипт проверки БД: `scripts/test-api-categories.ts`

**Шаги тестирования:**
1. Запустить приложение: `npm run dev`
2. Войти в систему
3. Перейти в раздел "Категории" - не должно быть ошибок 400
4. Проверить другие разделы на аналогичные проблемы
5. Запустить тесты: `npm test tests/categories-e2e.spec.ts`
