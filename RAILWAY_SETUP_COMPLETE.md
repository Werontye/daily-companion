# 🚂 Railway - Полная инструкция по настройке

**Пошаговая инструкция с скриншотами действий**

---

## 📋 Содержание

1. [Регистрация на Railway](#1-регистрация-на-railway)
2. [Создание проекта](#2-создание-проекта)
3. [Получение и добавление переменных окружения](#3-получение-и-добавление-переменных)
4. [Настройка Google OAuth](#4-настройка-google-oauth)
5. [Настройка GitHub OAuth](#5-настройка-github-oauth)
6. [Финальная настройка](#6-финальная-настройка)
7. [Проверка работы](#7-проверка-работы)

---

## 1. Регистрация на Railway

### Шаг 1.1: Создать аккаунт

1. Открыть [railway.app](https://railway.app)
2. Нажать **"Login"** в правом верхнем углу
3. Выбрать **"Login with GitHub"**
4. Авторизоваться через GitHub
5. Railway попросит доступ к вашим репозиториям → **Approve**

✅ **Готово!** Теперь у вас есть аккаунт Railway.

---

## 2. Создание проекта

### Шаг 2.1: Подключить GitHub репозиторий

**ВАЖНО:** Сначала нужно запушить код на GitHub! Если еще не сделали:

```bash
# 1. Создайте репозиторий на GitHub:
# Перейдите на: https://github.com/new
# Name: daily-companion
# Public или Private (на выбор)
# НЕ создавайте README (у вас уже есть)
# Нажмите Create repository

# 2. Добавьте remote и запушьте:
git remote add origin https://github.com/ВАШ_USERNAME/daily-companion.git
git branch -M main
git push -u origin main
```

### Шаг 2.2: Создать проект на Railway

1. В Railway Dashboard нажать **"New Project"**
2. Выбрать **"Deploy from GitHub repo"**
3. Если первый раз:
   - Railway попросит доступ к GitHub
   - Нажать **"Configure GitHub App"**
   - Выбрать:
     - **All repositories** (все репозитории)
     - ИЛИ **Only select repositories** → выбрать `daily-companion`
   - Нажать **"Install & Authorize"**
4. Вернуться в Railway → выбрать репозиторий **`daily-companion`**
5. Railway автоматически начнет деплой!

### Шаг 2.3: Дождаться первого деплоя

Railway покажет логи деплоя:
```
Building...
Installing dependencies...
Building Next.js app...
Deployment successful! 🎉
```

⏱️ **Время:** 3-5 минут

❌ **Если деплой упал:**
- Проверьте логи (внизу страницы)
- Убедитесь что в `package.json` есть `"build": "next build"`

---

## 3. Получение и добавление переменных

### Шаг 3.1: Получить Railway URL

После успешного деплоя:

1. В Railway Dashboard → ваш проект
2. Перейти на вкладку **"Settings"**
3. Найти секцию **"Domains"**
4. Railway автоматически создаст домен, например:
   ```
   daily-companion-production.up.railway.app
   ```
5. **Скопировать этот URL!** Он понадобится дальше.

### Шаг 3.2: Сгенерировать NEXTAUTH_SECRET

**Вариант 1: Windows PowerShell**

```powershell
# Открыть PowerShell и выполнить:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Вариант 2: Git Bash (если установлен Git)**

```bash
openssl rand -base64 32
```

**Вариант 3: Онлайн генератор**

1. Перейти на [generate-secret.vercel.app](https://generate-secret.vercel.app/32)
2. Скопировать сгенерированный ключ

**Результат будет примерно такой:**
```
Xk8fJ2mP9nQ4rT6vY8zA1bC3dE5fG7hI9jK0lM2nO4p=
```

**Сохраните его!** Понадобится дальше.

### Шаг 3.3: Добавить переменные в Railway

1. Railway Dashboard → ваш проект
2. Перейти на вкладку **"Variables"**
3. Нажать **"New Variable"**

**Добавьте по очереди (каждую на новой строке):**

#### Переменная 1:
```
Variable: NODE_ENV
Value: production
```
Нажать **"Add"**

#### Переменная 2:
```
Variable: NEXTAUTH_SECRET
Value: (вставить сгенерированный секрет из шага 3.2)
```
Нажать **"Add"**

#### Переменная 3:
```
Variable: NEXTAUTH_URL
Value: https://ваш-railway-url.up.railway.app
```
**Замените на ваш реальный Railway URL из шага 3.1!**

Пример:
```
NEXTAUTH_URL = https://daily-companion-production.up.railway.app
```

#### Переменная 4:
```
Variable: NEXT_PUBLIC_APP_URL
Value: https://ваш-railway-url.up.railway.app
```
**Тот же URL что и в переменной 3!**

### Шаг 3.4: Railway передеплоит автоматически

После добавления переменных Railway автоматически запустит новый деплой.

Подождите 2-3 минуты.

✅ **Базовая настройка готова!** Сайт уже работает (без OAuth).

**Можете открыть ваш Railway URL в браузере и проверить!**

---

## 4. Настройка Google OAuth

### Шаг 4.1: Создать проект в Google Cloud Console

1. Перейти на [console.cloud.google.com](https://console.cloud.google.com)
2. Войти в Google аккаунт
3. В верхнем левом углу нажать **"Select a project"**
4. Нажать **"NEW PROJECT"**
5. Заполнить:
   - **Project name:** `Daily Companion` (или любое название)
   - **Organization:** Оставить по умолчанию
6. Нажать **"CREATE"**
7. Подождать 10-30 секунд пока проект создастся

### Шаг 4.2: Настроить OAuth Consent Screen

1. В левом меню найти **"APIs & Services"** → **"OAuth consent screen"**
2. Выбрать **"External"** (для публичного приложения)
3. Нажать **"CREATE"**
4. Заполнить форму:

**App information:**
```
App name: Daily Companion
User support email: (ваш email)
```

**App domain (опционально, можно пропустить):**
```
Application home page: https://ваш-railway-url.up.railway.app
```

**Developer contact information:**
```
Email addresses: (ваш email)
```

5. Нажать **"SAVE AND CONTINUE"**
6. **Scopes:** Пропустить → **"SAVE AND CONTINUE"**
7. **Test users:** Пропустить → **"SAVE AND CONTINUE"**
8. **Summary:** Проверить → **"BACK TO DASHBOARD"**

### Шаг 4.3: Создать OAuth Client ID

1. В левом меню: **"APIs & Services"** → **"Credentials"**
2. Нажать **"+ CREATE CREDENTIALS"** → выбрать **"OAuth client ID"**
3. Заполнить:

```
Application type: Web application

Name: Daily Companion Web Client

Authorized JavaScript origins:
https://ваш-railway-url.up.railway.app

Authorized redirect URIs:
https://ваш-railway-url.up.railway.app/api/auth/callback/google
```

**ВАЖНО:** Замените `ваш-railway-url.up.railway.app` на ваш реальный Railway URL!

Пример:
```
Authorized redirect URIs:
https://daily-companion-production.up.railway.app/api/auth/callback/google
```

4. Нажать **"CREATE"**

### Шаг 4.4: Скопировать Client ID и Client Secret

После создания появится окно с учетными данными:

```
Your Client ID
1234567890-abcdefghijk.apps.googleusercontent.com

Your Client Secret
GOCSPX-AbCdEfGhIjKlMnOpQrStUvWx
```

**ВАЖНО:** Скопируйте оба значения! Они понадобятся дальше.

Можно нажать **"DOWNLOAD JSON"** для сохранения (НО не коммитить в Git!).

### Шаг 4.5: Добавить в Railway

Вернуться в Railway → Variables → New Variable:

#### Переменная 5:
```
Variable: GOOGLE_CLIENT_ID
Value: (ваш Client ID из шага 4.4)
```

Пример:
```
GOOGLE_CLIENT_ID = 1234567890-abcdefghijk.apps.googleusercontent.com
```

#### Переменная 6:
```
Variable: GOOGLE_CLIENT_SECRET
Value: (ваш Client Secret из шага 4.4)
```

Пример:
```
GOOGLE_CLIENT_SECRET = GOCSPX-AbCdEfGhIjKlMnOpQrStUvWx
```

Railway автоматически передеплоит.

✅ **Google OAuth готов!**

---

## 5. Настройка GitHub OAuth

### Шаг 5.1: Создать OAuth App на GitHub

1. Открыть [github.com/settings/developers](https://github.com/settings/developers)
2. Нажать **"OAuth Apps"** (левое меню)
3. Нажать **"New OAuth App"** (зеленая кнопка справа)
4. Заполнить форму:

```
Application name: Daily Companion

Homepage URL:
https://ваш-railway-url.up.railway.app

Application description (опционально):
Your Personal Productivity Partner

Authorization callback URL:
https://ваш-railway-url.up.railway.app/api/auth/callback/github
```

**ВАЖНО:** Замените `ваш-railway-url.up.railway.app` на ваш реальный Railway URL!

Пример:
```
Authorization callback URL:
https://daily-companion-production.up.railway.app/api/auth/callback/github
```

5. Нажать **"Register application"**

### Шаг 5.2: Получить Client ID и Secret

После создания приложения вы увидите:

```
Client ID
Iv1.a1b2c3d4e5f6g7h8
```

**Client Secret** еще НЕ виден. Нужно его сгенерировать:

1. Нажать **"Generate a new client secret"**
2. GitHub попросит подтвердить пароль → ввести пароль
3. Появится:
   ```
   Client secrets
   1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0
   ```

**ВАЖНО:** Скопируйте Client Secret СРАЗУ! Он показывается только один раз.

Если не скопировали, придется сгенерировать новый.

### Шаг 5.3: Добавить в Railway

Вернуться в Railway → Variables → New Variable:

#### Переменная 7:
```
Variable: GITHUB_CLIENT_ID
Value: (ваш Client ID из шага 5.2)
```

Пример:
```
GITHUB_CLIENT_ID = Iv1.a1b2c3d4e5f6g7h8
```

#### Переменная 8:
```
Variable: GITHUB_CLIENT_SECRET
Value: (ваш Client Secret из шага 5.2)
```

Пример:
```
GITHUB_CLIENT_SECRET = 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0
```

Railway автоматически передеплоит.

✅ **GitHub OAuth готов!**

---

## 6. Финальная настройка

### Шаг 6.1: Проверить все переменные в Railway

Перейти в Railway → Variables

**Должны быть ВСЕ 8 переменных:**

```
✅ NODE_ENV = production
✅ NEXTAUTH_SECRET = ваш-сгенерированный-секрет
✅ NEXTAUTH_URL = https://ваш-railway-url.up.railway.app
✅ NEXT_PUBLIC_APP_URL = https://ваш-railway-url.up.railway.app
✅ GOOGLE_CLIENT_ID = 1234567890-abc...apps.googleusercontent.com
✅ GOOGLE_CLIENT_SECRET = GOCSPX-...
✅ GITHUB_CLIENT_ID = Iv1.a1b2c3d4...
✅ GITHUB_CLIENT_SECRET = 1a2b3c4d5e6f...
```

### Шаг 6.2: Дождаться финального деплоя

Railway должен автоматически передеплоить после добавления последних переменных.

Проверить в Railway → Deployments:
- Должен быть статус: **"Success"** ✅
- Deployment time: ~3-5 минут

---

## 7. Проверка работы

### Шаг 7.1: Открыть сайт

```
https://ваш-railway-url.up.railway.app
```

Должна открыться главная страница Daily Companion.

### Шаг 7.2: Проверить Google OAuth

1. Перейти на:
   ```
   https://ваш-railway-url.up.railway.app/auth/login
   ```

2. Нажать кнопку **"Google"**

3. Должно открыться окно авторизации Google

4. Выбрать аккаунт Google

5. Если появится:
   ```
   "This app isn't verified"
   ```
   Это нормально для тестового приложения!

   Нажать **"Advanced"** → **"Go to Daily Companion (unsafe)"**

6. Разрешить доступ

7. Должен произойти redirect на `/dashboard`

✅ **Если попали на дашборд → Google OAuth работает!**

### Шаг 7.3: Проверить GitHub OAuth

1. Перейти на:
   ```
   https://ваш-railway-url.up.railway.app/auth/login
   ```

2. Нажать кнопку **"GitHub"**

3. Должно открыться окно авторизации GitHub

4. Нажать **"Authorize [ваше имя приложения]"**

5. Должен произойти redirect на `/dashboard`

✅ **Если попали на дашборд → GitHub OAuth работает!**

---

## 📊 Финальный чеклист

Проверьте что все готово:

- ✅ Railway проект создан
- ✅ GitHub репозиторий подключен
- ✅ Деплой успешен (статус: Success)
- ✅ Railway URL получен
- ✅ 8 переменных окружения добавлены
- ✅ Google OAuth настроен
- ✅ GitHub OAuth настроен
- ✅ Сайт открывается
- ✅ Google login работает
- ✅ GitHub login работает

---

## 🎯 Итоговая таблица переменных

| Переменная | Где получить | Пример значения |
|------------|--------------|-----------------|
| `NODE_ENV` | Вручную | `production` |
| `NEXTAUTH_SECRET` | Сгенерировать | `Xk8fJ2mP9nQ4rT6v...` |
| `NEXTAUTH_URL` | Railway Settings → Domains | `https://daily-companion-production.up.railway.app` |
| `NEXT_PUBLIC_APP_URL` | Railway Settings → Domains | `https://daily-companion-production.up.railway.app` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials | `1234567890-abc...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credentials | `GOCSPX-AbCdEf...` |
| `GITHUB_CLIENT_ID` | GitHub Settings → OAuth Apps | `Iv1.a1b2c3d4e5...` |
| `GITHUB_CLIENT_SECRET` | GitHub Settings → OAuth Apps | `1a2b3c4d5e6f7...` |

---

## ⚠️ Частые ошибки

### Ошибка 1: "OAuth Error: Invalid redirect URI"

**Причина:** Неправильный callback URL

**Решение:**
1. Проверить что в Google/GitHub OAuth настройках указан ТОЧНЫЙ URL:
   ```
   https://ваш-railway-url.up.railway.app/api/auth/callback/google
   https://ваш-railway-url.up.railway.app/api/auth/callback/github
   ```
2. Без "/" в конце!
3. С `https://` (не `http://`)

### Ошибка 2: "Configuration error"

**Причина:** Не все переменные добавлены в Railway

**Решение:**
1. Проверить Railway → Variables
2. Убедиться что ВСЕ 8 переменных добавлены
3. Проверить что нет опечаток в названиях

### Ошибка 3: "This app isn't verified" (Google)

**Это НЕ ошибка!** Это нормально для тестовых приложений.

**Решение:**
1. Нажать **"Advanced"**
2. Нажать **"Go to Daily Companion (unsafe)"**
3. Для production: нужно пройти Google verification process

### Ошибка 4: Railway деплой упал

**Решение:**
1. Проверить логи в Railway → Deployments → View logs
2. Убедиться что в `package.json` есть:
   ```json
   "scripts": {
     "build": "next build",
     "start": "next start"
   }
   ```
3. Проверить что все зависимости установлены

---

## 🔐 Безопасность

**НИКОГДА не коммитить в Git:**
- ❌ `.env` файлы
- ❌ Client Secrets
- ❌ `NEXTAUTH_SECRET`
- ❌ Файлы с credentials

**Всегда использовать:**
- ✅ Railway Environment Variables
- ✅ `.env.local` для локальной разработки (в `.gitignore`)
- ✅ `.env.example` с placeholder значениями (можно коммитить)

---

## 📞 Поддержка

**Если что-то не работает:**

1. Проверить Railway логи:
   - Railway Dashboard → Deployments → View logs

2. Проверить переменные:
   - Railway Dashboard → Variables
   - Убедиться что все 8 переменных добавлены

3. Проверить OAuth настройки:
   - Google Cloud Console → Credentials
   - GitHub Settings → OAuth Apps
   - Убедиться что callback URLs правильные

4. Проверить что Railway URL правильный во всех местах:
   - `NEXTAUTH_URL`
   - `NEXT_PUBLIC_APP_URL`
   - Google OAuth redirect URI
   - GitHub OAuth callback URL

---

## 🎉 Готово!

Теперь ваш Daily Companion работает в production с OAuth авторизацией!

**Ваш сайт:** `https://ваш-railway-url.up.railway.app`

**Следующие шаги:**
1. Настроить Cloudflare ([CLOUDFLARE_WAF_SETUP.md](CLOUDFLARE_WAF_SETUP.md))
2. Добавить rate limiting ([RATE_LIMITING_SETUP.md](RATE_LIMITING_SETUP.md))
3. Настроить custom domain (опционально)

---

**Создано:** 11 января 2026
**Версия:** 1.0.0
**Автор:** Claude Code AI

Good luck! 🚀
