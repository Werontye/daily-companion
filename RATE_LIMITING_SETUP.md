# Rate Limiting Setup - Quick Start

## Зачем это нужно?

**Без rate limiting:**
- ❌ Злоумышленник может отправить 1,000,000 запросов
- ❌ Ваш счет за serverless может достичь $1000+
- ❌ Сервер упадет от перегрузки
- ❌ Brute force атаки на пароли

**С rate limiting:**
- ✅ Максимум 10 попыток логина в минуту
- ✅ Защита от DDoS
- ✅ Контролируемые затраты
- ✅ Стабильная работа

## Быстрая установка (5 минут)

### Шаг 1: Установить зависимости

```bash
npm install @upstash/ratelimit @upstash/redis
```

### Шаг 2: Создать бесплатный Redis на Upstash

1. Зайти на [upstash.com](https://upstash.com)
2. Sign up (бесплатно)
3. Create Database:
   - Name: daily-companion-rate-limit
   - Type: Regional
   - Region: Выберите ближайший (EU/US)
   - TLS: Enabled
4. Copy credentials:
   - REST URL
   - REST Token

### Шаг 3: Добавить в .env.local

```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### Шаг 4: Создать lib/ratelimit.ts

```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Создаем Redis клиент
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Rate limiters для разных сценариев
export const ratelimits = {
  // Логин/регистрация - строгий лимит
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 попыток в минуту
    analytics: true,
    prefix: "ratelimit:auth",
  }),

  // Обычные API запросы
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 запросов в минуту
    analytics: true,
    prefix: "ratelimit:api",
  }),

  // Критичные операции (смена пароля, удаление аккаунта)
  strict: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 попытки в час
    analytics: true,
    prefix: "ratelimit:strict",
  }),
}

// Утилита для получения IP
export function getIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(',')[0] :
             request.headers.get("x-real-ip") ||
             "anonymous"
  return ip.trim()
}
```

### Шаг 5: Применить к API routes

**Пример: src/app/api/auth/login/route.ts**

```typescript
import { ratelimits, getIP } from "@/lib/ratelimit"

export async function POST(request: Request) {
  // Rate limiting
  const ip = getIP(request)
  const { success, limit, reset, remaining } = await ratelimits.auth.limit(ip)

  if (!success) {
    return new Response(
      JSON.stringify({
        error: "Too many requests",
        retryAfter: Math.floor((reset - Date.now()) / 1000)
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": Math.floor((reset - Date.now()) / 1000).toString()
        }
      }
    )
  }

  // Продолжаем обработку запроса...
  const { email, password } = await request.json()

  // Ваша логика логина
}
```

## Примеры для разных endpoints

### Регистрация

```typescript
// src/app/api/auth/register/route.ts
export async function POST(request: Request) {
  const { success } = await ratelimits.auth.limit(getIP(request))
  if (!success) {
    return new Response("Too many registration attempts", { status: 429 })
  }

  // ... регистрация
}
```

### Создание задачи

```typescript
// src/app/api/tasks/route.ts
export async function POST(request: Request) {
  const { success } = await ratelimits.api.limit(getIP(request))
  if (!success) {
    return new Response("Too many requests", { status: 429 })
  }

  // ... создание задачи
}
```

### Смена пароля

```typescript
// src/app/api/user/change-password/route.ts
export async function POST(request: Request) {
  const { success } = await ratelimits.strict.limit(getIP(request))
  if (!success) {
    return new Response("Too many password change attempts", { status: 429 })
  }

  // ... смена пароля
}
```

## Тестирование

### Тест 1: Проверка лимита

```bash
# Отправить 10 запросов (лимит 5/мин на auth)
for i in {1..10}; do
  curl -X POST http://localhost:3003/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}' \
    -w "\nStatus: %{http_code}\n"
done

# Первые 5 запросов: 200 OK
# Следующие 5 запросов: 429 Too Many Requests
```

### Тест 2: Проверка reset

```bash
# После 1 минуты лимит сбросится
sleep 60
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'

# Должен вернуть 200 OK
```

## Production конфигурация

### Railway Environment Variables

1. Go to Railway Dashboard
2. Select your project
3. Variables tab → New Variable:

```
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### Vercel Environment Variables

```bash
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
```

## Мониторинг

### Upstash Dashboard

1. Зайти на upstash.com
2. Databases → Выбрать вашу БД
3. Analytics tab:
   - Requests per second
   - Hit/Miss ratio
   - Blocked requests (rate limited)

### Добавить логирование

```typescript
export async function POST(request: Request) {
  const ip = getIP(request)
  const { success, limit, reset, remaining } = await ratelimits.auth.limit(ip)

  // Логируем блокированные запросы
  if (!success) {
    console.warn(`Rate limit exceeded for IP: ${ip}`, {
      endpoint: request.url,
      remaining: 0,
      reset: new Date(reset)
    })
  }

  // ...
}
```

## Настройка лимитов

### Алгоритмы

1. **Fixed Window** - простой счетчик
   ```typescript
   Ratelimit.fixedWindow(10, "1 m") // 10 запросов в минуту
   ```

2. **Sliding Window** - более гладкий (рекомендуется)
   ```typescript
   Ratelimit.slidingWindow(10, "1 m") // 10 запросов в минуту
   ```

3. **Token Bucket** - для burst requests
   ```typescript
   Ratelimit.tokenBucket(10, "1 s", 100) // 10/сек, макс 100
   ```

### Рекомендуемые значения

**Authentication:**
```typescript
// Логин/регистрация
Ratelimit.slidingWindow(5, "1 m")     // 5 попыток/минуту

// OAuth callback
Ratelimit.slidingWindow(10, "1 m")    // 10 попыток/минуту

// Смена пароля
Ratelimit.slidingWindow(3, "1 h")     // 3 попытки/час
```

**API endpoints:**
```typescript
// Чтение данных (GET)
Ratelimit.slidingWindow(200, "1 m")   // 200 запросов/минуту

// Создание данных (POST)
Ratelimit.slidingWindow(50, "1 m")    // 50 запросов/минуту

// Удаление (DELETE)
Ratelimit.slidingWindow(20, "1 m")    // 20 запросов/минуту
```

**File uploads:**
```typescript
// Загрузка файлов
Ratelimit.slidingWindow(5, "1 h")     // 5 файлов/час

// Загрузка изображений профиля
Ratelimit.slidingWindow(3, "1 d")     // 3 изменения/день
```

## Расширенная конфигурация

### Per-user rate limiting

```typescript
import { auth } from "@/auth"

export async function POST(request: Request) {
  const session = await auth()
  const identifier = session?.user?.id || getIP(request)

  const { success } = await ratelimits.api.limit(identifier)

  // Авторизованные пользователи имеют более высокий лимит
  if (!success && session) {
    // Попробовать с расширенным лимитом для auth users
    const premiumRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(500, "1 m") // 500/мин для авторизованных
    })

    const premiumCheck = await premiumRatelimit.limit(identifier)
    if (premiumCheck.success) {
      // Продолжаем
    }
  }

  // ...
}
```

### Whitelist для IP

```typescript
const WHITELISTED_IPS = new Set([
  "127.0.0.1",
  "::1",
  process.env.OFFICE_IP, // IP вашего офиса
])

export async function POST(request: Request) {
  const ip = getIP(request)

  // Пропускаем rate limiting для whitelist
  if (WHITELISTED_IPS.has(ip)) {
    // Продолжаем без проверки
  }

  const { success } = await ratelimits.api.limit(ip)
  // ...
}
```

## Troubleshooting

### "Redis connection failed"

**Проблема:** Неверные credentials

**Решение:**
```bash
# Проверить переменные окружения
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN

# Убедиться что они в .env.local
cat .env.local | grep UPSTASH

# Перезапустить dev server
npm run dev
```

### "Rate limit not working"

**Проблема:** Кеш Redis

**Решение:**
```bash
# Сбросить Redis через Upstash Dashboard
# Или через CLI:
redis-cli -u "your-redis-url" FLUSHALL
```

### "Too many 429 errors"

**Проблема:** Лимит слишком строгий

**Решение:**
```typescript
// Увеличить лимит
Ratelimit.slidingWindow(100, "1 m") // было 10, стало 100
```

## Стоимость

**Upstash Free Tier:**
- ✅ 10,000 requests/day
- ✅ Unlimited databases
- ✅ Global replication

**Upstash Pay-as-you-go:**
- $0.20 per 100K requests
- No monthly fee

**Пример расчета:**
```
1000 users × 100 requests/day = 100,000 requests/day
100,000 × 30 days = 3,000,000 requests/month

Стоимость: 3M / 100K × $0.20 = $6/месяц
```

## Дополнительные ресурсы

- [Upstash Docs](https://upstash.com/docs/redis/overall/getstarted)
- [Rate Limiting Best Practices](https://blog.upstash.com/rate-limiting)
- [GitHub Examples](https://github.com/upstash/ratelimit)

## Support

Если rate limiting не работает:
1. Проверьте переменные окружения
2. Убедитесь что Redis доступен
3. Проверьте логи в Upstash Dashboard
4. Создайте issue на GitHub: [daily-companion/issues](https://github.com/your-repo/issues)
