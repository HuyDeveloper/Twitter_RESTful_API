import express from 'express'
import userRouter from '~/routes/users.routes'
import mediaRouter from '~/routes/medias.routes'
import staticRouter from '~/routes/static.routes'
import databaseService from '~/services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middleware'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_VIDEO_DIR } from './constants/dir'

config()
const app = express()
const port = process.env.PORT || 3000

initFolder()

databaseService.connect()
app.get('/', (req, res) => {
  res.send('hello world')
})
app.use(express.json())
app.use('/users', userRouter)
app.use('/medias', mediaRouter)
app.use('/static', staticRouter)
app.use(defaultErrorHandler)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})