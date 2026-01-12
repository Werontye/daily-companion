import { NextRequest, NextResponse } from 'next/server'
import SpotifyClient from '@/lib/spotify/SpotifyClient'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?spotify_error=${error}`)
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?spotify_error=no_code`)
  }

  try {
    // Exchange code for tokens
    const { accessToken, refreshToken, expiresIn } = await SpotifyClient.exchangeCodeForTokens(code)

    // Create response with redirect
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?spotify_success=true`)

    // Set tokens in cookies (httpOnly for security)
    response.cookies.set('spotify_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn,
    })

    response.cookies.set('spotify_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })

    return response
  } catch (error) {
    console.error('Spotify callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?spotify_error=token_exchange_failed`)
  }
}
