import { checkSchema } from 'express-validator'
import { MediaQuery, PeopleFollow } from '~/constants/enum'
import { SEARCH_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const searchValidator = validate(
  checkSchema(
    {
      content: {
        isString: {
          errorMessage: SEARCH_MESSAGES.CONTENT_IS_REQUIRED
        }
      },
      media_type: {
        optional: true,
        isIn: {
          options: [Object.values(MediaQuery)]
        },
        errorMessage: SEARCH_MESSAGES.MEDIA_TYPE_IS_INVALID
      },
      people_follow: {
        optional: true,
        isIn:{
          options: [Object.values(PeopleFollow)]
        },
        errorMessage: SEARCH_MESSAGES.PEOPLE_FOLLOW_IS_INVALID
      }
    },
    ['query']
  )
)
