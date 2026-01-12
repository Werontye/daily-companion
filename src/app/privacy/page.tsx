'use client'

import Link from 'next/link'
import { CheckCircleIcon } from '@/components/icons'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <nav className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <CheckCircleIcon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Daily Companion
              </span>
            </Link>
            <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Privacy Policy
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="prose dark:prose-invert max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                1. Introduction
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                Welcome to Daily Companion. We respect your privacy and are committed to protecting your personal data.
                This privacy policy will inform you about how we look after your personal data when you visit our website
                and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                2. Information We Collect
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                We collect and process the following types of information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-700 dark:text-neutral-300">
                <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
                <li><strong>Profile Information:</strong> Optional bio, profile picture, and preferences</li>
                <li><strong>Task Data:</strong> Tasks, templates, and shared plans you create</li>
                <li><strong>Usage Data:</strong> Information about how you use our service, including analytics and feature usage</li>
                <li><strong>Device Information:</strong> Browser type, IP address, and device identifiers</li>
                <li><strong>OAuth Data:</strong> When you connect third-party services like Google, GitHub, or Spotify</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-700 dark:text-neutral-300">
                <li>To provide and maintain our service</li>
                <li>To authenticate your account and secure your data</li>
                <li>To personalize your experience and improve our features</li>
                <li>To send you notifications about tasks and updates (if enabled)</li>
                <li>To analyze usage patterns and improve our service</li>
                <li>To communicate with you about service changes and updates</li>
                <li>To prevent fraud and ensure security</li>
              </ul>
            </section>

            {/* Data Storage and Security */}
            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                4. Data Storage and Security
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                We take the security of your data seriously:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-700 dark:text-neutral-300">
                <li>All data is encrypted in transit using SSL/TLS</li>
                <li>Passwords are hashed using industry-standard encryption</li>
                <li>We use secure cloud infrastructure to store your data</li>
                <li>Access to user data is strictly limited to authorized personnel</li>
                <li>We regularly review and update our security practices</li>
              </ul>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mt-4">
                Your task data is stored locally in your browser and synced to our secure servers when you're online.
              </p>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                5. Third-Party Services
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                We integrate with the following third-party services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-700 dark:text-neutral-300">
                <li><strong>Google OAuth:</strong> For authentication (optional)</li>
                <li><strong>GitHub OAuth:</strong> For authentication (optional)</li>
                <li><strong>Spotify:</strong> For music integration (optional)</li>
              </ul>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mt-4">
                These services have their own privacy policies. We only access the minimum necessary data required
                for authentication and integration features.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                6. Your Rights
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                You have the following rights regarding your personal data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-neutral-700 dark:text-neutral-300">
                <li><strong>Access:</strong> Request copies of your personal data</li>
                <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Restriction:</strong> Request restriction of processing your data</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to processing of your personal data</li>
              </ul>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mt-4">
                To exercise any of these rights, please contact us at privacy@dailycompanion.com or use the
                "Delete Account" option in your profile settings.
              </p>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                7. Cookies and Tracking
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our service and store
                certain information. Cookies are files with a small amount of data. You can instruct your browser
                to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept
                cookies, you may not be able to use some portions of our service.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                8. Children's Privacy
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                Our service is not intended for children under the age of 13. We do not knowingly collect
                personal information from children under 13. If you are a parent or guardian and you are aware
                that your child has provided us with personal data, please contact us.
              </p>
            </section>

            {/* Changes to This Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                9. Changes to This Privacy Policy
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting
                the new Privacy Policy on this page and updating the "Last updated" date. You are advised to
                review this Privacy Policy periodically for any changes.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                10. Contact Us
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="list-none space-y-2 text-neutral-700 dark:text-neutral-300">
                <li><strong>Email:</strong> privacy@dailycompanion.com</li>
                <li><strong>Website:</strong> https://dailycompanion.com/privacy</li>
              </ul>
            </section>
          </div>

          {/* Footer Link */}
          <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700 text-center">
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Return to Daily Companion
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
