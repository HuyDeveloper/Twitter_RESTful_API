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
  resetPasswordController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  forgotPasswordValidator,
  verifyForgotPasswordTokenValidator,
  resetPasswordValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from './../utils/handlers'
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
export default router
