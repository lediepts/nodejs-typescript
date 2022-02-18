/**
 * Required External Modules
 */
import cors from 'cors'
import * as dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import { createServer } from 'http'
import mongoose from 'mongoose'
import morgan from 'morgan'
import path from 'path'
import * as rfs from 'rotating-file-stream'
import { chatRouter } from './chat/chat.router'
import { cmdRouter } from './cmd/cmd.router'
import { itemsRouter } from './items/items.router'
import fs from 'fs'

dotenv.config()
/**
 * App Variables
 */
if (!process.env.PORT) {
  process.exit(1)
}
const PORT: number = parseInt(process.env.PORT as string, 10)

/**
 * log setting
 */
const accessLogStream = rfs.createStream('access.log', {
  interval: '1h', // rotate daily
  path: path.join(process.cwd(), 'log'),
})

/**
 *  App Configuration
 */

const app = express()
export const server = createServer(app)
import './socketIO'
import { test } from './socketIO'
import { cwd } from 'process'
import { cwsysRouter } from './cwsys'
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('combined', { stream: accessLogStream }))
app.use(morgan('dev'))
app.use('/api/menu/items', itemsRouter)
app.use('/cmd', cmdRouter)
app.use('/chat', chatRouter)
app.use('/cwsys', cwsysRouter)
/**
 * Connect MongoDB
 */
mongoose.connect(
  `mongodb://localhost:27017`,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    auth: {
      user: 'root',
      password: 'P@ssw0rd',
    },
  },
  () => {
    console.log('connected')
  }
)

/**
 * Server Activation
 */

app.get('/', (req, res) => {
  // test('hello from socket io')
  res.send(200)
})
server.listen(PORT, () => {
  console.log(`listening on http://127.0.0.1:${PORT}`)
})
