import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import { log } from 'node:console'
import ApiError from '~/utils/ApiError'
import {
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE
} from '~/utils/validators'

const COMMENT_STATUS = {
  DELETED: 'DELETED',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
}

const getAll = async (req, res, next) => {

  const correctCondition = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().trim().allow(''),
    sort: Joi.string().valid('createdAt', 'updatedAt', 'likesCount').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    heritageId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null).optional()
  })

  try {
    const validatedValue = await correctCondition.validateAsync(req.query, { abortEarly: false })
    req.query = validatedValue // Chuẩn hóa dữ liệu
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, error.message))
  }
}

const createNew = async (req, res, next) => {

  const correctCondition = Joi.object({
    heritageId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    content: Joi.string()
      .required()
      .trim(),
    images: Joi.array().items(Joi.string()).default([]).optional(),
    rating: Joi.number().min(1).max(5).allow(null).optional()
  })

  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const getCommentById = async (req, res, next) => {
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
}

const updateComment = async (req, res, next) => {
  const updateSchema = Joi.object({
    content: Joi.string().trim().strict().optional(),
    images: Joi.array().items(Joi.string()).default([]).optional(),
    rating: Joi.number().min(1).max(5).allow(null).optional(),
    url: Joi.string().allow(null).optional()
  })

  try {
    await updateSchema.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const deleteComment = async (req, res, next) => {
  const correctCondition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  try {
    await correctCondition.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
  }
}

const likeComment = async (req, res, next) => {
  const correctCondition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  try {
    await correctCondition.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
  }
}

export const commentValidation = {
  getAll,
  createNew,
  getCommentById,
  updateComment,
  deleteComment,
  likeComment
}