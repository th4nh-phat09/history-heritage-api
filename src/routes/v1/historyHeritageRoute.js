import express from 'express'
import { heritageValidation } from '~/validations/heritageValidation'
import { heritageController } from '~/controllers/heritageController'

const Router = express.Router()

// Lấy danh sách di tích
Router.route('/')
  .get(heritageValidation.getHeritages, heritageController.getHeritages)
  .post(heritageValidation.createHeritage, heritageController.createHeritage)

// Lấy chi tiết, cập nhật và xóa di tích
Router.route('/:id')
  .get(heritageValidation.getHeritageById, heritageController.getHeritageDetail)
  .put(heritageValidation.updateHeritage, heritageController.updateHeritage)
  .delete(heritageValidation.deleteHeritage, heritageController.deleteHeritage)

export const historyHeritageRoute = Router
