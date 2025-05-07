import express from 'express'
import { discussController } from '~/controllers/discussController.js'
import { authMiddlewares } from '~/middlewares/authMiddeware'
import { discussValidation } from '~/validations/discussValidation.js'

const Router = express.Router()

Router.route('/')
  .post(authMiddlewares.authentication, discussValidation.createNew, discussController.createNew)
  .get(discussValidation.getCommentByParentId, discussController.getDiscusssByParentId)
  .delete(authMiddlewares.authentication, discussValidation.deleteNestedById, discussController.deleteNesstedById)


export const discussRoute = Router