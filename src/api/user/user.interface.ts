export const USER_IMAGE_PROCESSOR = `user-image`

export type UserImageJob = 'user-image-converter'

export interface IUserImageConverterData {
  name: string
  type: string
  data: Buffer
}
