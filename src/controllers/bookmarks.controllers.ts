import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BOOKMARKS_MESSAGES } from '~/constants/messages'
import { BookmarkTweetReqBody } from '~/models/requests/Bookmarks.requests'
import { TokenPayload } from '~/models/requests/Users.requests'
import bookmarkService from '~/services/bookmarks.services'

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarkService.bookmarkTweet(user_id, req.body.tweet_id)
  return res.json({ message: BOOKMARKS_MESSAGES.BOOKMARK_SUCCESS, result })
}

export const unBookmarkTweetController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const tweet_id = req.params.tweet_id
  const result = await bookmarkService.unBookmarkTweet(user_id, tweet_id)
  return res.json({ message: BOOKMARKS_MESSAGES.UN_BOOKMARK_SUCCESS, result })
}