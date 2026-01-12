# OAuth Setup Guide

This guide will help you set up OAuth authentication for Google, GitHub, and Spotify.

## Table of Contents
- [Google OAuth Setup](#google-oauth-setup)
- [GitHub OAuth Setup](#github-oauth-setup)
- [Spotify OAuth Setup](#spotify-oauth-setup)

---

## Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "Daily Companion")
4. Click "Create"

### Step 2: Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required information:
   - **App name**: Daily Companion
   - **User support email**: your email
   - **Developer contact information**: your email
5. Click "Save and Continue"
6. On "Scopes" page, click "Save and Continue"
7. On "Test users" page, add your email for testing
8. Click "Save and Continue"

### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Enter name (e.g., "Daily Companion Web")
5. Add **Authorized JavaScript origins**:
   ```
   http://localhost:3003
   https://your-domain.railway.app
   ```
6. Add **Authorized redirect URIs**:
   ```
   http://localhost:3003/api/auth/callback/google
   https://your-domain.railway.app/api/auth/callback/google
   ```
7. Click "Create"
8. **Copy your Client ID and Client Secret**

### Step 5: Add to Environment Variables

Add to your `.env.local` (local) and Railway Variables (production):

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

---

## GitHub OAuth Setup

### Step 1: Create OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in the information:
   - **Application name**: Daily Companion
   - **Homepage URL**: `http://localhost:3003` (for local) or `https://your-domain.railway.app`
   - **Authorization callback URL**: `http://localhost:3003/api/auth/callback/github`
4. Click "Register application"

### Step 2: Generate Client Secret

1. Click "Generate a new client secret"
2. **Copy your Client ID and Client Secret immediately** (you won't be able to see the secret again)

### Step 3: Add Production Callback URL

If you're deploying to production:
1. Go back to your OAuth App settings
2. Update **Authorization callback URL** to include production URL:
   ```
   https://your-domain.railway.app/api/auth/callback/github
   ```

   Or create a separate OAuth App for production.

### Step 4: Add to Environment Variables

Add to your `.env.local` (local) and Railway Variables (production):

```env
GITHUB_CLIENT_ID=your-client-id-here
GITHUB_CLIENT_SECRET=your-client-secret-here
```

---

## Spotify OAuth Setup

### Step 1: Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create app"
4. Fill in the information:
   - **App name**: Daily Companion
   - **App description**: Productivity app with Spotify integration
   - **Redirect URI**: `http://localhost:3003/api/spotify/callback`
   - Check "Web API" and "Web Playback SDK"
5. Accept Terms of Service
6. Click "Save"

### Step 2: Get Your Credentials

1. In your app dashboard, click "Settings"
2. **Copy your Client ID**
3. Click "View client secret" and **copy your Client Secret**

### Step 3: Add Redirect URIs

1. In "Settings", scroll to "Redirect URIs"
2. Add both local and production URLs:
   ```
   http://localhost:3003/api/spotify/callback
   https://your-domain.railway.app/api/spotify/callback
   ```
3. Click "Add"
4. Click "Save"

### Step 4: Add to Environment Variables

Add to your `.env.local` (local) and Railway Variables (production):

**For Local Development:**
```env
SPOTIFY_CLIENT_ID=your-client-id-here
SPOTIFY_CLIENT_SECRET=your-client-secret-here
SPOTIFY_REDIRECT_URI=http://localhost:3003/api/spotify/callback
```

**For Production (Railway):**
```env
SPOTIFY_CLIENT_ID=your-client-id-here
SPOTIFY_CLIENT_SECRET=your-client-secret-here
SPOTIFY_REDIRECT_URI=https://your-domain.railway.app/api/spotify/callback
```

---

## Complete Environment Variables Reference

After completing all setups, your environment variables should look like this:

### Local Development (`.env.local`)

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3003

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/daily-companion

# Authentication
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=http://localhost:3003

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Spotify OAuth
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=http://localhost:3003/api/spotify/callback
```

### Production (Railway Variables)

```env
# App
NEXT_PUBLIC_APP_URL=https://your-domain.railway.app

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/daily-companion

# Authentication
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=https://your-domain.railway.app

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Spotify OAuth
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=https://your-domain.railway.app/api/spotify/callback
```

---

## Testing OAuth

### Test Google OAuth
1. Go to your app's login page
2. Click "Continue with Google"
3. Sign in with your Google account
4. Grant permissions
5. You should be redirected to the dashboard

### Test GitHub OAuth
1. Go to your app's login page
2. Click "Continue with GitHub"
3. Sign in with your GitHub account
4. Authorize the application
5. You should be redirected to the dashboard

### Test Spotify
1. Go to the dashboard
2. In the Spotify Player widget, click "Connect Spotify Account"
3. Sign in with your Spotify account
4. Grant permissions
5. You should see your current playing track (if any)

---

## Troubleshooting

### Google OAuth Issues
- **Redirect URI mismatch**: Make sure the redirect URI in Google Console exactly matches your app's callback URL
- **Access blocked**: Make sure you added yourself as a test user in OAuth consent screen

### GitHub OAuth Issues
- **Callback URL mismatch**: Verify the callback URL in GitHub matches exactly
- **Rate limits**: GitHub has rate limits for OAuth; wait a few minutes if you hit them

### Spotify OAuth Issues
- **Invalid redirect URI**: Double-check the redirect URI in Spotify dashboard
- **Scope permissions**: Make sure all required scopes are requested in the code

---

## Security Notes

⚠️ **Never commit your `.env.local` file to Git**

✅ The `.gitignore` file already excludes `.env.local`

✅ Always use environment variables for secrets

✅ Rotate your secrets regularly in production

✅ Use different OAuth apps for development and production when possible

---

Need help? Check the official documentation:
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)
- [Spotify OAuth Documentation](https://developer.spotify.com/documentation/web-api/concepts/authorization)
