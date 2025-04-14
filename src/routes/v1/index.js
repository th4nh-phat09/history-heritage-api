import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { historyHeritageRoute } from './historyHeritageRoute'
const Router = express.Router()

// check status v1
Router.get('/status', (req, res) => {
    res.status(StatusCodes.OK).json({ message: 'API v1 is working' })
})

// historyHeritageRoute APIs
Router.use('/heritages', historyHeritageRoute)


export const APIs_V1 = Router