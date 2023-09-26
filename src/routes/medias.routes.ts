import { Router } from 'express'
import { uploadSingleImageController } from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
const router = Router()

router.post('/upload-image', wrapRequestHandler(uploadSingleImageController))
export default router
