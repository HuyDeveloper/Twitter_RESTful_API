export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}
export enum MediaType {
  Image,
  Video,
  HLS
}

export enum MediaQuery {
  Image = 'image',
  Video = 'video'
}

export enum EncodingStatus {
  Pending,
  Processing,
  Completed,
  Failed
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}

export enum TweetAudience {
  Everyone,
  TwitterCircle
}

export enum PeopleFollow {
  Anyone = '0',
  Follow = '1'
}