import { Request, Response, NextFunction } from 'express'
import { TweetReqBody } from '~/models/requests/Tweets.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import tweetService from '~/services/tweets.services'
import { TokenPayload } from '~/models/requests/Users.requests'
export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.createTweet(user_id, req.body)
  return res.status(200).json({ message: 'Creat tweet successfully', result })
}
