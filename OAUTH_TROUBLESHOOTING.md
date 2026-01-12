# OAuth Troubleshooting Guide

## Error: HTTP 500 on OAuth Login

If you're getting a 500 error when trying to sign in with Google or GitHub, follow these steps:

---

## Step 1: Check Railway Environment Variables

Go to your Railway project → Variables tab and verify:

### Required Variables:

1. **NEXTAUTH_URL**
   ```
   NEXTAUTH_URL=https://daily-companion-production.up.railway.app
   ```
   ⚠️ **IMPORTANT:**
   - Must be your EXACT Railway domain
   - NO trailing slash
   - Must use `https://` in production

2. **NEXTAUTH_SECRET**
   ```
   NEXTAUTH_SECRET=<your-generated-secret>
   ```
   Generate one using:
   ```bash
   openssl rand -base64 32
   ```

3. **GOOGLE_CLIENT_ID** and **GOOGLE_CLIENT_SECRET**
   - Get from [Google Cloud Console](https://console.cloud.google.com/)

4. **GITHUB_CLIENT_ID** and **GITHUB_CLIENT_SECRET**
   - Get from [GitHub Developer Settings](https://github.com/settings/developers)

---

## Step 2: Verify OAuth Redirect URIs

### Google OAuth (Google Cloud Console)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:
   ```
   https://daily-companion-production.up.railway.app/api/auth/callback/google
   ```
6. Click "Save"

### GitHub OAuth (GitHub Developer Settings)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on your OAuth App
3. Update **Authorization callback URL** to:
   ```
   https://daily-companion-production.up.railway.app/api/auth/callback/github
   ```
4. Click "Update application"

---

## Step 3: Check Railway Logs

1. Go to Railway → Your project → Deployments
2. Click on the latest deployment
3. View logs for any errors
4. Look for:
   - MongoDB connection errors
   - Environment variable missing errors
   - NextAuth configuration errors

Common error messages:
```
Error: NEXTAUTH_URL is not set
Error: Cannot connect to database
Error: Invalid client ID or secret
```

---

## Step 4: Test OAuth Flow

1. **Clear browser cache/cookies** for your domain
2. Go to your app's login page
3. Click "Continue with Google" or "Continue with GitHub"
4. You should be redirected to OAuth provider
5. After authorization, you should be redirected back to `/dashboard`

---

## Common Issues and Solutions

### Issue 1: "Redirect URI mismatch"
**Solution:** Make sure redirect URIs in Google/GitHub EXACTLY match:
```
https://daily-companion-production.up.railway.app/api/auth/callback/google
https://daily-companion-production.up.railway.app/api/auth/callback/github
```

### Issue 2: "NEXTAUTH_URL is not set"
**Solution:** Add `NEXTAUTH_URL` to Railway Variables (see Step 1)

### Issue 3: "Cannot connect to database"
**Solution:**
1. Check that `MONGODB_URI` is set in Railway
2. Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
3. Test connection string is correct

### Issue 4: "Invalid client credentials"
**Solution:**
1. Double-check Client ID and Client Secret are correct
2. Make sure there are no extra spaces or line breaks
3. Regenerate credentials if necessary

### Issue 5: Still getting 500 errors
**Solution:**
1. Check Railway logs for specific error
2. Verify all environment variables are set
3. Try redeploying the app after setting variables
4. Make sure your Railway domain is correct in all URLs

---

## Step 5: Force Redeploy

After changing environment variables:

1. Go to Railway → Your project
2. Go to Settings → Redeploy
3. Click "Redeploy" to apply new environment variables

OR via CLI:
```bash
railway up --detach
```

---

## Debugging Checklist

- [ ] `NEXTAUTH_URL` is set correctly in Railway
- [ ] `NEXTAUTH_SECRET` is generated and set
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- [ ] `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set
- [ ] `MONGODB_URI` is set and working
- [ ] Google redirect URI matches exactly
- [ ] GitHub callback URL matches exactly
- [ ] Railway app has been redeployed after setting variables
- [ ] Browser cache/cookies cleared
- [ ] Railway logs checked for specific errors

---

## Testing Locally

To test OAuth locally:

1. Update `.env.local`:
   ```env
   NEXTAUTH_URL=http://localhost:3003
   NEXTAUTH_SECRET=<your-secret>
   GOOGLE_CLIENT_ID=<your-id>
   GOOGLE_CLIENT_SECRET=<your-secret>
   GITHUB_CLIENT_ID=<your-id>
   GITHUB_CLIENT_SECRET=<your-secret>
   ```

2. Add local redirect URIs to OAuth providers:
   - Google: `http://localhost:3003/api/auth/callback/google`
   - GitHub: `http://localhost:3003/api/auth/callback/github`

3. Run locally:
   ```bash
   npm run dev
   ```

---

## Need More Help?

Check the logs at:
- Railway: Project → Deployments → View logs
- Browser Console: F12 → Console tab
- Network Tab: F12 → Network tab

Common log patterns to look for:
```
[NextAuth] Error:
[MongoDB] Connection failed:
Sign in error:
```

---

**Last Updated:** 2026-01-12
