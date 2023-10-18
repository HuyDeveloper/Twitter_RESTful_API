import { MediaQuery, PeopleFollow } from '~/constants/enum'
import { Pagination } from './Tweets.requests'
import { Query } from 'express-serve-static-core'
export interface SearchReqQuery extends Pagination, Query {
  content: string
  media_type: MediaQuery
  people_follow: PeopleFollow
}