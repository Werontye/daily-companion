import SpotifyWebApi from 'spotify-web-api-node'
import { spotifyConfig } from './config'

export class SpotifyClient {
  private static instance: SpotifyWebApi | null = null

  static getInstance(): SpotifyWebApi {
    if (!this.instance) {
      this.instance = new SpotifyWebApi({
        clientId: spotifyConfig.clientId,
        clientSecret: spotifyConfig.clientSecret,
        redirectUri: spotifyConfig.redirectUri,
      })
    }
    return this.instance
  }

  static async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const spotify = this.getInstance()
      spotify.setRefreshToken(refreshToken)

      const data = await spotify.refreshAccessToken()
      const accessToken = data.body.access_token

      spotify.setAccessToken(accessToken)
      return accessToken
    } catch (error) {
      console.error('Error refreshing Spotify access token:', error)
      throw error
    }
  }

  static async exchangeCodeForTokens(code: string) {
    try {
      const spotify = this.getInstance()
      const data = await spotify.authorizationCodeGrant(code)

      return {
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      }
    } catch (error) {
      console.error('Error exchanging code for tokens:', error)
      throw error
    }
  }

  static createAuthenticatedClient(accessToken: string, refreshToken?: string): SpotifyWebApi {
    const spotify = this.getInstance()
    spotify.setAccessToken(accessToken)
    if (refreshToken) {
      spotify.setRefreshToken(refreshToken)
    }
    return spotify
  }
}

export default SpotifyClient
