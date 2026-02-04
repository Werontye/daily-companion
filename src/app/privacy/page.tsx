'use client'

import Link from 'next/link'
import { CheckCircleIcon } from '@/components/icons'
import { motion } from 'framer-motion'

const sections = [
  {
    id: 1,
    title: 'Introduction',
    icon: '👋',
    content: `Welcome to Daily Companion. We respect your privacy and are committed to protecting your personal data.
      This privacy policy will inform you about how we look after your personal data when you visit our website
      and tell you about your privacy rights and how the law protects you.`
  },
  {
    id: 2,
    title: 'Information We Collect',
    icon: '📋',
    content: 'We collect and process the following types of information:',
    list: [
      { title: 'Account Information', desc: 'Name, email address, and password when you create an account' },
      { title: 'Profile Information', desc: 'Optional bio, profile picture, and preferences' },
      { title: 'Task Data', desc: 'Tasks, templates, and shared plans you create' },
      { title: 'Usage Data', desc: 'Information about how you use our service, including analytics and feature usage' },
      { title: 'Device Information', desc: 'Browser type, IP address, and device identifiers' },
    ]
  },
  {
    id: 3,
    title: 'How We Use Your Information',
    icon: '⚙️',
    content: 'We use your information for the following purposes:',
    list: [
      { desc: 'To provide and maintain our service' },
      { desc: 'To authenticate your account and secure your data' },
      { desc: 'To personalize your experience and improve our features' },
      { desc: 'To send you notifications about tasks and updates (if enabled)' },
      { desc: 'To analyze usage patterns and improve our service' },
      { desc: 'To communicate with you about service changes and updates' },
      { desc: 'To prevent fraud and ensure security' },
    ]
  },
  {
    id: 4,
    title: 'Data Storage and Security',
    icon: '🔒',
    content: 'We take the security of your data seriously:',
    list: [
      { desc: 'All data is encrypted in transit using SSL/TLS' },
      { desc: 'Passwords are hashed using industry-standard encryption' },
      { desc: 'We use secure cloud infrastructure to store your data' },
      { desc: 'Access to user data is strictly limited to authorized personnel' },
      { desc: 'We regularly review and update our security practices' },
    ],
    footer: 'Your task data is stored locally in your browser and synced to our secure servers when you\'re online.'
  },
  {
    id: 5,
    title: 'Third-Party Services',
    icon: '🔗',
    content: 'We may integrate with the following third-party services:',
    list: [
      { title: 'Spotify', desc: 'For music integration during focus sessions (optional)' },
      { title: 'Analytics Services', desc: 'To understand how our app is being used' },
    ],
    footer: 'These services have their own privacy policies. We only access the minimum necessary data required for integration features.'
  },
  {
    id: 6,
    title: 'Your Rights',
    icon: '✅',
    content: 'You have the following rights regarding your personal data:',
    list: [
      { title: 'Access', desc: 'Request copies of your personal data' },
      { title: 'Rectification', desc: 'Request correction of inaccurate data' },
      { title: 'Erasure', desc: 'Request deletion of your personal data' },
      { title: 'Restriction', desc: 'Request restriction of processing your data' },
      { title: 'Portability', desc: 'Request transfer of your data to another service' },
      { title: 'Objection', desc: 'Object to processing of your personal data' },
    ],
    footer: 'To exercise any of these rights, please contact us at privacy@dailycompanion.com or use the "Delete Account" option in your profile settings.'
  },
  {
    id: 7,
    title: 'Cookies and Tracking',
    icon: '🍪',
    content: `We use cookies and similar tracking technologies to track activity on our service and store
      certain information. Cookies are files with a small amount of data. You can instruct your browser
      to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept
      cookies, you may not be able to use some portions of our service.`
  },
  {
    id: 8,
    title: 'Children\'s Privacy',
    icon: '👶',
    content: `Our service is not intended for children under the age of 13. We do not knowingly collect
      personal information from children under 13. If you are a parent or guardian and you are aware
      that your child has provided us with personal data, please contact us.`
  },
  {
    id: 9,
    title: 'Changes to This Privacy Policy',
    icon: '📝',
    content: `We may update our Privacy Policy from time to time. We will notify you of any changes by posting
      the new Privacy Policy on this page and updating the "Last updated" date. You are advised to
      review this Privacy Policy periodically for any changes.`
  },
  {
    id: 10,
    title: 'Contact Us',
    icon: '📧',
    content: 'If you have any questions about this Privacy Policy, please contact us:',
    contacts: [
      { label: 'Email', value: 'privacy@dailycompanion.com' },
      { label: 'Website', value: 'https://dailycompanion.com/privacy' },
    ]
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <nav className="glass sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircleIcon className="h-8 w-8 text-primary-600" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent group-hover:from-primary-500 group-hover:to-accent-400 transition-all">
                Daily Companion
              </span>
            </Link>
            <motion.div whileHover={{ x: -4 }} transition={{ duration: 0.2 }}>
              <Link href="/" className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-xl shadow-primary-500/25 mb-6"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-primary-800 to-slate-900 dark:from-white dark:via-primary-200 dark:to-white bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 + 0.3 }}
              className="group"
            >
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center text-2xl"
                  >
                    {section.icon}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <span className="text-primary-600 dark:text-primary-400 font-mono text-sm">
                        {String(section.id).padStart(2, '0')}
                      </span>
                      {section.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {section.content}
                    </p>

                    {section.list && (
                      <ul className="mt-4 space-y-2">
                        {section.list.map((item, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 + i * 0.02 + 0.4 }}
                            className="flex items-start gap-3 text-slate-600 dark:text-slate-400"
                          >
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400" />
                            </span>
                            <span>
                              {'title' in item && item.title && <strong className="text-slate-800 dark:text-slate-200">{item.title}: </strong>}
                              {item.desc}
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    )}

                    {section.footer && (
                      <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                        {section.footer}
                      </p>
                    )}

                    {section.contacts && (
                      <div className="mt-4 space-y-2">
                        {section.contacts.map((contact, i) => (
                          <div key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{contact.label}:</span>
                            <span className="text-primary-600 dark:text-primary-400">{contact.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <CheckCircleIcon className="w-6 h-6 text-primary-600" />
            <span className="text-slate-600 dark:text-slate-400">
              Your privacy is our priority
            </span>
          </div>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-500 text-white font-medium rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Return to Daily Companion
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
