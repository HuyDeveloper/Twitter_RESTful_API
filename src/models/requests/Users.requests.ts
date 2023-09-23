import { JwtPayload } from "jsonwebtoken"
import { TokenType, UserVerifyStatus } from "~/constants/enum"
export interface LoginReqBody {
  email: string
  password: string
}
export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface UpdateMeReqBody{
  name?: string
  date_of_birth?: Date
  bio?: string
  avatar?: string
  location?: string
  website?: string
  username?: string
  cover_photo?: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify: UserVerifyStatus
}

export interface logoutReqBody {
  refresh_token: string
}

export interface FollowReqBody {
  followed_user_id: string
}

export interface UnfollowReqParams {
  user_id: string
}