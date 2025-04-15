import express from 'express'
import { userController } from '~/controllers/userController'
import { userValidation } from '~/validations/userValidation'


const Router = express.Router()

// API to register account
Router.route('/register')
  .post(userValidation.createNew, userController.createNew)

// get all user
Router.route('/')
  .get(userController.getAll).post(userController.signIn)

// get detail, update, and delete user
Router.route('/:id')
  .get(userValidation.getUserById, userController.getUserById)
  .put(userValidation.updateUser, userController.updateUser)
  .delete(userValidation.deleteAccount, userController.deleteAccount)

export const userRoute = Router
