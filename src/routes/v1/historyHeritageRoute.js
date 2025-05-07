import express from 'express'
import { heritageValidation } from '~/validations/heritageValidation'
import { heritageController } from '~/controllers/heritageController'
import { heritageUploadRoute } from './heritageUploadRoute'

const Router = express.Router()


Router.route('/explore')
  .get(heritageController.getNearestHeritages)

Router.route('/all-name')
  .get(heritageController.getAllHeritageNames)

Router.route('/')
  .get(heritageValidation.getHeritages, heritageController.getHeritages)
  .post(heritageValidation.createHeritage, heritageController.createHeritage)

Router.route('/:nameSlug')
  .get(heritageValidation.getHeritageBySlug, heritageController.getHeritageBySlug)

Router.route('/id/:id')
  .get(heritageValidation.getHeritageById, heritageController.getHeritageDetail)
  .put(heritageValidation.updateHeritage, heritageController.updateHeritage)
  .delete(heritageValidation.deleteHeritage, heritageController.deleteHeritage)

Router.use('/upload', heritageUploadRoute)


export const historyHeritageRoute = Router
