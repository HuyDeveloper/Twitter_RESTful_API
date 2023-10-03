import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { LIKES_MESSAGES } from '~/constants/messages'
import { LikeTweetReqBody } from '~/models/requests/Likes.requests'
import { TokenPayload } from '~/models/requests/Users.requests'
import likeService from '~/services/likes.services'
export const likeTweetController = async (
  req: Request<ParamsDictionary, any, LikeTweetReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await likeService.likeTweet(user_id, req.body.tweet_id)
  return res.json({ message: LIKES_MESSAGES.LIKE_SUCCESS, result })
}

export const unLikeTweetController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const tweet_id = req.params.tweet_id
  const result = await likeService.unLikeTweet(user_id, tweet_id)
  return res.json({ message: LIKES_MESSAGES.UN_LIKE_SUCCESS, result })
}