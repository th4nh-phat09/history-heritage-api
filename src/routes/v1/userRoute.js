import express from 'express'
import { userController } from '~/controllers/userController'
import { userValidation } from '~/validations/userValidation'
import { authMiddlewares } from '~/middlewares/authMiddeware'

const Router = express.Router()

// API to register account
Router.route('/register')
  .post(userValidation.createNew, userController.createNew)

// get all user
Router.route('/')
  .get(userValidation.getAll, userController.getAll)
  .post(userValidation.signIn, userController.signIn)

// get detail, update, and delete user
Router.route('/:id')
  .get(userValidation.getUserById, userController.getUserById)
  .put(userValidation.updateUser, userController.updateUser)
  .delete(userValidation.deleteAccount, userController.deleteAccount)

// gen new access token bang refresh token
Router.route('/refresh_token')
  .put(userValidation.refreshToken, userController.refreshToken)

Router.route('/logout')
  .delete(userController.logout)

export const userRoute = Router
