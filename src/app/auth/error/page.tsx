'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircleIcon, AlertIcon } from '@/components/icons'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams?.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return {
          title: 'Server Configuration Error',
          message: 'There is a problem with the server configuration. Please contact support.',
        }
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          message: 'You denied access to your account. Please try again and grant the required permissions.',
        }
      case 'Verification':
        return {
          title: 'Verification Error',
          message: 'The verification token has expired or has already been used.',
        }
      case 'OAuthSignin':
        return {
          title: 'OAuth Sign-in Error',
          message: 'There was an error starting the OAuth sign-in process.',
        }
      case 'OAuthCallback':
        return {
          title: 'OAuth Callback Error',
          message: 'There was an error handling the OAuth callback. Please try again.',
        }
      case 'OAuthCreateAccount':
        return {
          title: 'Account Creation Error',
          message: 'Could not create OAuth account. The email might already be registered.',
        }
      case 'EmailCreateAccount':
        return {
          title: 'Email Account Error',
          message: 'Could not create account with this email.',
        }
      case 'Callback':
        return {
          title: 'Callback Error',
          message: 'There was an error during the authentication callback.',
        }
      case 'OAuthAccountNotLinked':
        return {
          title: 'Account Not Linked',
          message: 'This email is already registered with a different sign-in method. Please use your original sign-in method.',
        }
      case 'EmailSignin':
        return {
          title: 'Email Sign-in Error',
          message: 'The email sign-in link is invalid or has expired.',
        }
      case 'CredentialsSignin':
        return {
          title: 'Sign-in Failed',
          message: 'Invalid email or password. Please check your credentials and try again.',
        }
      case 'SessionRequired':
        return {
          title: 'Session Required',
          message: 'You must be signed in to access this page.',
        }
      default:
        return {
          title: 'Authentication Error',
          message: 'An unexpected error occurred during authentication. Please try again.',
        }
    }
  }

  const { title, message } = getErrorMessage(error)

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <CheckCircleIcon className="h-12 w-12 text-blue-600" />
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Daily Companion
            </span>
          </Link>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              {title}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              {message}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                Error code: {error}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="block w-full btn btn-primary text-center"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="block w-full btn btn-secondary text-center"
            >
              Back to Home
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Need help?
            </h3>
            <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
              <li>• Make sure you're using the correct sign-in method</li>
              <li>• Check that you've granted the necessary permissions</li>
              <li>• Try clearing your browser cache and cookies</li>
              <li>• Contact support if the problem persists</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
