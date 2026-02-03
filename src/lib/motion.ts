/**
 * Motion System - Daily Companion Design System
 * Framer Motion variants and animation utilities
 */

import { Variants, Transition } from 'framer-motion'

// ============================================
// TIMING TOKENS
// ============================================
export const duration = {
  fast: 0.12,
  medium: 0.24,
  slow: 0.36,
} as const

// ============================================
// EASING CURVES
// ============================================
export const easing = {
  // Standard easing - for most UI animations
  standard: [0.22, 1, 0.36, 1] as [number, number, number, number],
  // Subtle easing - for gentle, natural movements
  subtle: [0.16, 1, 0.3, 1] as [number, number, number, number],
  // Bounce easing - for playful, attention-grabbing animations
  bounce: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
  // Spring config for Framer Motion
  spring: {
    type: 'spring' as const,
    stiffness: 120,
    damping: 14,
  },
  springStiff: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 20,
  },
  springGentle: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 16,
  },
} as const

// ============================================
// TRANSITION PRESETS
// ============================================
export const transition = {
  fast: {
    duration: duration.fast,
    ease: easing.subtle,
  } as Transition,
  medium: {
    duration: duration.medium,
    ease: easing.subtle,
  } as Transition,
  slow: {
    duration: duration.slow,
    ease: easing.standard,
  } as Transition,
  spring: easing.spring,
  springStiff: easing.springStiff,
  springGentle: easing.springGentle,
} as const

// ============================================
// FADE VARIANTS
// ============================================
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.medium, ease: easing.subtle },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast, ease: easing.subtle },
  },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.medium, ease: easing.subtle },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: duration.fast, ease: easing.subtle },
  },
}

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.medium, ease: easing.subtle },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: { duration: duration.fast, ease: easing.subtle },
  },
}

// ============================================
// SLIDE VARIANTS
// ============================================
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easing.standard },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: easing.standard },
  },
}

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easing.standard },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.3, ease: easing.standard },
  },
}

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: easing.standard },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.3, ease: easing.standard },
  },
}

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: easing.standard },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.3, ease: easing.standard },
  },
}

// ============================================
// SCALE VARIANTS
// ============================================
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.medium, ease: easing.subtle },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: duration.fast, ease: easing.subtle },
  },
}

export const springPop: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: easing.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: duration.fast },
  },
}

export const bounceIn: Variants = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
}

// ============================================
// CARD VARIANTS (for TaskCard, etc.)
// ============================================
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: easing.standard },
  },
  hover: {
    y: -4,
    boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
    transition: { duration: 0.16, ease: 'easeOut' },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
  drag: {
    scale: 1.02,
    boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.15)',
    cursor: 'grabbing',
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

export const cardCompletedVariants: Variants = {
  initial: { opacity: 1 },
  completed: {
    opacity: 0.6,
    transition: { duration: 0.24 },
  },
}

// ============================================
// CHECKBOX / COMPLETE ANIMATION
// ============================================
export const checkmarkVariants: Variants = {
  unchecked: {
    pathLength: 0,
    opacity: 0,
  },
  checked: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.24, ease: 'easeOut' },
      opacity: { duration: 0.1 },
    },
  },
}

export const strikethroughVariants: Variants = {
  hidden: { width: '0%' },
  visible: {
    width: '100%',
    transition: { duration: 0.24, ease: easing.subtle },
  },
}

// ============================================
// MODAL / OVERLAY VARIANTS
// ============================================
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.medium },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast },
  },
}

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: easing.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 },
  },
}

export const slidePanelVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.medium, ease: easing.standard },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2, ease: easing.standard },
  },
}

// ============================================
// TOOLTIP / DROPDOWN VARIANTS
// ============================================
export const tooltipVariants: Variants = {
  hidden: { opacity: 0, y: -6, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: duration.fast, ease: easing.subtle },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.98,
    transition: { duration: 0.1 },
  },
}

export const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: duration.medium, ease: easing.subtle },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: { duration: duration.fast },
  },
}

// ============================================
// LIST / STAGGER VARIANTS
// ============================================
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: easing.subtle },
  },
}

export const staggerItemScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: easing.spring,
  },
}

// ============================================
// CHART / DATA VISUALIZATION VARIANTS
// ============================================
export const chartBarVariants: Variants = {
  hidden: { scaleY: 0, originY: 1 },
  visible: (i: number) => ({
    scaleY: 1,
    transition: {
      delay: i * 0.04,
      duration: 0.4,
      ease: easing.standard,
    },
  }),
}

export const chartLineVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.5, ease: 'easeInOut' },
      opacity: { duration: 0.3 },
    },
  },
}

export const numberCountVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easing.subtle },
  },
}

// ============================================
// ACHIEVEMENT / CELEBRATION VARIANTS
// ============================================
export const achievementUnlockVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: [0.8, 1.12, 1],
    transition: {
      duration: 0.5,
      times: [0, 0.6, 1],
      ease: 'easeOut',
    },
  },
}

export const glowRingVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: [0, 1, 0],
    scale: [0.8, 1.2, 1.4],
    transition: {
      duration: 0.8,
      times: [0, 0.3, 1],
      ease: 'easeOut',
    },
  },
}

// ============================================
// POMODORO / PROGRESS RING VARIANTS
// ============================================
export const progressRingVariants: Variants = {
  idle: { strokeDashoffset: 0 },
  running: (progress: number) => ({
    strokeDashoffset: progress,
    transition: {
      duration: 1,
      ease: 'linear',
    },
  }),
  paused: {
    transition: easing.spring,
  },
  complete: {
    strokeDashoffset: 0,
    transition: { duration: 0.5, ease: easing.standard },
  },
}

// ============================================
// NOTIFICATION / TOAST VARIANTS
// ============================================
export const toastVariants: Variants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: easing.spring,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
}

// ============================================
// TYPING INDICATOR VARIANTS
// ============================================
export const typingDotVariants: Variants = {
  hidden: { y: 0 },
  visible: (i: number) => ({
    y: [0, -4, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      delay: i * 0.15,
      ease: 'easeInOut',
    },
  }),
}

// ============================================
// PRESENCE / AVATAR VARIANTS
// ============================================
export const presenceDotVariants: Variants = {
  hidden: { scale: 0 },
  visible: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Create stagger animation with custom delay
 */
export const createStagger = (staggerDelay: number = 0.04, initialDelay: number = 0.1): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: initialDelay,
    },
  },
})

/**
 * Create custom fade animation
 */
export const createFade = (
  direction: 'up' | 'down' | 'left' | 'right' | 'none' = 'none',
  distance: number = 8
): Variants => {
  const transforms: Record<string, { y?: number; x?: number }> = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  }

  return {
    hidden: { opacity: 0, ...transforms[direction] },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: duration.medium, ease: easing.subtle },
    },
    exit: {
      opacity: 0,
      ...transforms[direction],
      transition: { duration: duration.fast },
    },
  }
}

/**
 * Check for reduced motion preference
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get variants with reduced motion fallback
 */
export const getReducedMotionVariants = (variants: Variants): Variants => {
  if (prefersReducedMotion()) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.01 } },
      exit: { opacity: 0, transition: { duration: 0.01 } },
    }
  }
  return variants
}
