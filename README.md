# 📅 Daily Companion

> Your Personal Productivity Partner

A modern, feature-rich productivity web application built with Next.js 16 and React 19. Plan your day with context-aware reminders, stay focused with Pomodoro sessions, and collaborate with shared plans.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

### 🎯 Core Functionality
- **Daily Task Management** - Organize your tasks with priorities and status tracking
- **Pomodoro Timer** - Stay focused with built-in Pomodoro technique timer
- **Templates** - Save time with reusable task templates
- **Analytics Dashboard** - Track your productivity with visual insights
- **Achievements** - Gamification with unlockable achievements
- **Shared Plans** - Collaborate with others on shared task lists

### 🎨 User Experience
- **Dark Mode** - Full dark theme support with system preference detection
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations** - Polished UI with 60 FPS transitions
- **PWA Ready** - Install as a Progressive Web App

### 🔐 Authentication
- **OAuth 2.0** - Sign in with Google or GitHub
- **Secure Sessions** - JWT-based authentication with NextAuth.js
- **Profile Management** - Customize your profile and preferences

### 🎵 Integrations
- **Spotify Player** - Play focus music directly from the app
- **Global Messenger** - Real-time communication for shared plans

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/daily-companion.git
cd daily-companion

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3003](http://localhost:3003) in your browser.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3003

# NextAuth.js
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3003

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

**⚠️ Important:** Never commit `.env.local` to version control!

### OAuth Setup (Optional)

To enable OAuth authentication:

1. **Google OAuth:**
   - Follow [OAUTH_SETUP.md](OAUTH_SETUP.md) for detailed instructions
   - Get credentials from [Google Cloud Console](https://console.cloud.google.com/)

2. **GitHub OAuth:**
   - Follow [OAUTH_SETUP.md](OAUTH_SETUP.md) for detailed instructions
   - Get credentials from [GitHub Developer Settings](https://github.com/settings/developers)

## 📦 Deployment

### Deploy to Railway

Railway offers one-click deployment with automatic HTTPS:

1. Click the button below:

   [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

2. Connect your GitHub repository
3. Add environment variables in Railway dashboard
4. Deploy!

See [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md) for detailed instructions.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Cloudflare Setup (Recommended)

For DDoS protection and WAF:

1. Add your domain to [Cloudflare](https://dash.cloudflare.com)
2. Configure WAF rules (see [CLOUDFLARE_WAF_SETUP.md](CLOUDFLARE_WAF_SETUP.md))
3. Update DNS to point to your Railway/Vercel deployment

**Free Cloudflare tier includes:**
- ✅ Unlimited DDoS protection
- ✅ Web Application Firewall (WAF)
- ✅ CDN with unlimited bandwidth
- ✅ SSL/TLS encryption

## 🛡️ Security

This project implements industry-standard security practices:

- ✅ **Security Headers** - CSP, X-Frame-Options, HSTS
- ✅ **CSRF Protection** - Origin validation for state-changing requests
- ✅ **XSS Prevention** - Content Security Policy
- ✅ **OAuth 2.0** - Secure third-party authentication
- ✅ **HTTPS Only** - Enforced in production

### Security Recommendations

For production deployment:

1. **Rate Limiting** - Implement API rate limiting (see [RATE_LIMITING_SETUP.md](RATE_LIMITING_SETUP.md))
2. **Input Validation** - Add server-side validation with Zod
3. **Monitoring** - Set up error tracking with Sentry
4. **Cloudflare WAF** - Configure firewall rules

See [SECURITY_AUDIT.md](SECURITY_AUDIT.md) for a comprehensive security analysis.

## 📚 Documentation

- [OAuth Setup Guide](OAUTH_SETUP.md) - Configure Google, GitHub, Microsoft OAuth
- [Railway Deployment](RAILWAY_DEPLOY.md) - Step-by-step deployment guide
- [Security Audit](SECURITY_AUDIT.md) - Detailed security analysis and recommendations
- [Rate Limiting Setup](RATE_LIMITING_SETUP.md) - Protect your API from abuse
- [Cloudflare WAF](CLOUDFLARE_WAF_SETUP.md) - Configure Web Application Firewall
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md) - Complete feature overview

## 🏗️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework

### Authentication
- **NextAuth.js v5** - Authentication solution
- **OAuth 2.0** - Google, GitHub providers

### Deployment
- **Railway** - Hosting platform
- **Cloudflare** - CDN, DDoS protection, WAF
- **Vercel** - Alternative hosting option

## 📂 Project Structure

```
daily-companion/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard page
│   │   ├── pomodoro/          # Pomodoro timer
│   │   ├── templates/         # Task templates
│   │   ├── analytics/         # Analytics dashboard
│   │   ├── achievements/      # Achievements page
│   │   ├── shared-plans/      # Collaborative plans
│   │   ├── profile/           # User profile
│   │   └── settings/          # Settings page
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── icons/             # Icon components
│   │   ├── spotify/           # Spotify integration
│   │   ├── messenger/         # Chat component
│   │   └── ui/                # UI components
│   ├── contexts/              # React contexts
│   │   ├── ThemeContext.tsx   # Dark mode
│   │   └── LanguageContext.tsx
│   ├── auth.ts                # NextAuth config
│   ├── middleware.ts          # Security middleware
│   └── globals.css            # Global styles
├── public/                    # Static assets
├── .env.example               # Environment variables template
└── package.json               # Dependencies
```

## 🎨 Features Overview

### Dashboard
- Task list with drag-and-drop
- Priority levels (Low, Medium, High, Urgent)
- Status tracking (Pending, Completed)
- Timeline view
- Quick stats

### Pomodoro Timer
- 25-minute focus sessions
- 5-minute breaks
- Long break after 4 sessions
- Session history
- Spotify integration

### Templates
- Pre-built task templates
- Create custom templates
- Public/private sharing
- Category filtering
- Usage statistics

### Analytics
- Productivity trends
- Completion rates
- Time tracking
- Daily/weekly/monthly views
- Export data

### Achievements
- Gamification system
- 20 unique achievements
- Progress tracking
- Unlockable rewards
- Categories: Productivity, Consistency, Social, Mastery

### Shared Plans
- Collaborate with team members
- Real-time updates
- Task assignments
- Built-in messenger
- Role-based permissions

## 🧪 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run type-check
```

### Code Style

This project uses:
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Prettier** - Code formatting (recommended)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Guidelines

- Write clean, readable code
- Add TypeScript types for all functions
- Follow existing code style
- Test your changes
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Railway](https://railway.app/) - Hosting Platform
- [Cloudflare](https://cloudflare.com/) - Security & CDN

## 📞 Support

- 📧 Email: support@daily-companion.com
- 🐛 Issues: [GitHub Issues](https://github.com/YOUR_USERNAME/daily-companion/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/YOUR_USERNAME/daily-companion/discussions)

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Task priorities with AI suggestions
- [ ] Team workspaces
- [ ] Advanced analytics
- [ ] API for third-party integrations
- [ ] Browser extensions (Chrome, Firefox)
- [ ] Offline mode with sync

## ⭐ Star History

If you find this project useful, please consider giving it a star!

---

**Made with ❤️ using Next.js and React**

**Version:** 1.0.0 | **Last Updated:** January 2026
