import express from 'express'
import { userController } from '~/controllers/userController'
import { authMiddlewares } from '~/middlewares/authMiddeware'
import { userValidation } from '~/validations/userValidation'
import { uploadRoute } from './uploadRoute'
// import { authMiddlewares } from '~/middlewares/authMiddeware'

const Router = express.Router()

// API to register account
Router.route('/auth/register')
  .post(userValidation.createNew, userController.createNew)

// get all user
Router.route('/auth/')
  .post(userValidation.signIn, userController.signIn)

Router.route('/auth/refresh-token')
  .post(userValidation.refreshToken, userController.refreshToken)


// Router.use(authMiddlewares.authentication)
Router.use('/upload', uploadRoute)
Router.route('/profile')
  .get(authMiddlewares.authentication, userController.getUserProfile)
  .put(authMiddlewares.authentication, userValidation.updateUser, userController.updateUser)


// gen new access token bang refresh token


Router.route('/auth/logout')
  .delete(authMiddlewares.authentication, userController.logout)

// get all user
Router.route('/')
  .get(authMiddlewares.authentication, userValidation.getAll, userController.getAll)

// get detail, update, and delete user
Router.route('/:id')
  .get(userValidation.getUserById, userController.getUserById)
  .delete(authMiddlewares.authentication, authMiddlewares.authorization, userValidation.deleteAccount, userController.deleteAccount)


export const userRoute = Router
