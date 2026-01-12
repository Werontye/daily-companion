import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import User, { IUser } from '@/lib/db/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this-in-production'

/**
 * POST /api/auth - Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = await User.create({
      email: email.toLowerCase(),
      password, // Will be hashed by the pre-save hook
      displayName: name || email.split('@')[0],
      avatar: (name || email.split('@')[0]).charAt(0).toUpperCase(),
      avatarType: 'initial',
      provider: 'credentials',
      lastLogin: new Date(),
    })

    // Create JWT token
    const token = jwt.sign(
      {
        userId: newUser._id.toString(),
        email: newUser.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const response = NextResponse.json(
      {
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          displayName: newUser.displayName,
          avatar: newUser.avatar,
          avatarType: newUser.avatarType,
        },
      },
      { status: 201 }
    )

    // Set session cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error: any) {
    console.error('POST /api/auth error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth - Get current user session
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Find user in database
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        avatarType: user.avatarType,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('GET /api/auth error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/auth - Logout (delete session)
 */
export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true })
    response.cookies.delete('auth_token')
    return response
  } catch (error) {
    console.error('DELETE /api/auth error:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}
