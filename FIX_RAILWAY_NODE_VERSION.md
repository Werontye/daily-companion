# 🔧 Исправление: Node.js версия для Railway

## ❌ Проблема

Railway использовал **Node.js 18.20.5**, а Next.js 16 требует **Node.js ≥20.9.0**

```
You are using Node.js 18.20.5. For Next.js, Node.js version ">=20.9.0" is required.
Build Failed: exit code: 1
```

## ✅ Решение

Создан файл `nixpacks.toml` который указывает Railway использовать **Node.js 20**.

---

## 🚀 Что делать сейчас:

### Шаг 1: Запушить изменения на GitHub

```bash
# Проверить что коммит создан
git log -1
# Должно показать: "Fix: Add nixpacks.toml to use Node.js 20..."

# Запушить на GitHub
git push
```

### Шаг 2: Railway автоматически передеплоит

После `git push` Railway автоматически:
1. Обнаружит новый коммит на GitHub
2. Запустит новый build
3. Использует Node.js 20 (из `nixpacks.toml`)
4. Build пройдет успешно ✅

**Время:** ~3-5 минут

### Шаг 3: Проверить логи

1. Открыть Railway Dashboard
2. Перейти в ваш проект
3. Нажать на последний Deployment
4. Проверить логи

**Должно быть:**
```
╔════════ Nixpacks v1.41.0 ═══════╗
║ setup      │ nodejs_20, npm-10_x ║  ← Node.js 20! ✅
║─────────────────────────────────║
║ install    │ npm ci              ║
║─────────────────────────────────║
║ build      │ npm run build       ║  ← Должен пройти успешно
║─────────────────────────────────║
║ start      │ npm run start       ║
╚═════════════════════════════════╝

Build Successful! ✅
```

---

## 📝 Что было сделано:

### Создан файл: `nixpacks.toml`

```toml
[phases.setup]
nixPkgs = ['nodejs_20', 'npm-10_x']  # Node.js 20 + npm 10

[phases.install]
cmds = ['npm ci']

[phases.build]
cmds = ['npm run build']

[start]
cmd = 'npm run start'
```

Этот файл говорит Railway:
- ✅ Использовать Node.js 20
- ✅ Использовать npm 10
- ✅ Запускать правильные команды для Next.js

---

## 🔍 Проверка после деплоя:

### 1. Проверить что build успешен

Railway → Deployments → Latest → **Status: Success** ✅

### 2. Открыть сайт

```
https://ваш-railway-url.up.railway.app
```

Должна открыться главная страница.

### 3. Проверить что нет ошибок

Railway → Deployments → View Logs → Должно быть:
```
✓ Compiled successfully
✓ Build completed
Server listening on port 3000
```

---

## ⚠️ Если build всё равно упал:

### Проблема 1: Railway не видит nixpacks.toml

**Решение:**
```bash
# Убедитесь что файл закоммичен
git status
# Должно быть "nothing to commit, working tree clean"

# Если файл не закоммичен:
git add nixpacks.toml
git commit -m "Add nixpacks.toml"
git push
```

### Проблема 2: Другая ошибка в логах

**Проверьте:**
1. Railway → Variables → Все переменные добавлены?
2. Railway → Logs → Какая именно ошибка?

**Возможные ошибки:**

**Ошибка:** `Module not found: Can't resolve 'next-auth/react'`
**Решение:** Проверить что в `package.json` есть `next-auth` в dependencies

**Ошибка:** `NEXTAUTH_SECRET is not defined`
**Решение:** Добавить переменную `NEXTAUTH_SECRET` в Railway Variables

---

## 📊 Сравнение версий:

| До исправления | После исправления |
|----------------|-------------------|
| Node.js 18.20.5 ❌ | Node.js 20.x ✅ |
| npm 9.x | npm 10.x ✅ |
| Build Failed ❌ | Build Success ✅ |

---

## ✅ Чеклист:

- [x] Создан файл `nixpacks.toml`
- [x] Файл закоммичен в git
- [ ] Запушить на GitHub (`git push`)
- [ ] Дождаться деплоя Railway (~3-5 мин)
- [ ] Проверить логи (должен быть Success)
- [ ] Открыть сайт и проверить что работает

---

## 🎯 Следующие шаги после успешного деплоя:

1. **Добавить переменные окружения** (если еще не добавили)
   - См. [RAILWAY_SETUP_COMPLETE.md](RAILWAY_SETUP_COMPLETE.md)

2. **Настроить OAuth** (опционально)
   - Google OAuth: раздел 4 в RAILWAY_SETUP_COMPLETE.md
   - GitHub OAuth: раздел 5 в RAILWAY_SETUP_COMPLETE.md

3. **Настроить Cloudflare** (для безопасности)
   - См. [CLOUDFLARE_WAF_SETUP.md](CLOUDFLARE_WAF_SETUP.md)

---

**Создано:** 12 января 2026
**Проблема:** Node.js 18 → Next.js 16 несовместимость
**Решение:** nixpacks.toml с Node.js 20
**Статус:** ✅ Исправлено, готово к деплою

Удачи! 🚀
