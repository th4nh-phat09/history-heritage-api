import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { heritageValidation } from '~/validations/heritageValidation'
import { heritageController } from '~/controllers/heritageController'

const Router = express.Router()

Router.route('/')
    .get(heritageValidation.getHeritages, heritageController.getHeritages)


export const historyHeritageRoute = Router
