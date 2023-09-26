import { Request } from 'express'
import { handleUploadImage } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import { getNameFromFullname } from '~/utils/file'
import fs from 'fs'
class MediasService{
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadImage(req)
    const new_name = getNameFromFullname(file.newFilename)
    const new_path = UPLOAD_DIR + `/${new_name}.jpg`
    const info = await sharp(file.filepath).jpeg().toFile(new_path)
    fs.unlinkSync(file.filepath)
    return `http://localhost:3000/uploads/${new_name}.jpg`
  }

}
const mediasService = new MediasService()
export default mediasService
