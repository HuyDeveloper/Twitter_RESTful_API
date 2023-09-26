import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import formidable, { File } from 'formidable'
import { flatMap } from 'lodash'
import { UPLOAD_TEMP_DIR } from '~/constants/dir'
export const initFolder = () => {
  if (fs.existsSync(UPLOAD_TEMP_DIR)) {
    return
  }
  fs.mkdirSync(UPLOAD_TEMP_DIR, {
    recursive: true
  })
}

export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    maxFiles: 1,
    keepExtensions: true,
    maxFields: 300 * 1024,
    filter: ({ originalFilename, name, mimetype }) => {
      console.log({ name, mimetype, originalFilename })
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File is not valid') as any)
      }

      return valid
    }
  })
  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }
      resolve((files.image as File[])[0])
    })
  })
}

export const getNameFromFullname = (fullname: string) => {
  const namearr = fullname.split('.')
  namearr.pop()
  return namearr.join('.')
}