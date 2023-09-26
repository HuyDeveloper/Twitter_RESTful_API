import { Request, Response, NextFunction } from 'express'
import formidable from 'formidable'
import path from 'path'
import mediasService from '~/services/medias.services'
import { handleUploadImage } from '~/utils/file'
export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await mediasService.handleUploadSingleImage(req)
  return res.json({ result: data, message: 'Upload image success' })
}
