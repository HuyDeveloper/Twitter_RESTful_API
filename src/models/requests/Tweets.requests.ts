import { TweetAudience, TweetType } from '~/constants/enum'
import { Media } from '~/models/Other'

export interface TweetReqBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: string[]
  mentions: string[]
  medias: Media[]
}

export interface Pagination {
  limit: string
  page: string
}
