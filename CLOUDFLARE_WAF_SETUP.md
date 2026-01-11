# ☁️ Cloudflare WAF Configuration - Daily Companion

## Quick Setup (15 минут)

### Step 1: Add Site to Cloudflare

1. Go to [cloudflare.com](https://dash.cloudflare.com) → Sign Up/Login
2. Click **"Add Site"**
3. Enter your domain (e.g., `daily-companion.com`)
4. Choose **Free Plan** → Continue
5. Cloudflare will scan DNS records
6. Click **Continue**

### Step 2: Update Nameservers

Cloudflare will show you 2 nameservers:
```
e.g.:
- ns1.cloudflare.com
- ns2.cloudflare.com
```

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Replace existing nameservers with Cloudflare's
3. Wait 5-30 minutes for DNS propagation

### Step 3: SSL/TLS Settings

**Cloudflare Dashboard → SSL/TLS**

1. **Overview:**
   - Encryption mode: **Full (strict)**

2. **Edge Certificates:**
   - Always Use HTTPS: **ON**
   - Minimum TLS Version: **TLS 1.2**
   - Automatic HTTPS Rewrites: **ON**
   - Certificate Transparency Monitoring: **ON**

### Step 4: Security Settings

**Cloudflare Dashboard → Security**

1. **Security Level:** Medium
2. **Challenge Passage:** 30 minutes
3. **Browser Integrity Check:** ON
4. **Privacy Pass:** ON

---

## 🔥 WAF Rules Configuration

### Rule 1: Login Protection (Brute Force)

**Dashboard → Security → WAF → Create rule**

```yaml
Rule Name: Block Brute Force Login
Field: URI Path
Operator: equals
Value: /api/auth/login

AND

Field: Request Method
Operator: equals
Value: POST

AND (Rate Limiting)
Requests: 5 per 1 minute
Action: Block
Duration: 1 hour

Then: Block
Response: Custom HTML
Status Code: 429
```

**Custom HTML Response:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Too Many Requests</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            color: white;
        }
        .container {
            text-align: center;
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        h1 { font-size: 48px; margin: 0 0 20px 0; }
        p { font-size: 18px; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="container">
        <h1>⏳ Too Many Login Attempts</h1>
        <p>Please wait 1 hour before trying again.</p>
        <p>If you need help, contact support.</p>
    </div>
</body>
</html>
```

### Rule 2: API Rate Limiting

```yaml
Rule Name: API Rate Limit
Field: URI Path
Operator: starts with
Value: /api/

AND (Rate Limiting)
Requests: 100 per 1 minute
Action: Challenge (CAPTCHA)

Then: Managed Challenge
```

### Rule 3: Registration Protection

```yaml
Rule Name: Registration Spam Protection
Field: URI Path
Operator: equals
Value: /api/auth/register

AND

Field: Request Method
Operator: equals
Value: POST

AND (Rate Limiting)
Requests: 3 per 5 minutes
Action: Block

Then: Block
Duration: 24 hours
```

### Rule 4: Bot Detection

```yaml
Rule Name: Block Bad Bots
Field: User Agent
Operator: contains
Value: sqlmap|nikto|nmap|masscan|metasploit

OR

Field: User Agent
Operator: does not contain
Value: Mozilla

Then: Block
```

### Rule 5: SQL Injection Prevention

```yaml
Rule Name: SQL Injection Protection
Field: URI Query String
Operator: contains
Value: union select|concat(|base64_decode|sleep(

OR

Field: Request Body
Operator: contains
Value: ' OR '1'='1|' OR 1=1|admin'--

Then: Block
Response: Custom Error Page
```

---

## 🎯 Page Rules (для оптимизации)

**Dashboard → Rules → Page Rules**

### Rule 1: Cache Static Assets

```yaml
URL Pattern: *daily-companion.com/*.(jpg|jpeg|png|gif|svg|css|js|woff|woff2|ttf)
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 4 hours
```

### Rule 2: Security for API

```yaml
URL Pattern: *daily-companion.com/api/*
Settings:
  - Security Level: High
  - Cache Level: Bypass
  - Disable Performance
```

### Rule 3: Optimize Landing Page

```yaml
URL Pattern: daily-companion.com/
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 2 hours
  - Auto Minify: JavaScript, CSS, HTML
```

---

## 🔐 Firewall Rules (Advanced)

### Country Block (опционально)

Если хотите блокировать определенные страны:

```yaml
Rule Name: Geo Block High-Risk Countries
Field: Country
Operator: is in
Value: [выберите страны для блокировки]

Then: Block
```

**Рекомендуемые для блокировки (если не ожидаете оттуда трафик):**
- Известные источники спама
- Страны с высокой bot активностью

### IP Reputation

```yaml
Rule Name: Block Low Reputation IPs
Field: Threat Score
Operator: greater than
Value: 30

Then: Managed Challenge
```

---

## ⚡ Rate Limiting Rules (Summary)

| Endpoint | Limit | Action | Duration |
|----------|-------|--------|----------|
| `/api/auth/login` | 5/min | Block | 1 hour |
| `/api/auth/register` | 3/5min | Block | 24 hours |
| `/api/*` | 100/min | Challenge | N/A |
| All pages | 300/min | Challenge | N/A |

---

## 📊 Testing Your Setup

### Test 1: Login Rate Limit

```bash
# Попробуйте 6 раз подряд
for i in {1..6}; do
  curl -X POST https://your-domain.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}'
  echo "Attempt $i"
done

# 6-й запрос должен вернуть 429 или block page
```

### Test 2: Check Security Headers

```bash
curl -I https://your-domain.com

# Должны быть:
# - cf-ray: [Cloudflare ID]
# - x-frame-options: DENY
# - strict-transport-security: max-age=...
```

### Test 3: Verify SSL

```bash
# Проверить SSL сертификат
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Должно быть:
# - Verify return code: 0 (ok)
# - Certificate chain from Cloudflare
```

---

## 🎨 Custom Error Pages

**Dashboard → Custom Pages**

### 1000 Error (DNS)
```html
Custom HTML with your branding
```

### 429 Error (Rate Limited)
```html
<html>
<body style="font-family: Arial; text-align: center; padding: 50px;">
    <h1>🚫 Too Many Requests</h1>
    <p>Please slow down and try again in a few minutes.</p>
</body>
</html>
```

### 5xx Errors (Server Error)
```html
<html>
<body style="font-family: Arial; text-align: center; padding: 50px;">
    <h1>⚠️ Temporary Service Issue</h1>
    <p>We're working on it. Please try again in a moment.</p>
</body>
</html>
```

---

## 📱 Mobile Optimization

**Dashboard → Speed → Optimization**

Enable:
- ✅ Auto Minify (HTML, CSS, JS)
- ✅ Rocket Loader (defer JS)
- ✅ Mirage (image optimization)
- ✅ Polish (image compression) - Pro plan only

---

## 🔍 Analytics & Monitoring

**Dashboard → Analytics & Logs**

Monitor:
- Total requests
- Blocked requests
- Threat score distribution
- Top attacking countries
- Top blocked URIs

**Set up Email Alerts:**
1. Dashboard → Notifications
2. Enable "Security Events"
3. Add your email
4. Get notified on attacks

---

## 🚀 Performance Settings

**Dashboard → Speed**

### Caching:
- Caching Level: **Standard**
- Browser Cache TTL: **4 hours**
- Always Online: **ON**

### Auto Minify:
- ✅ JavaScript
- ✅ CSS
- ✅ HTML

### Brotli:
- ✅ Enable

---

## 🎯 Priority Order

Cloudflare processes rules in this order:
1. IP Access Rules
2. Firewall Rules (WAF)
3. Rate Limiting
4. Page Rules
5. Origin Rules

Make sure critical security rules are at the top!

---

## 💰 Costs

**Free Plan includes:**
- ✅ Unlimited DDoS protection
- ✅ 5 Page Rules
- ✅ 5 Firewall Rules
- ✅ Shared SSL certificate
- ✅ CDN (Unlimited bandwidth!)
- ✅ Web Analytics

**Pro Plan ($20/month) adds:**
- 20 Page Rules
- 20 Firewall Rules
- Image optimization (Polish)
- Mobile optimization (Mirage)
- WAF managed rulesets

**For Daily Companion: Free plan is enough!**

---

## ✅ Final Checklist

Before going live:

- [ ] Domain added to Cloudflare
- [ ] Nameservers updated
- [ ] SSL/TLS set to Full (strict)
- [ ] All 5 WAF rules created
- [ ] Page rules configured
- [ ] Custom error pages set
- [ ] Analytics enabled
- [ ] Email notifications set up
- [ ] Test all rules
- [ ] Monitor for 24 hours

---

## 🆘 Troubleshooting

### Site not loading
- Check nameservers (use: `nslookup your-domain.com`)
- Verify DNS records in Cloudflare
- Wait up to 48 hours for full propagation

### Too many legitimate requests blocked
- Lower rate limits
- Check Analytics → Security Events
- Whitelist your IP: Security → WAF → Tools → IP Access Rules

### SSL errors
- Change SSL mode to "Full" (not strict) temporarily
- Verify origin server has SSL certificate
- Check "Always Use HTTPS" is ON

---

## 📚 Additional Resources

- [Cloudflare Docs](https://developers.cloudflare.com/)
- [WAF Best Practices](https://developers.cloudflare.com/waf/)
- [Rate Limiting Guide](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- [Community Forum](https://community.cloudflare.com/)

---

**Setup Time:** 15-20 minutes
**Protection Level:** 70-80%
**Cost:** $0 (Free tier)
**Recommended for:** MVP, early-stage startups, small projects

Your site will be protected from 99% of common attacks with just Cloudflare Free! 🎉
