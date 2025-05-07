import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

export const discussValidation = {
  createNew: async (req, res, next) => {
    const correctCondition = Joi.object({
      heritageId: Joi.string()
        .required()
        .pattern(OBJECT_ID_RULE)
        .message(OBJECT_ID_RULE_MESSAGE),
      userId: Joi.string()
        .required()
        .pattern(OBJECT_ID_RULE)
        .message(OBJECT_ID_RULE_MESSAGE),
      content: Joi.string().required().trim().strict(),
      parentId: Joi.string()
        .pattern(OBJECT_ID_RULE)
        .message(OBJECT_ID_RULE_MESSAGE)
        .allow(null, '')
    })

    try {
      req.body.userId = req.userId
      await correctCondition.validateAsync(req.body, {
        abortEarly: false,
        allowUnknown: true
      })
      next()
    } catch (error) {
      next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
  },

  updateComment: async (req, res, next) => {
    const updateSchema = Joi.object({
      content: Joi.string().trim().strict().required()
    })

    try {
      await updateSchema.validateAsync(req.body, {
        abortEarly: false,
        allowUnknown: false
      })
      next()
    } catch (error) {
      next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
    }
  },


  getCommentById: async (req, res, next) => {
    const correctCondition = Joi.object({
      id: Joi.string()
        .required()
        .pattern(OBJECT_ID_RULE)
        .message(OBJECT_ID_RULE_MESSAGE)
    })

    try {
      await correctCondition.validateAsync(req.params, { abortEarly: false })
      next()
    } catch (error) {
      next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
    }
  },

  getCommentByParentId: async (req, res, next) => {
    const processedQuery = {
      ...req.query,
      parentId: req.query.parentId === 'null' ? null : req.query.parentId
    }

    const correctCondition = Joi.object({
      heritageId: Joi.string()
        .required()
        .pattern(OBJECT_ID_RULE)
        .message(OBJECT_ID_RULE_MESSAGE),
      parentId: Joi.string()
        .pattern(OBJECT_ID_RULE)
        .message(OBJECT_ID_RULE_MESSAGE)
        .allow(null, '')
    })

    try {
      await correctCondition.validateAsync(processedQuery, { abortEarly: false })
      req.query = processedQuery
      next()
    } catch (error) {
      next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
    }
  },

  deleteComment: async (req, res, next) => {
    const correctCondition = Joi.object({
      id: Joi.string()
        .required()
        .pattern(OBJECT_ID_RULE)
        .message(OBJECT_ID_RULE_MESSAGE)
    })

    try {
      await correctCondition.validateAsync(req.params, { abortEarly: false })
      next()
    } catch (error) {
      next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
    }
  },

  deleteNestedById: async (req, res, next) => {
    const correctCondition = Joi.object({
      heritageId: Joi.string()
        .required()
        .pattern(OBJECT_ID_RULE)
        .message(OBJECT_ID_RULE_MESSAGE),
      commentId: Joi.string()
        .required()
        .pattern(OBJECT_ID_RULE)
        .message(OBJECT_ID_RULE_MESSAGE)
    })

    try {
      await correctCondition.validateAsync(req.query, { abortEarly: false })
      next()
    } catch (error) {
      next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
    }
  }

}