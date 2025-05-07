import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import {
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE
} from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    heritageId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

    rankings: Joi.array()
      .items(
        Joi.object({
          userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
          rank: Joi.number(),
          score: Joi.number().required(),
          displayName: Joi.string().trim().strict(),
          completeDate: Joi.date()
        })
      )
  })
  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    )
  }
}

const getLeaderBoardById = async (req, res, next) => {
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


const updateLeaderBoard = async (req, res, next) => {
  const idCondition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })
  const bodyCondition = Joi.object({
    heritageId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

    rankings: Joi.array()
      .items(
        Joi.object({
          userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
          rank: Joi.number().required(),
          score: Joi.number().required(),
          displayName: Joi.string().trim().strict(),
          completeDate: Joi.date()
        })
      )
  })

  try {
    await idCondition.validateAsync(req.params, { abortEarly: false })
    await bodyCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const deleteLeaderBoard = async (req, res, next) => {
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

const getAll = async (req, res, next) => {
  const correctCondition = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(5).max(50).default(10),
    search: Joi.string().trim().allow(''),
    sort: Joi.string().valid('createAt', 'updatedAt', 'stats.highestScore').default('createAt'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  })

  try {
    const validatedValue = await correctCondition.validateAsync(req.query, { abortEarly: false });
    req.query = validatedValue
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, error.message))
  }
}

const getByHeritageId = async (req, res, next) => {
  const paramsCondition = Joi.object({
    heritageId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  const queryCondition = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(5).max(50).default(20)
  })

  try {
    await paramsCondition.validateAsync(req.params, { abortEarly: false })
    const validatedQuery = await queryCondition.validateAsync(req.query, { abortEarly: false })
    req.query = validatedQuery
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
  }
}

export const leaderBoardValidation = {
  createNew,
  getLeaderBoardById,
  updateLeaderBoard,
  deleteLeaderBoard,
  getAll,
  getByHeritageId
}
