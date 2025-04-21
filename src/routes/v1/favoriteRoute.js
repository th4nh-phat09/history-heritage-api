import express from 'express'
import { favoriteController } from '~/controllers/favoriteController'
import { favoriteValidation } from '~/validations/favoriteValidation'


const Router = express.Router()

// get all, create
Router.route('/')
  .get(favoriteValidation.getAll, favoriteController.getAll)

// get by userId with pagination
Router.route('/user/:userId')
  .get(favoriteValidation.getByUserId, favoriteController.getByUserId)

// get detail, update, and delete favorite
Router.route('/:id')
  .get(favoriteValidation.getFavoriteById, favoriteController.getFavoriteById)
  .put(favoriteValidation.update, favoriteController.update)

// tạo mới nếu chưa có favorite list, nếu có rồi thì thêm vào danh sách item(heritageId)
Router.route('/add-to-favorites')
  .post(favoriteValidation.addToFavorites, favoriteController.addToFavorites)

Router.route('/user/:userId/heritage/:heritageId')
  .delete(favoriteValidation.deleteFavoriteByHeritageId, favoriteController.deleteFavoriteByHeritageId)

export const favoriteRoute = Router
