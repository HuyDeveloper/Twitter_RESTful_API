import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  ChangePasswordBody,
  FollowReqBody,
  RegisterReqBody,
  TokenPayload,
  UnfollowReqParams,
  UpdateMeReqBody,
  logoutReqBody
} from '~/models/requests/Users.requests'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { pick, result } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { UserVerifyStatus } from '~/constants/enum'
import { PassThrough } from 'stream'
export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await userService.login({ user_id: user_id.toString(), verify: user.verify })
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await userService.register(req.body)
  return res.status(400).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, logoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)
  return res.json(result)
}

export const refreshTokenController = async (req: Request, res: Response) => {
  const { refresh_token } = req.body
  const { user_id, verify } = req.decoded_refresh_token as TokenPayload
  const result = await userService.refreshToken({ user_id, verify, refresh_token })
  return res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}

export const emailVerifyTokenController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  if (!user) {
    return res.status(404).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.email_verify_token === '') {
    return res.status(200).json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await userService.verifyEmail(user_id)
  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendEmailVerifyTokenController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.verify == UserVerifyStatus.Verified) {
    return res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await userService.resendEmailVerifyToken(user_id)
  return res.status(HTTP_STATUS.OK).json({
    result
  })
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { _id, verify } = req.user as User
  const result = await userService.forgotPassword({ user_id: (_id as ObjectId)?.toString(), verify: verify })
  return res.json({
    result
  })
}

export const veridyForgotPasswordController = async (req: Request, res: Response) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
  })
}

export const resetPasswordController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  const result = await userService.resetPassword(user_id, password)
  return res.json({ result })
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await userService.getMe(user_id)
  return res.json({ user, message: USERS_MESSAGES.GET_ME_SUCCESS })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const user = await userService.updateMe(user_id, body)
  return res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    result: user
  })
}

export const getProfileController = async (req: Request<{ username: string }>, res: Response) => {
  const { username } = req.params
  const user = await userService.getProfile(username)
  return res.json({
    result: user,
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS
  })
}
export const followController = async (req: Request<ParamsDictionary, any, FollowReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload //user cua ban than
  const { followed_user_id } = req.body // user cua nguoi duoc follow
  const user = await userService.follow(user_id, followed_user_id)
  return res.json({
    result: user
  })
}

export const unfollowController = async (req: Request<UnfollowReqParams>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: followed_user_id } = req.params
  const result = await userService.unfollow(user_id, followed_user_id)
  return res.json({
    result
  })
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await userService.changePassword(user_id, password)
  return res.json({ result })
}
