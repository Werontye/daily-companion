import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/types'

// In-memory user storage (will be replaced with database later)
let users: User[] = []

// Simple session storage (will be replaced with proper JWT later)
const sessions = new Map<string, string>() // sessionToken -> userId

/**
 * POST /api/auth/register - Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Create new user
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      displayName: name || email.split('@')[0],
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      settings: {
        theme: 'system',
        language: 'en',
        notifications: {
          enabled: true,
          sound: true,
          vibrate: false,
        },
        pomodoro: {
          workDuration: 25,
          shortBreak: 5,
          longBreak: 15,
          longBreakInterval: 4,
        },
        privacy: {
          localOnly: false,
          encryptData: false,
          shareAchievements: true,
        },
      },
      privacyFlags: {
        allowAnalytics: false,
        allowCloudSync: false,
        allowLocationTracking: false,
        allowActivityTracking: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    users.push(newUser)

    // Create session
    const sessionToken = crypto.randomUUID()
    sessions.set(sessionToken, newUser.id)

    const response = NextResponse.json(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          displayName: newUser.displayName,
          avatarUrl: newUser.avatarUrl,
          settings: newUser.settings,
        },
      },
      { status: 201 }
    )

    // Set session cookie
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('POST /api/auth/register error:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/session - Get current user session
 */
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const userId = sessions.get(sessionToken)
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const user = users.find(u => u.id === userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        settings: user.settings,
      },
    })
  } catch (error) {
    console.error('GET /api/auth/session error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/auth/session - Logout (delete session)
 */
export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value

    if (sessionToken) {
      sessions.delete(sessionToken)
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete('session')

    return response
  } catch (error) {
    console.error('DELETE /api/auth/session error:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}
