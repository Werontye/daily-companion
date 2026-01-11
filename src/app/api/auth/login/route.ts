import { NextRequest, NextResponse } from 'next/server'

// NOTE: This shares the same in-memory storage as the main auth route
// In production, this would use a database

/**
 * POST /api/auth/login - Login user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // For demo purposes, we'll accept any password
    // In production, this would verify password hash

    // Create a demo user if none exists
    const demoUser = {
      id: 'demo-user-' + crypto.randomUUID(),
      email,
      name: email.split('@')[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      preferences: {
        theme: 'system' as const,
        notifications: true,
        language: 'en' as const,
        pomodoroLength: 25,
        shortBreakLength: 5,
        longBreakLength: 15,
      },
    }

    // Create session
    const sessionToken = crypto.randomUUID()

    const response = NextResponse.json({
      user: {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        avatar: demoUser.avatar,
        preferences: demoUser.preferences,
      },
    })

    // Set session cookie
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('POST /api/auth/login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}
