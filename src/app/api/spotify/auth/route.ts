import { NextResponse } from 'next/server'
import { SPOTIFY_AUTH_URL } from '@/lib/spotify/config'

export async function GET() {
  // Redirect to Spotify authorization page
  return NextResponse.redirect(SPOTIFY_AUTH_URL)
}
