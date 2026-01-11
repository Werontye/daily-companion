# OAuth Setup Guide

This guide will help you set up OAuth authentication with Google and GitHub.

## Prerequisites

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Generate a secure NextAuth secret:
```bash
openssl rand -base64 32
```

Add it to `.env.local`:
```
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3003
```

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project (e.g., "Daily Companion")
4. Click "Create"

### 2. Enable Google+ API

1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type → Click "Create"
3. Fill in the required fields:
   - App name: Daily Companion
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
4. Click "Save and Continue"
5. Skip "Scopes" → Click "Save and Continue"
6. Add test users if needed → Click "Save and Continue"

### 4. Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "Daily Companion Web"
5. Authorized redirect URIs:
   - `http://localhost:3003/api/auth/callback/google`
   - `https://your-production-domain.com/api/auth/callback/google` (for production)
6. Click "Create"
7. Copy the **Client ID** and **Client Secret**

### 5. Add to .env.local

```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

## GitHub OAuth Setup

### 1. Create OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in the fields:
   - Application name: Daily Companion
   - Homepage URL: `http://localhost:3003`
   - Authorization callback URL: `http://localhost:3003/api/auth/callback/github`
4. Click "Register application"

### 2. Generate Client Secret

1. Click "Generate a new client secret"
2. Copy the **Client ID** and **Client Secret** immediately (you won't see it again!)

### 3. Add to .env.local

```env
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here
```

## Microsoft OAuth Setup (Optional)

### 1. Register App in Azure

1. Go to [Azure Portal](https://portal.azure.com/)
2. Search for "Azure Active Directory" or "Microsoft Entra ID"
3. Click "App registrations" → "New registration"
4. Fill in:
   - Name: Daily Companion
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI:
     - Platform: Web
     - URI: `http://localhost:3003/api/auth/callback/azure-ad`
5. Click "Register"

### 2. Get Client ID and Secret

1. Copy the **Application (client) ID**
2. Go to "Certificates & secrets" → "Client secrets" → "New client secret"
3. Add description: "Daily Companion Secret"
4. Expiration: Choose your preference
5. Click "Add"
6. **Copy the secret value immediately** (you won't see it again!)

### 3. Add to .env.local

```env
MICROSOFT_CLIENT_ID=your-microsoft-client-id-here
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret-here
```

### 4. Update auth.ts

Uncomment Microsoft provider in `src/auth.ts`:

```typescript
import Microsoft from "next-auth/providers/microsoft"

providers: [
  Google({...}),
  GitHub({...}),
  Microsoft({
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  }),
]
```

## Production Deployment

When deploying to production (Railway, Vercel, etc.):

1. Update redirect URIs in all OAuth apps to use your production domain
2. Add all environment variables to your hosting platform
3. Update `NEXTAUTH_URL` to your production URL:
   ```
   NEXTAUTH_URL=https://your-domain.railway.app
   ```

## Testing

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3003/auth/login`

3. Click on "Google" or "GitHub" button

4. You should be redirected to the OAuth provider, then back to your dashboard!

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the redirect URI in your OAuth app exactly matches: `http://localhost:3003/api/auth/callback/google` (or github)
- Check that there are no trailing slashes
- Verify the port number matches (3003)

### "Invalid client" error
- Double-check your Client ID and Client Secret in `.env.local`
- Make sure there are no extra spaces
- Restart your dev server after changing `.env.local`

### Session not persisting
- Check that `NEXTAUTH_SECRET` is set correctly
- Clear your browser cookies and try again
- Check browser console for errors

## Security Notes

- **Never commit `.env.local` to git** - it's already in `.gitignore`
- Rotate secrets regularly in production
- Use different OAuth apps for development and production
- Enable 2FA on your Google/GitHub accounts
- Monitor OAuth app usage in respective dashboards
