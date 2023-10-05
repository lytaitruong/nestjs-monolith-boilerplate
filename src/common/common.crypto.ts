import { randomBytes, scrypt } from 'crypto'

export const scryptHash = (text: string): Promise<string> => {
  const salt = randomBytes(16).toString('hex')

  return new Promise((resolve, reject) => {
    scrypt(text, salt, 64, (err, token) => {
      if (err) reject(err)

      return resolve(salt + ':' + token.toString('hex'))
    })
  })
}

export const scryptVerify = (text: string, hash: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const [salt, token] = hash.split(':')
    scrypt(text, salt, 64, (err, key) => {
      if (err) reject(err)

      return resolve(key.toString('hex') === token)
    })
  })
}
