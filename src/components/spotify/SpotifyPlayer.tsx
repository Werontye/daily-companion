'use client'

import { useState, useEffect } from 'react'
import { PlayIcon, PauseIcon } from '@/components/icons'

interface Track {
  id: string
  name: string
  artists: string
  album: string
  albumArt: string
  duration: number
  progress: number
}

interface PlayerState {
  isPlaying: boolean
  track: Track | null
  device: {
    name: string
    type: string
    volume: number
  } | null
}

// Fallback focus playlists for non-authenticated users
const FOCUS_PLAYLISTS = [
  { id: '37i9dQZF1DX8Uebhn9wzrS', name: 'Chill Lofi Study Beats', emoji: '🎵' },
  { id: '37i9dQZF1DWZeKCadgRdKQ', name: 'Deep Focus', emoji: '🎧' },
  { id: '37i9dQZF1DX4sWSpwq3LiO', name: 'Peaceful Piano', emoji: '🎹' },
  { id: '37i9dQZF1DX3rxVfibe1L0', name: 'Mood Booster', emoji: '☀️' },
]

export function SpotifyPlayer() {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showFallback, setShowFallback] = useState(false)

  const fetchPlayerState = async () => {
    try {
      const response = await fetch('/api/spotify/player')
      if (response.ok) {
        const data = await response.json()
        setPlayerState(data)
        setIsConnected(true)
        setShowFallback(false)
      } else if (response.status === 401) {
        setIsConnected(false)
        setShowFallback(true)
      }
    } catch (error) {
      console.error('Failed to fetch player state:', error)
      setShowFallback(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayerState()
    const interval = setInterval(fetchPlayerState, 5000)
    return () => clearInterval(interval)
  }, [])

  const controlPlayback = async (action: string, params?: any) => {
    try {
      const response = await fetch('/api/spotify/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...params }),
      })
      if (response.ok) {
        setTimeout(fetchPlayerState, 500)
      }
    } catch (error) {
      console.error('Failed to control playback:', error)
    }
  }

  const connectToSpotify = () => {
    window.location.href = '/api/spotify/auth'
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-4">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  // Show fallback curated playlists if not connected
  if (showFallback || !isConnected) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
          <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Focus Music
        </h3>

        <div className="text-center py-4 mb-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Connect your Spotify account for full playback control, or browse focus playlists below.
          </p>
          <button
            onClick={connectToSpotify}
            className="btn bg-green-600 hover:bg-green-700 text-white mb-4"
          >
            Connect Spotify Account
          </button>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
            Curated Focus Playlists:
          </p>
          <div className="space-y-2">
            {FOCUS_PLAYLISTS.map(playlist => (
              <button
                key={playlist.id}
                onClick={() => window.open(`https://open.spotify.com/playlist/${playlist.id}`, '_blank')}
                className="w-full p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-3 group"
              >
                <span className="text-2xl">{playlist.emoji}</span>
                <span className="flex-1 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-green-600">
                  {playlist.name}
                </span>
                <PlayIcon className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show "No music playing" state
  if (!playerState?.track) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Spotify Player
        </h3>
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="text-4xl">🎵</div>
          <div className="text-center">
            <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              No music playing
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Start playing something on Spotify to see controls here
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Full player with controls
  const { track, isPlaying } = playerState
  const progress = (track.progress / track.duration) * 100

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        Now Playing
      </h3>

      <div className="flex gap-4 mb-4">
        {track.albumArt && (
          <img
            src={track.albumArt}
            alt={track.album}
            className="w-20 h-20 rounded-lg object-cover shadow-md"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {track.name}
          </h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
            {track.artists}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500 truncate mt-1">
            {track.album}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
          <div
            className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          <span>{formatTime(track.progress)}</span>
          <span>{formatTime(track.duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => controlPlayback('previous')}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          aria-label="Previous track"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <button
          onClick={() => controlPlayback(isPlaying ? 'pause' : 'play')}
          className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
        </button>

        <button
          onClick={() => controlPlayback('next')}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          aria-label="Next track"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 18h2V6h-2zm-11-6l8.5 6V6z" />
          </svg>
        </button>
      </div>

      {playerState.device && (
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>Playing on: {playerState.device.name}</span>
            <span>{playerState.device.volume}% Volume</span>
          </div>
        </div>
      )}
    </div>
  )
}
