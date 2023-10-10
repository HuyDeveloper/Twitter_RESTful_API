import { Router } from 'express'
import { createTweetController, getNewFeedsController, getTweetChildrenController, getTweetController } from '~/controllers/tweets.controllers'
import { createTweetValidator, tweetIdValidator, audienceValidator, getTweetChildrenValidator, paginationValidator } from '~/middlewares/tweets.middleware'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
const router = Router()

router.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

router.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  wrapRequestHandler(audienceValidator),
  wrapRequestHandler(getTweetController)
)

//Get tweet children
router.get(
  '/:tweet_id/children',
  tweetIdValidator,
  getTweetChildrenValidator,
  paginationValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  wrapRequestHandler(audienceValidator),
  wrapRequestHandler(getTweetChildrenController)
)

//Get new feeds
router.get(
  '/',
  paginationValidator,
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getNewFeedsController)
)
export default router
