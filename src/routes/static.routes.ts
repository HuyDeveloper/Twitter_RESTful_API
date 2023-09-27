import { Router } from 'express'
import { serveImageController, serveVideoStreamController } from '~/controllers/medias.controllers'
const router = Router()

router.get('/image/:name', serveImageController)
router.get('/video-stream/:name', serveVideoStreamController)

export default router
