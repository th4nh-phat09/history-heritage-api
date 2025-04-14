import express from 'express'
import { userController } from '~/controllers/userController'
import { userValidation } from '~/validations/userValidation'


const Router = express.Router()

// API to handle get all user for admin management
Router.route('/getAll')
  .get(userController.getAll)

// API to register account
Router.route('/register')
  .post(userValidation.createNew, userController.createNew)


export const userRoute = Router
