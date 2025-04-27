import express from 'express'
import { heritageValidation } from '~/validations/heritageValidation'
import { heritageController } from '~/controllers/heritageController'

const Router = express.Router()

Router.route('/explore')
  .get(heritageController.getNearestHeritages)

// Lấy danh sách di tích
Router.route('/')
  .get(heritageValidation.getHeritages, heritageController.getHeritages)
  .post(heritageValidation.createHeritage, heritageController.createHeritage)

Router.route('/:nameSlug')
  .get(heritageValidation.getHeritageBySlug, heritageController.getHeritageBySlug)


// Lấy chi tiết, cập nhật và xóa di tích
Router.route('/:id')
  .get(heritageValidation.getHeritageById, heritageController.getHeritageDetail)
  .put(heritageValidation.updateHeritage, heritageController.updateHeritage)
  .delete(heritageValidation.deleteHeritage, heritageController.deleteHeritage)

export const historyHeritageRoute = Router
