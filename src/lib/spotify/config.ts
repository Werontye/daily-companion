export const spotifyConfig = {
  clientId: process.env.SPOTIFY_CLIENT_ID || '',
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
  redirectUri: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3003/api/spotify/callback',
  scopes: [
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-recently-played',
    'streaming',
    'user-read-email',
    'user-read-private',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-library-read',
    'user-top-read',
  ],
}

export const SPOTIFY_AUTH_URL = `https://accounts.spotify.com/authorize?${new URLSearchParams({
  response_type: 'code',
  client_id: spotifyConfig.clientId,
  scope: spotifyConfig.scopes.join(' '),
  redirect_uri: spotifyConfig.redirectUri,
  show_dialog: 'true',
})}`
