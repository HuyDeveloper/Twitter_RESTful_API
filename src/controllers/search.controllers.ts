import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { MediaQuery, PeopleFollow } from '~/constants/enum'
import { SearchReqQuery } from '~/models/requests/Search.requests'
import searchService from '~/services/search.services'
export const searchController = async (req: Request<ParamsDictionary, any, any, SearchReqQuery>, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await searchService.search({
    limit,
    page,
    content: req.query.content,
    user_id: req.decoded_authorization?.user_id as string,
    media_type: req.query.media_type,
    people_follow: req.query.people_follow
  })
  return res.json({
    message: 'Search successfully',
    result: {
      tweets: result.tweets,
      page: page,
      limit: limit,
      total_pages: Math.ceil(result.total / limit)
    }
  })
}
