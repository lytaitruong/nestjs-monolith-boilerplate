import { GuardProvider } from '../guard.interface'

export const getOauth2Info = (provider: GuardProvider, accessToken = 'accessToken', refreshToken = 'refreshToken') => {
  return {
    oauth2: { id: '1', accessToken, refreshToken },
    provider,
    name: 'michael jordan',
    email: 'michael@gmail.com',
    image: 'image.png',
  }
}
