import { NextRequest, NextResponse } from 'next/server'
import SpotifyClient from '@/lib/spotify/SpotifyClient'

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('spotify_access_token')?.value
    const refreshToken = request.cookies.get('spotify_refresh_token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const spotify = SpotifyClient.createAuthenticatedClient(accessToken, refreshToken)

    // Get current playback
    const playback = await spotify.getMyCurrentPlaybackState()

    if (!playback.body || !playback.body.item) {
      return NextResponse.json({
        isPlaying: false,
        track: null,
      })
    }

    const track = playback.body.item as any

    return NextResponse.json({
      isPlaying: playback.body.is_playing,
      track: {
        id: track.id,
        name: track.name,
        artists: track.artists.map((a: any) => a.name).join(', '),
        album: track.album.name,
        albumArt: track.album.images[0]?.url,
        duration: track.duration_ms,
        progress: playback.body.progress_ms,
      },
      device: {
        name: playback.body.device.name,
        type: playback.body.device.type,
        volume: playback.body.device.volume_percent,
      },
    })
  } catch (error: any) {
    console.error('Spotify player error:', error)

    // Try to refresh token if unauthorized
    if (error.statusCode === 401) {
      try {
        const refreshToken = request.cookies.get('spotify_refresh_token')?.value
        if (refreshToken) {
          const newAccessToken = await SpotifyClient.refreshAccessToken(refreshToken)

          const response = NextResponse.json({ error: 'Token refreshed, please retry' }, { status: 401 })
          response.cookies.set('spotify_access_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600, // 1 hour
          })

          return response
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
      }
    }

    return NextResponse.json({ error: 'Failed to get player state' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('spotify_access_token')?.value
    const refreshToken = request.cookies.get('spotify_refresh_token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const spotify = SpotifyClient.createAuthenticatedClient(accessToken, refreshToken)
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'play':
        await spotify.play()
        break
      case 'pause':
        await spotify.pause()
        break
      case 'next':
        await spotify.skipToNext()
        break
      case 'previous':
        await spotify.skipToPrevious()
        break
      case 'volume':
        if (body.volume !== undefined) {
          await spotify.setVolume(body.volume)
        }
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Spotify control error:', error)
    return NextResponse.json(
      { error: 'Failed to control playback', details: error.message },
      { status: 500 }
    )
  }
}
