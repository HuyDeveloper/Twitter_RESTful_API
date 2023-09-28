import e, { Request } from 'express'
import { handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getNameFromFullname } from '~/utils/file'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Other'
import { result } from 'lodash'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import databaseService from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import { EncodingStatus } from '~/constants/enum'
config()

class Queue {
  items: string[]
  endcoding: boolean
  constructor() {
    this.items = []
    this.endcoding = false
  }
  async enqueue(item: string) {
    this.items.push(item)
    const temp = item.split('\\')[item.split('\\').length - 1]
    const idName = temp.split('.')[0]
    await databaseService.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodingStatus.Pending
      })
    )
    this.processEncode()
  }
  async processEncode() {
    if (this.endcoding) return
    if (this.items.length > 0) {
      this.endcoding = true
      const videoPath = this.items[0]
      const temp = videoPath.split('\\')[videoPath.split('\\').length - 1]
      const idName = temp.split('.')[0]
      await databaseService.videoStatus.updateOne(
        { name: idName },
        {
          $set: {
            status: EncodingStatus.Processing,
            updated_at: new Date()
          }
        }
      )
      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift()
        await fsPromise.unlink(videoPath)
        await databaseService.videoStatus.updateOne(
          { name: idName },
          {
            $set: {
              status: EncodingStatus.Completed,
              updated_at: new Date()
            }
          }
        )
        console.log(`Encode video ${videoPath} success`)
      } catch (error) {
        console.log(`Encode video ${videoPath} failed`)
        await databaseService.videoStatus
          .updateOne(
            { name: idName },
            {
              $set: {
                status: EncodingStatus.Failed,
                updated_at: new Date()
              }
            }
          )
          .catch((err) => {
            console.error(err)
          })
        console.error(error)
      }
      this.endcoding = false
      this.processEncode()
    } else {
      console.log('Encode video queue is empty')
    }
  }
}

const queue = new Queue()
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
    const result: Media[] = files.map((file) => {
      return {
        url: isProduction
          ? `${process.env.HOST}/static/video/${file.newFilename}`
          : `http://localhost:3000/static/video/${file.newFilename}`,
        type: MediaType.Video
      }
    })
    return result
  }

  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        queue.enqueue(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video-hls/${newName}.m3u8`
            : `http://localhost:3000/static/video-hls/${newName}.m3u8`,
          type: MediaType.HLS
        }
      })
    )
    return result
  }
  async getVideoStatus(id: string){
    const data = await databaseService.videoStatus.findOne({name: id})
    return data
  }
}
const mediasService = new MediasService()
export default mediasService
