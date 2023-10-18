import { Router } from 'express'
import { searchController } from '~/controllers/search.controllers'
import { searchValidator } from '~/middlewares/search.middleware'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
const searchRouter = Router()

searchRouter.get(
  '/',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  searchValidator,
  searchController
)

export default searchRouter
