import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { userRoute } from './userRoute'

const Router = express.Router()

// check status v1
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'API v1 is working' })
})

// user APIs
Router.use('/users', userRoute)


export const APIs_V1 = Router
