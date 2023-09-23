import { ObjectId } from "mongodb"
interface FollowerType {
  _id?: ObjectId
  user_id: ObjectId
  followed_user_id: ObjectId
  created_at?: Date
}

export default class Follower {
  _id?: ObjectId
  user_id: ObjectId
  followed_user_id: ObjectId
  created_at: Date
  constructor(follow: FollowerType) {
    const date = new Date()
    this._id = follow._id
    this.user_id = follow.user_id
    this.followed_user_id = follow.followed_user_id
    this.created_at = follow.created_at || date
  }
}