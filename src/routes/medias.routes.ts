import { Router } from 'express'
import {
  uploadImageController,
  uploadVideoController,
  uploadVideoHLSController,
  videoStatusController
} from '~/controllers/medias.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
const router = Router()

router.post('/upload-image', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(uploadImageController))
router.post('/upload-video', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(uploadVideoController))
router.post(
  '/upload-video-hls',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoHLSController)
)
router.get('/video-status/:id', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(videoStatusController))
export default router
