import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { historyHeritageRoute } from './historyHeritageRoute'
import { userRoute } from './userRoute'
import { leaderBoardRoute } from './leaderBoardRoute'
import { knowledgeTestRoute } from './knowledgeTestRoute'

const Router = express.Router()

// check status v1
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'API v1 is working' })
})

// historyHeritageRoute APIs
Router.use('/heritages', historyHeritageRoute)

// user APIs
Router.use('/users', userRoute)

// leaderBoard APIs
Router.use('/leaderBoards', leaderBoardRoute)

// knowledgeTest APIs
Router.use('/knowledge-tests', knowledgeTestRoute)

export const APIs_V1 = Router
