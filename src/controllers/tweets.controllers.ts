import { Request, Response, NextFunction } from 'express'
import { Pagination, TweetReqBody } from '~/models/requests/Tweets.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import tweetService from '~/services/tweets.services'
import { TokenPayload } from '~/models/requests/Users.requests'
import { TweetType } from '~/constants/enum'
export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.createTweet(user_id, req.body)
  return res.status(200).json({ message: 'Creat tweet successfully', result })
}

export const getTweetController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await tweetService.increaseView(req.params.tweet_id, req.decoded_authorization?.user_id)
  const tweet = {
    ...req.tweet,
    guest_views: result.guest_views,
    user_views: result.user_views,
    updated_at: result.updated_at
  }
  const { tweet_id } = req.params
  res.status(200).json({ message: 'Get tweet successfully', result: tweet })
}

export const getTweetChildrenController = async (req: Request, res: Response, next: NextFunction) => {
  const tweet_type = Number(req.query.tweet_type as string) as TweetType
  const page = Number(req.query.page)
  const user_id = req.decoded_authorization?.user_id
  const limit = Number(req.query.limit)
  const { total, tweets } = await tweetService.getTweetChildren({
    tweet_id: req.params.tweet_id,
    tweet_type: tweet_type,
    limit: limit,
    page: page,
    user_id: user_id
  })
  res.status(200).json({
    message: 'Get tweet children successfully',
    result: {
      tweets,
      page: page,
      limit: limit,
      tweet_type: tweet_type,
      total_pages: Math.ceil(total / limit)
    }
  })
}

export const getNewFeedsController = async (
  req: Request<ParamsDictionary, any, any, Pagination>,
  res: Response,
  next: NextFunction
) => {
  const user_id = req.decoded_authorization?.user_id as string
  const limit = Number(req.query.limit as string)
  const page = Number(req.query.page as string)
  const result = await tweetService.getNewFeeds({ user_id, limit, page })
  res.status(200).json({
    message: 'Get new feeds successfully',
    result: {
      tweets: result.tweets,
      page: page,
      limit: limit,
      total_pages: Math.ceil(result.total / limit)
    }
  })
}
