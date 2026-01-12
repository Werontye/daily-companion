/**
 * Demo Mode Management
 *
 * This module handles the separation between demo mode and real user accounts.
 * Demo mode shows sample data, while real accounts start empty.
 */

const DEMO_MODE_KEY = 'demo-mode'

/**
 * Check if the app is currently in demo mode
 */
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(DEMO_MODE_KEY) === 'true'
}

/**
 * Enable demo mode - shows sample data
 */
export function enableDemoMode(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(DEMO_MODE_KEY, 'true')
}

/**
 * Disable demo mode - used when user creates a real account
 */
export function disableDemoMode(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DEMO_MODE_KEY)
}

/**
 * Switch from demo to real account
 * Clears all demo data and disables demo mode
 */
export function switchToRealAccount(): void {
  if (typeof window === 'undefined') return

  // Clear all localStorage data
  localStorage.clear()

  // Note: Demo mode flag is already cleared by localStorage.clear()
  // User will start with a clean slate
}

/**
 * Reset to demo mode
 * Clears all data and enables demo mode, which will load sample data
 */
export function resetToDemo(): void {
  if (typeof window === 'undefined') return

  // Clear all localStorage data
  localStorage.clear()

  // Enable demo mode
  enableDemoMode()
}
