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
    const { username, password, displayName } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Validate username
    const normalizedUsername = username.toLowerCase().trim()
    if (normalizedUsername.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      )
    }
    if (normalizedUsername.length > 20) {
      return NextResponse.json(
        { error: 'Username must be less than 20 characters' },
        { status: 400 }
      )
    }
    if (!/^[a-zA-Z0-9_]+$/.test(normalizedUsername)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers and underscores' },
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
    const existingUser = await User.findOne({ username: normalizedUsername })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = await User.create({
      username: normalizedUsername,
      password, // Will be hashed by the pre-save hook
      displayName: displayName || normalizedUsername,
      avatar: (displayName || normalizedUsername).charAt(0).toUpperCase(),
      avatarType: 'initial',
      provider: 'credentials',
      lastLogin: new Date(),
    })

    // Create JWT token
    const token = jwt.sign(
      {
        userId: newUser._id.toString(),
        username: newUser.username,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const response = NextResponse.json(
      {
        user: {
          id: newUser._id.toString(),
          username: newUser.username,
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

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      )
    }

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

    // Check if user is banned
    if ((user as any).isBanned) {
      return NextResponse.json(
        { error: 'Your account has been banned', banned: true, banReason: (user as any).banReason },
        { status: 403 }
      )
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        avatarType: user.avatarType,
        bio: user.bio,
        socialLinks: (user as any).socialLinks || {},
        createdAt: user.createdAt,
        isAdmin: (user as any).isAdmin || false,
        isCreator: (user as any).isCreator || false,
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
