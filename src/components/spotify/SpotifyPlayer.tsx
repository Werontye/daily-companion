'use client'

import { useState } from 'react'
import { PlayIcon, PauseIcon } from '@/components/icons'

interface Playlist {
  id: string
  name: string
  image: string
  description: string
}

const focusPlaylists: Playlist[] = [
  {
    id: '37i9dQZF1DX8Uebhn9wzrS',
    name: 'Chill Lofi Study Beats',
    image: '🎵',
    description: 'Relaxing beats to help you focus',
  },
  {
    id: '37i9dQZF1DWZeKCadgRdKQ',
    name: 'Deep Focus',
    image: '🎧',
    description: 'Keep calm and focus with ambient music',
  },
  {
    id: '37i9dQZF1DX4sWSpwq3LiO',
    name: 'Peaceful Piano',
    image: '🎹',
    description: 'Relax and indulge with beautiful piano pieces',
  },
  {
    id: '37i9dQZF1DX3rxVfibe1L0',
    name: 'Mood Booster',
    image: '☀️',
    description: 'Get happy with today\'s dose of feel-good songs',
  },
]

export function SpotifyPlayer() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const handleConnectSpotify = () => {
    // In a real production app with Spotify OAuth, this would initiate the OAuth flow
    // For now, we'll just enable the player to show focus playlists
    setIsConnected(true)
  }

  const handlePlayPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist)
    // Open Spotify in new tab as fallback for iframe blocking
    window.open(`https://open.spotify.com/playlist/${playlist.id}`, '_blank')
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-50"
        aria-label="Open Spotify Player"
      >
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 card shadow-2xl z-50 animate-slide-up max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
            Focus Music
          </h3>
        </div>
        <button
          onClick={() => {
            setIsExpanded(false)
            setSelectedPlaylist(null)
          }}
          className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          ✕
        </button>
      </div>

      {!isConnected ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">🎵</div>
          <p className="text-neutral-900 dark:text-neutral-100 font-semibold mb-2">
            Focus with Music
          </p>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6 text-sm">
            Listen to curated focus playlists on Spotify while you work
          </p>
          <button
            onClick={handleConnectSpotify}
            className="btn bg-green-600 hover:bg-green-700 text-white shadow-lg"
          >
            🎧 Browse Focus Playlists
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {selectedPlaylist ? (
            <div className="space-y-3">
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2"
              >
                ← Back to playlists
              </button>

              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-sm mb-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                    {selectedPlaylist.name}
                  </span>
                </div>
              </div>

              {/* Embedded Spotify Player */}
              <div className="rounded-lg overflow-hidden">
                <iframe
                  src={`https://open.spotify.com/embed/playlist/${selectedPlaylist.id}?utm_source=generator&theme=0`}
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-lg"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 mb-4">
                <p className="text-xs text-neutral-700 dark:text-neutral-300">
                  💡 Playlists will open in Spotify. Make sure you're logged in to Spotify!
                </p>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                Choose a playlist to enhance your focus:
              </p>
              {focusPlaylists.map(playlist => (
                <button
                  key={playlist.id}
                  onClick={() => handlePlayPlaylist(playlist)}
                  className="w-full p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{playlist.image}</div>
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-green-600">
                        {playlist.name}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {playlist.description}
                      </div>
                    </div>
                    <PlayIcon className="h-5 w-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </>
          )}

          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => {
                setIsConnected(false)
                setSelectedPlaylist(null)
              }}
              className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Disconnect Spotify
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
