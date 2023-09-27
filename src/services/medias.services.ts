import { Request } from 'express'
import { handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getNameFromFullname } from '~/utils/file'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Other'
import { result } from 'lodash'
config()
class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const new_name = getNameFromFullname(file.newFilename)
        const new_path = UPLOAD_IMAGE_DIR + `/${new_name}.jpg`
        const info = await sharp(file.filepath).jpeg().toFile(new_path)
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${new_name}.jpg`
            : `http://localhost:3000/static/image/${new_name}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = files.map((file)=>{
      return {
        url: isProduction
          ? `${process.env.HOST}/static/video/${file.newFilename}`
          : `http://localhost:3000/static/video/${file.newFilename}`,
        type: MediaType.Video
      }
    })
    return result
  }
}
const mediasService = new MediasService()
export default mediasService
