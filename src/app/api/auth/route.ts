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
      name: name || email.split('@')[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      preferences: {
        theme: 'system',
        notifications: true,
        language: 'en',
        pomodoroLength: 25,
        shortBreakLength: 5,
        longBreakLength: 15,
      },
      createdAt: new Date(),
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
          name: newUser.name,
          avatar: newUser.avatar,
          preferences: newUser.preferences,
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
        name: user.name,
        avatar: user.avatar,
        preferences: user.preferences,
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
