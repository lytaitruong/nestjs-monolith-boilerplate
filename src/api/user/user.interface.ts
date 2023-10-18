export const USER_IMAGE_PROCESSOR = `user-image`
export const USER_IMAGE = {
  CONVERTER: 'user-image-converter',
}
export interface IUserImageConverterData {
  name: string
  type: string
  data: Buffer
}
