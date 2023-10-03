import { TweetReqBody } from '~/models/requests/Tweets.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'

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
    console.log(hashtag);
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
  
}
const tweetService = new TweetService()
export default tweetService
