import { Router } from 'express'
import { likeTweetController, unLikeTweetController } from '~/controllers/likes.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const router = Router()

router.post('/', accessTokenValidator, verifiedUserValidator, tweetIdValidator, wrapRequestHandler(likeTweetController))
router.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unLikeTweetController)
)
export default router