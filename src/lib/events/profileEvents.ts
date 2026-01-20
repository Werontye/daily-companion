export const PROFILE_UPDATED_EVENT = 'profile-updated'

export interface ProfileUpdateDetail {
  displayName?: string
  avatar?: string
  avatarType?: 'initial' | 'photo'
}

export function dispatchProfileUpdate(detail: ProfileUpdateDetail): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail }))
  }
}

export function onProfileUpdate(callback: (detail: ProfileUpdateDetail) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const handler = (e: Event) => {
    callback((e as CustomEvent<ProfileUpdateDetail>).detail)
  }

  window.addEventListener(PROFILE_UPDATED_EVENT, handler)
  return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handler)
}
