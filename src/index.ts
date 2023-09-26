import express from 'express'
import userRouter from '~/routes/users.routes'
import mediaRouter from '~/routes/medias.routes'
import databaseService from '~/services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middleware'
import { initFolder } from './utils/file'
const app = express()
const port = 3000

initFolder()

databaseService.connect()
app.get('/', (req, res) => {
  res.send('hello world')
})
app.use(express.json())
app.use('/users', userRouter)
app.use('/medias', mediaRouter)
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})