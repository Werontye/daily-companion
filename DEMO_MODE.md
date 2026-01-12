# Demo Mode vs Real Accounts

This document explains how the app separates demo mode from real user accounts.

## Overview

The Daily Companion app supports two modes:

1. **Demo Mode**: Shows sample data (tasks, templates, shared plans, analytics) for users trying out the app
2. **Real Account Mode**: Starts with empty data for registered users

## How It Works

### Demo Mode Flag

A localStorage flag `demo-mode` determines whether the app is in demo mode:

```javascript
localStorage.getItem('demo-mode') === 'true' // Demo mode enabled
```

### When Demo Mode is Activated

Demo mode is activated when:
- User clicks "Try Live Demo" button on the home page
- This clears all localStorage and sets `demo-mode` to `'true'`

### What Happens in Demo Mode

When the app detects demo mode (`isDemoMode()` returns `true`):
- **Dashboard**: Loads sample tasks if localStorage is empty
- **Templates**: Loads sample templates if localStorage is empty
- **Shared Plans**: Can show demo plans with sample users
- **Analytics**: Can show sample analytics data

### What Happens with Real Accounts

When a user creates a real account:
- Demo mode flag is cleared (using `switchToRealAccount()`)
- All localStorage data is cleared
- User starts with completely empty:
  - No tasks
  - No templates
  - Empty analytics
  - No shared plans

## API Reference

### `isDemoMode()`
Returns `true` if app is in demo mode, `false` otherwise

### `enableDemoMode()`
Sets the demo mode flag

### `disableDemoMode()`
Removes the demo mode flag

### `resetToDemo()`
Clears all data and enables demo mode (used by "Try Demo" button)

### `switchToRealAccount()`
Clears all data and demo flag (used when creating real account)

## Implementation Example

```typescript
// In a page that loads data
useEffect(() => {
  let data = getDataFromStorage()

  // Only load demo data if we're in demo mode and storage is empty
  if (data.length === 0 && isDemoMode()) {
    data = getDemoData()
    saveData(data)
  }

  setData(data)
}, [])
```

## Future: Authentication Integration

When real authentication is added:
1. On successful registration/login: Call `switchToRealAccount()` to clear demo data
2. On logout: Optionally offer to return to demo mode with `resetToDemo()`
3. Store user ID in localStorage/cookies to differentiate users
4. Backend can store user-specific data separately from local demo data
