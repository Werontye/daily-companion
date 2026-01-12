# 🚀 GitHub Deployment Guide

## ✅ Security Check Complete

Ваш проект готов к безопасному деплою на GitHub! Все секреты защищены.

### Что защищено:

✅ `.env` файлы в `.gitignore` (не попадут в GitHub)
✅ `.env.example` содержит только примеры (безопасно)
✅ Нет паролей в коде
✅ Нет API ключей в коде
✅ OAuth secrets НЕ включены
✅ Node_modules исключены
✅ Build артефакты исключены

---

## 📤 Push to GitHub

### Option 1: Через GitHub Website (Рекомендуется для новичков)

**Step 1: Создать репозиторий на GitHub**

1. Открыть [github.com](https://github.com)
2. Click **"New repository"** (зеленая кнопка справа)
3. Заполнить:
   - Repository name: `daily-companion`
   - Description: `Your Personal Productivity Partner - Modern task management with Pomodoro, templates, and analytics`
   - Visibility:
     - ✅ **Public** - если хотите показать миру
     - ⭕ **Private** - если хотите закрытый доступ
   - ❌ **НЕ** инициализировать с README (у нас уже есть)
4. Click **"Create repository"**

**Step 2: Push existing repository**

GitHub покажет команды. Скопируйте и выполните:

```bash
cd c:\Users\chann\OneDrive\Desktop\Web\daily-companion

# Добавить remote
git remote add origin https://github.com/YOUR_USERNAME/daily-companion.git

# Переименовать branch в main (если нужно)
git branch -M main

# Push
git push -u origin main
```

**Замените `YOUR_USERNAME` на ваш GitHub username!**

### Option 2: Через GitHub Desktop (Самый простой)

1. Скачать [GitHub Desktop](https://desktop.github.com/)
2. Установить и войти в аккаунт
3. File → Add Local Repository
4. Выбрать: `c:\Users\chann\OneDrive\Desktop\Web\daily-companion`
5. Publish repository → Выбрать Public/Private
6. Click **Publish**

Готово! 🎉

---

## 🔐 После Push - Security Setup

### 1. Настроить GitHub Secrets (для CI/CD)

**Settings → Secrets and variables → Actions → New repository secret**

Добавить секреты (если планируете GitHub Actions):

```
NEXTAUTH_SECRET=your-generated-secret
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
GITHUB_CLIENT_ID=your-github-id
GITHUB_CLIENT_SECRET=your-github-secret
```

**⚠️ ВАЖНО:** Эти секреты ТОЛЬКО для CI/CD. Для production используйте Railway environment variables!

### 2. Enable Security Features

**Settings → Security**

Enable:
- ✅ **Dependency alerts** - уведомления о уязвимых зависимостях
- ✅ **Dependabot alerts** - автоматические PR для обновлений
- ✅ **Code scanning** - автоматическое сканирование кода
- ✅ **Secret scanning** - поиск случайно закоммиченных секретов

### 3. Add Security Policy

Уже добавлено! Файл `SECURITY.md` автоматически появится в:
**Security → Policy**

### 4. Configure Branch Protection

**Settings → Branches → Add rule**

```
Branch name pattern: main

Enable:
✅ Require pull request before merging
✅ Require status checks to pass
✅ Require conversation resolution before merging
✅ Do not allow bypassing the above settings
```

---

## 📝 Update README with your info

После push, обновите `README.md`:

```bash
# Замените YOUR_USERNAME на ваш реальный username
git clone https://github.com/YOUR_USERNAME/daily-companion.git

# Обновите ссылки в README
# Найти и заменить: YOUR_USERNAME → ваш username
```

---

## 🌐 Deploy to Railway from GitHub

### Step 1: Connect Railway to GitHub

1. Go to [railway.app](https://railway.app)
2. Login with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose `daily-companion`

### Step 2: Add Environment Variables

**Railway Dashboard → Variables**

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-project.railway.app
NEXTAUTH_SECRET=<generate new with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-project.railway.app

# OAuth (опционально)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Step 3: Deploy

Railway автоматически задеплоит! Получите URL:
```
https://your-project-name.railway.app
```

---

## 🔄 Update OAuth Callback URLs

После получения production URL, обновите callback URLs:

### Google OAuth Console

```
Authorized redirect URIs:
https://your-project.railway.app/api/auth/callback/google
```

### GitHub OAuth App

```
Authorization callback URL:
https://your-project.railway.app/api/auth/callback/github
```

---

## ☁️ Setup Cloudflare (Recommended)

### Step 1: Add Domain

1. [cloudflare.com](https://dash.cloudflare.com) → Add Site
2. Enter: `daily-companion.com` (или ваш домен)
3. Choose Free plan

### Step 2: Update DNS

```
Type: CNAME
Name: @
Content: your-project.railway.app
Proxy: Enabled (оранжевое облако)
```

### Step 3: Configure WAF

Следовать: [CLOUDFLARE_WAF_SETUP.md](CLOUDFLARE_WAF_SETUP.md)

---

## 🎨 Setup Custom Domain (Optional)

### Railway Custom Domain

1. Railway Dashboard → Settings
2. Custom Domain → Add Domain
3. Enter: `daily-companion.com`
4. Add DNS records (Railway покажет)

### Cloudflare + Railway

```
Cloudflare DNS:
CNAME @ → your-project.railway.app (Proxied)

Railway:
Custom Domain: daily-companion.com
```

---

## 🔍 Verify Security

После деплоя, проверьте:

```bash
# 1. Check security headers
curl -I https://your-domain.com

# Должны быть:
# - x-frame-options: DENY
# - content-security-policy: ...
# - strict-transport-security: ...

# 2. Check SSL
curl -I https://your-domain.com | grep -i ssl

# 3. Test OAuth
# Открыть: https://your-domain.com/auth/login
# Попробовать Google/GitHub login

# 4. Check Cloudflare
curl -I https://your-domain.com | grep cf-ray
# Должен быть cf-ray header
```

---

## 📊 Setup Analytics

### Google Analytics (Optional)

1. Создать property на [analytics.google.com](https://analytics.google.com)
2. Получить Measurement ID (G-XXXXXXXXXX)
3. Добавить в Railway:
   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

### Cloudflare Web Analytics (Free!)

1. Cloudflare Dashboard → Analytics → Web Analytics
2. Add site
3. Copy JS snippet
4. Добавить в `src/app/layout.tsx`

---

## 🎯 Post-Deployment Checklist

После успешного деплоя:

- [ ] Проект на GitHub (public/private)
- [ ] Railway deployment работает
- [ ] Environment variables настроены
- [ ] OAuth callbacks обновлены
- [ ] Cloudflare настроен (опционально)
- [ ] WAF rules добавлены
- [ ] Custom domain подключен (опционально)
- [ ] Security headers проверены
- [ ] SSL работает (HTTPS)
- [ ] OAuth login работает
- [ ] Все страницы загружаются
- [ ] Analytics настроена (опционально)
- [ ] Error monitoring (Sentry) (опционально)

---

## 🐛 Troubleshooting

### "Repository not found"
```bash
# Проверить remote URL
git remote -v

# Обновить если нужно
git remote set-url origin https://github.com/YOUR_USERNAME/daily-companion.git
```

### "Authentication failed"
```bash
# Сгенерировать Personal Access Token
# GitHub → Settings → Developer settings → Personal access tokens
# Использовать токен вместо пароля
```

### "Railway deployment failed"
- Проверить логи в Railway Dashboard
- Убедиться что все environment variables установлены
- Проверить `package.json` scripts

### "OAuth not working"
- Проверить callback URLs
- Убедиться что NEXTAUTH_URL правильный
- Проверить NEXTAUTH_SECRET установлен
- Check Railway logs

---

## 📚 Next Steps

После деплоя:

1. **Monitor Performance**
   - Railway Dashboard → Metrics
   - Cloudflare Analytics

2. **Setup Monitoring**
   - [RATE_LIMITING_SETUP.md](RATE_LIMITING_SETUP.md)
   - Install Sentry for error tracking

3. **Improve Security**
   - Add rate limiting
   - Configure Cloudflare WAF
   - Setup backups

4. **Scale**
   - Monitor user growth
   - Optimize database queries
   - Add caching (Redis)

---

## 🎉 Congratulations!

Ваш проект теперь на GitHub и задеплоен!

**Live URL:** https://your-project.railway.app

**GitHub:** https://github.com/YOUR_USERNAME/daily-companion

**Security:** Protected by Cloudflare + Security headers

---

## 📞 Need Help?

- 📖 [Railway Docs](https://docs.railway.app/)
- 📖 [GitHub Docs](https://docs.github.com/)
- 📖 [Cloudflare Docs](https://developers.cloudflare.com/)
- 💬 [Railway Discord](https://discord.gg/railway)
- 💬 [GitHub Community](https://github.community/)

---

**Created:** January 11, 2026
**Version:** 1.0.0
**Author:** Claude Code AI

Good luck with your launch! 🚀
