import express from 'express'
import { CONNECT_DB, CLOSE_DB } from './config/mongodb'
import exitHook from 'async-exit-hook'
import cookieParser from 'cookie-parser'
import { APIs_V1 } from './routes/v1'
import { env } from '~/config/environment'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { corsOptions } from '~/config/cors'
import { Server } from 'socket.io'
import { createServer } from 'http'
import { registerSockets } from '~/sockets/index.js'
import cors from 'cors'


const START_SERVER = () => {
  const app = express()
  const server = createServer(app)
  const io = new Server(server, {
    cors: corsOptions
  })
  //global._io = io
  registerSockets(io)
  console.log('registerSockets')
  app.use(cookieParser())
  app.use(cors(corsOptions))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/v1', APIs_V1)
  app.use(errorHandlingMiddleware)
  server.listen(env.LOCAL_APP_PORT, () => {
    console.log(`Hello World, I am running at ${env.LOCAL_APP_PORT}:${env.LOCAL_APP_HOST}/`)
  })
  console.log(env.BUILD_MODE)
  console.log(env.LOCAL_APP_PORT)
  exitHook(() => {
    console.log('Disconnecting database connection')
    CLOSE_DB()
    console.log('Disconnected database connection')
  })

}


(async () => {
  try {
    console.log('Connecting to database')
    await CONNECT_DB()
    console.log('Connected to database')
    START_SERVER()
  } catch (error) {
    console.error('Error connecting to database:', error)
    process.exit(0)
  }
})()

// CONNECT_DB()
//   .then(() => console.log('Connected to database'))
//   .then(() => START_SERVER() )
//   .catch(error => {
//     console.error('Error connecting to database:', error)
//     process.exit(0)
//   })

