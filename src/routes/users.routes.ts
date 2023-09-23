import express, { Request, Response, NextFunction } from "express"
import {
  loginController,
  registerController,
  logoutController,
  refreshTokenController,
  emailVerifyTokenController,
  resendEmailVerifyTokenController,
  forgotPasswordController,
  veridyForgotPasswordController,
  resetPasswordController,
  getMeController,
  updateMeController,
  getProfileController,
  followController,
  unfollowController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  forgotPasswordValidator,
  verifyForgotPasswordTokenValidator,
  resetPasswordValidator,
  verifiedUserValidator,
  updateMeValidator,
  followValidator,
  unfollowValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from './../utils/handlers'
import { filterMiddleWare } from "~/middlewares/common.middleware"
import { UpdateMeReqBody } from "~/models/requests/Users.requests"
const router = express.Router()

router.post('/login', loginValidator, wrapRequestHandler(loginController))
router.post('/register', registerValidator, wrapRequestHandler(registerController))
router.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
router.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))
router.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(emailVerifyTokenController))
router.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendEmailVerifyTokenController))
router.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))
router.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(veridyForgotPasswordController)
)
router.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))
router.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))
router.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleWare<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapRequestHandler(updateMeController)
)
router.get('/:username', wrapRequestHandler(getProfileController))
router.post(
  '/follow',
  accessTokenValidator,
  followValidator,
  verifiedUserValidator,
  wrapRequestHandler(followController)
)
router.delete('/follow/:user_id', accessTokenValidator, unfollowValidator, wrapRequestHandler(unfollowController))
export default router
