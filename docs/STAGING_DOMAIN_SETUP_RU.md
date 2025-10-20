# 🌐 Настройка Staging домена - Пошаговая инструкция

## 📋 ЧТО МЫ НАСТРАИВАЕМ?

Мы создадим отдельный домен для тестового сайта:

- **Production:** `https://infissi.omoxsoft.com.ua` (уже работает)
- **Staging:** `https://staging.infissi.omoxsoft.com.ua` (настроим сейчас)

---

## ШАГ 1: ДОБАВИТЬ DNS ЗАПИСЬ

### **Где настраивать?**

Зайди туда, где у тебя зарегистрирован домен `omoxsoft.com.ua`:

- Это может быть: Cloudflare, GoDaddy, NameCheap, REG.RU, или другой регистратор
- Или в FastPanel, если DNS управляется там

### **Что добавить?**

#### **Параметры DNS записи:**

```
Тип записи:  A
Имя хоста:   staging.infissi
Значение:    95.67.11.37
TTL:         3600 (или оставь по умолчанию)
```

#### **Пример для Cloudflare:**

```
┌──────────────────────────────────────────────────┐
│ Add DNS Record                                   │
├──────────────────────────────────────────────────┤
│ Type: [A]                                        │
│ Name: [staging.infissi]                          │
│ IPv4 address: [95.67.11.37]                      │
│ TTL: [Auto]                                      │
│ Proxy status: [ ] Proxied (DNS only)             │
│                                                  │
│ [Cancel]  [Save]                                 │
└──────────────────────────────────────────────────┘
```

#### **Пример для REG.RU:**

```
Добавить запись:
Тип: A
Субдомен: staging.infissi
IP-адрес: 95.67.11.37
```

### **Как проверить что DNS настроен?**

После добавления записи, подожди 5-10 минут и выполни команду:

```bash
nslookup staging.infissi.omoxsoft.com.ua
```

**Должно быть:**

```
Name:    staging.infissi.omoxsoft.com.ua
Address: 95.67.11.37
```

**Если видишь IP 95.67.11.37 - DNS настроен правильно!** ✅

---

## ШАГ 2: НАСТРОИТЬ САЙТ В FASTPANEL

### **2.1. Заходим в FastPanel**

1. Открой браузер
2. Перейди по адресу: `https://panel.omoxsoft.com.ua` (или твой FastPanel URL)
3. Введи логин и пароль

### **2.2. Добавляем новый сайт**

1. В меню слева выбери **"Сайты"** или **"Websites"**
2. Нажми кнопку **"Добавить сайт"** или **"Add Website"**

### **2.3. Заполняем параметры сайта**

```
┌────────────────────────────────────────────────────┐
│ Создание сайта                                     │
├────────────────────────────────────────────────────┤
│ Домен:                                             │
│ [staging.infissi.omoxsoft.com.ua]                  │
│                                                    │
│ Тип сайта:                                         │
│ ( ) Static HTML                                    │
│ ( ) PHP                                            │
│ (•) Proxy (Node.js, Python, Go...)  ← ВЫБРАТЬ     │
│                                                    │
│ Порт приложения:                                   │
│ [3002]                              ← УКАЗАТЬ 3002 │
│                                                    │
│ Директория:                                        │
│ [/var/www/fastuser/data/www/staging.infissi...]    │
│                                                    │
│ SSL сертификат:                                    │
│ [✓] Let's Encrypt (бесплатный)     ← ВКЛЮЧИТЬ     │
│                                                    │
│ [Отмена]  [Создать]                                │
└────────────────────────────────────────────────────┘
```

### **Детали настройки:**

**Домен:**

```
staging.infissi.omoxsoft.com.ua
```

**Тип сайта:**

```
Proxy (Node.js)
```

_Это важно! Staging - это Node.js приложение, которое работает на порту 3002_

**Порт приложения:**

```
3002
```

_Это порт на котором запущен PM2 процесс punto-infissi-crm-staging_

**Директория:**

```
/var/www/fastuser/data/www/staging.infissi.omoxsoft.com.ua
```

_Или выбери из списка_

**SSL сертификат:**

```
✓ Let's Encrypt (автоматический, бесплатный)
```

### **2.4. Сохраняем**

1. Нажми **"Создать"** или **"Save"**
2. Подожди 1-2 минуты пока FastPanel:
   - Создаст конфигурацию Nginx
   - Получит SSL сертификат от Let's Encrypt
   - Перезапустит Nginx

---

## ШАГ 3: ПРОВЕРЯЕМ ЧТО ВСЁ РАБОТАЕТ

### **3.1. Проверка через браузер**

Открой в браузере:

```
https://staging.infissi.omoxsoft.com.ua
```

**Должно быть:**

- ✅ Сайт открывается
- ✅ Зелёный замочек (SSL работает)
- ✅ Видно интерфейс CRM

**Если не работает:**

- Подожди еще 5 минут (DNS может обновляться)
- Проверь что PM2 процесс staging запущен (см. ниже)

### **3.2. Проверка через командную строку**

```bash
# Проверка HTTP ответа
curl -I https://staging.infissi.omoxsoft.com.ua

# Должно быть: HTTP/2 200
```

### **3.3. Проверка PM2 процесса**

```bash
ssh fastuser@95.67.11.37
pm2 status

# Должен быть процесс:
# punto-infissi-crm-staging | online | port 3002
```

**Если процесса нет:**

```bash
cd /var/www/fastuser/data/www/staging.infissi.omoxsoft.com.ua
pm2 start npm --name "punto-infissi-crm-staging" -- start -- --port 3002
pm2 save
```

---

## ✅ ГОТОВО! ЧТО ТЕПЕРЬ?

Теперь у тебя есть **2 рабочих сайта**:

### **Production:**

```
URL:     https://infissi.omoxsoft.com.ua
Порт:    3000
Для:     Клиенты (все видят)
Деплой:  git push origin main
```

### **Staging:**

```
URL:     https://staging.infissi.omoxsoft.com.ua
Порт:    3002
Для:     Тестирование (только ты)
Деплой:  git push origin develop
```

---

## 🎯 КАК ТЕПЕРЬ РАБОТАТЬ?

### **Разработка новой функции:**

```bash
# 1. Создаешь feature
git checkout develop
git checkout -b feature/new-function

# 2. Делаешь изменения
# ... код ...

# 3. Пушишь в develop
git checkout develop
git merge feature/new-function
git push origin develop
```

**Результат:**

- GitHub Actions автоматически задеплоит на **staging**
- Открываешь `https://staging.infissi.omoxsoft.com.ua`
- Тестируешь новую функцию
- Production не затронут!

### **Выкатка на production:**

```bash
# Если всё работает на staging
git checkout main
git merge develop
git push origin main
```

**Результат:**

- GitHub Actions автоматически задеплоит на **production**
- Blue-Green deployment (без падений!)
- Клиенты видят обновление

---

## ❓ ЧАСТЫЕ ВОПРОСЫ

### **Q: Что делать если DNS не обновился через 10 минут?**

A: Попробуй:

```bash
# Очисти DNS кэш на своем компьютере
# Mac:
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Windows:
ipconfig /flushdns

# Linux:
sudo systemd-resolve --flush-caches
```

### **Q: Staging открывается но показывает ошибку?**

A: Проверь логи PM2:

```bash
ssh fastuser@95.67.11.37
pm2 logs punto-infissi-crm-staging --lines 50
```

### **Q: SSL сертификат не выдался?**

A: Подожди 5 минут и попробуй в FastPanel:

```
Сайты → staging.infissi.omoxsoft.com.ua → SSL → Перевыпустить
```

### **Q: Можно ли поставить пароль на staging?**

A: Да! В FastPanel:

```
Сайты → staging.infissi.omoxsoft.com.ua → Защита паролем
```

---

## 🆘 НУЖНА ПОМОЩЬ?

Если что-то не получается:

1. **Проверь DNS:**

   ```bash
   nslookup staging.infissi.omoxsoft.com.ua
   ```

2. **Проверь PM2:**

   ```bash
   ssh fastuser@95.67.11.37
   pm2 status
   ```

3. **Проверь логи:**

   ```bash
   pm2 logs punto-infissi-crm-staging
   ```

4. **Проверь порт:**
   ```bash
   curl http://localhost:3002
   # Должен вернуть HTML
   ```

---

**Удачи! 🚀**
