export const USER_IMAGE_PROCESSOR = `user-image`
export const USER_IMAGE = {
  UPLOAD: 'user-image-upload',
}
export interface IUserImageUploadData {
  name: string
  type: string
  data: Buffer
}
