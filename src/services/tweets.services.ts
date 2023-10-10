import { TweetReqBody } from '~/models/requests/Tweets.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { TweetType } from '~/constants/enum'
import userService from './users.services'

export class TweetService {
  async checkAndCreateHashtag(hashtag: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtag.map((item) => {
        return databaseService.hashtags.findOneAndUpdate(
          { name: item },
          { $setOnInsert: new Hashtag({ name: item }) },
          { upsert: true, returnDocument: 'after' }
        )
      })
    )
    return hashtagDocuments.map((item) => (item.value as WithId<Hashtag>)._id)
  }

  async createTweet(user_id: string, body: TweetReqBody) {
    const hashtag = await this.checkAndCreateHashtag(body.hashtags)
    console.log(hashtag)
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags: hashtag,
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    )
    const tweet = await databaseService.tweets.findOne({ _id: result.insertedId })
    return tweet
  }
  async increaseView(tweet_id: string, user_id?: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await databaseService.tweets.findOneAndUpdate(
      { _id: new ObjectId(tweet_id) },
      { $inc: inc, $currentDate: { updated_at: true } },
      { returnDocument: 'after', projection: { user_views: 1, guest_views: 1, updated_at: 1 } }
    )
    return result.value as WithId<{
      guest_views: number
      user_views: number
      updated_at: Date
    }>
  }
  async getTweetChildren({
    tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  }: {
    tweet_id: string
    tweet_type: TweetType
    limit: number
    page: number
    user_id?: string
  }) {
    const tweets = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  name: '$$mention.name',
                  username: '$$mention.username',
                  email: '$$mention.email'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'likes'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_children'
          }
        },
        {
          $addFields: {
            bookmark_count: {
              $size: '$bookmarks'
            },
            like_count: {
              $size: '$likes'
            },
            retweet_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Retweet]
                  }
                }
              }
            },
            comment_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Comment]
                  }
                }
              }
            },
            quote_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.QuoteTweet]
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            tweet_children: 0
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()
    const ids = tweets.map((item) => item._id as ObjectId)
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const [, total] = await Promise.all([
      databaseService.tweets.updateMany({ _id: { $in: ids } }, { $inc: inc, $set: { updated_at: new Date() } }),
      databaseService.tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      })
    ])
    tweets.forEach((item) => {
      item.updated_at = new Date()
      if (user_id) {
        item.user_views += 1
      } else {
        item.guest_views += 1
      }
    })
    return {
      tweets,
      total
    }
  }
  async getNewFeeds({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const user_id_object = new ObjectId(user_id)
    const followed_user_id = await databaseService.follow
      .find(
        { user_id: new ObjectId(user_id) },
        {
          projection: {
            followed_user_id: 1,
            _id: 0
          }
        }
      )
      .toArray()
    const ids = followed_user_id.map((item) => item.followed_user_id)
    ids.push(user_id_object)
    const tweets = await databaseService.tweets
      .aggregate([
        {
          $match: {
            user_id: {
              $in: ids
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user'
          }
        },
        {
          $match: {
            $or: [
              {
                audience: 0
              },
              {
                $and: [
                  {
                    audience: 1
                  },
                  {
                    'user.twitter_circles': {
                      $in: [user_id_object]
                    }
                  }
                ]
              }
            ]
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  name: '$$mention.name',
                  username: '$$mention.username',
                  email: '$$mention.email'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'likes'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_children'
          }
        },
        {
          $addFields: {
            bookmark_count: {
              $size: '$bookmarks'
            },
            like_count: {
              $size: '$likes'
            },
            retweet_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Retweet]
                  }
                }
              }
            },
            comment_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Comment]
                  }
                }
              }
            },
            quote_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.QuoteTweet]
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            tweet_children: 0,
            user: {
              password: 0,
              email_verify_token: 0,
              forgot_password_token: 0,
              twitter_circles: 0,
              date_of_birth: 0
            }
          }
        }
      ])
      .toArray()
    return tweets
  }
}

const tweetService = new TweetService()
export default tweetService
