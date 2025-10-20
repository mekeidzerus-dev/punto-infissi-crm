# Git Flow Configuration

## Ветки:

- `main` - продакшн версия (автоматический деплой)
- `develop` - разработка (деплой на staging)
- `feature/*` - новые функции (деплой на staging)
- `hotfix/*` - срочные исправления (деплой на staging, затем main)

## Workflow:

1. **Разработка:** Создаете ветку `feature/new-feature`
2. **Тестирование:** Пушите в `develop` → автоматический деплой на staging
3. **Продакшн:** Мержите в `main` → автоматический деплой на продакшн

## URLs:

- **Продакшн:** https://infissi.omoxsoft.com.ua
- **Staging:** https://staging.infissi.omoxsoft.com.ua
