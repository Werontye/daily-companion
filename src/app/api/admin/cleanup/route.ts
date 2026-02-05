import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import mongoose from 'mongoose'

/**
 * DELETE /api/admin/cleanup - Complete database cleanup (dangerous!)
 * Deletes ALL users and drops indexes
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check for secret key to prevent accidental deletion
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (secret !== 'CLEANUP-ALL-2024') {
      return NextResponse.json(
        { error: 'Invalid secret. Use ?secret=CLEANUP-ALL-2024' },
        { status: 403 }
      )
    }

    await connectToDatabase()

    // Delete ALL users
    const deleteResult = await User.deleteMany({})

    // Drop all indexes and recreate them
    try {
      await User.collection.dropIndexes()
      // Recreate the username index
      await User.collection.createIndex({ username: 1 }, { unique: true, sparse: true })
    } catch (indexError) {
      console.log('Index operation:', indexError)
    }

    return NextResponse.json({
      message: `Database cleaned! Deleted ${deleteResult.deletedCount} users. Indexes reset.`,
      deletedCount: deleteResult.deletedCount,
    })
  } catch (error) {
    console.error('DELETE /api/admin/cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup database' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/cleanup - Show current users (for debugging)
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const users = await User.find({}).select('username email displayName isAdmin createdAt')
    const indexes = await User.collection.indexes()

    return NextResponse.json({
      userCount: users.length,
      users: users.map(u => ({
        id: u._id.toString(),
        username: u.username || '(no username)',
        email: u.email || '(no email)',
        displayName: u.displayName,
        isAdmin: u.isAdmin,
      })),
      indexes,
    })
  } catch (error) {
    console.error('GET /api/admin/cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
