import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  JWT_TOKEN_RULE,
  JWT_TOKEN_RULE_MESSAGE,
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE,
  PASSWORD_RULE,
  PASSWORD_RULE_MESSAGE,
  PHONE_RULE,
  PHONE_RULE_MESSAGE
} from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string()
      .required()
      .pattern(EMAIL_RULE)
      .message(EMAIL_RULE_MESSAGE),
    password: Joi.string()
      .required()
      .pattern(PASSWORD_RULE)
      .message(PASSWORD_RULE_MESSAGE)
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

const signIn = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
  }
}

const getUserById = async (req, res, next) => {
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

const GENDER_OPTION = {
  MEN: 'men',
  WOMAN: 'woman',
  OTHER: 'other'
}

const updateUser = async (req, res, next) => {
  const updateSchema = Joi.object({
    displayname: Joi.string().trim().strict(),
    phone: Joi.string().pattern(PHONE_RULE).message(PHONE_RULE_MESSAGE),
    gender: Joi.string().valid(
      GENDER_OPTION.MEN,
      GENDER_OPTION.WOMAN,
      GENDER_OPTION.OTHER
    ),
    dateOfBirth: Joi.date().allow(null).optional(),
    avatar: Joi.string()
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

const updateUserByUserId = async (req, res, next) => {
  // Validate both params and body
  const validationSchema = Joi.object({
    // Params validation
    params: Joi.object({
      id: Joi.string()
        .required()
        .pattern(OBJECT_ID_RULE)
        .message(OBJECT_ID_RULE_MESSAGE)
    }),

    // Body validation
    body: Joi.object({
      displayname: Joi.string().trim().strict(),
      phone: Joi.string().pattern(PHONE_RULE).message(PHONE_RULE_MESSAGE),
      gender: Joi.string().valid(
        GENDER_OPTION.MEN,
        GENDER_OPTION.WOMAN,
        GENDER_OPTION.OTHER
      ),
      dateOfBirth: Joi.date().allow(null).optional(),
      avatar: Joi.string(),
      role: Joi.string().valid('admin', 'user'),
      'account.isActive': Joi.boolean() // Add account status validation
    })
  })

  try {
    // Validate both params and body together
    await validationSchema.validateAsync({
      params: req.params,
      body: req.body
    }, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const deleteAccount = async (req, res, next) => {
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
    limit: Joi.number().integer().min(5).max(1000).default(10),
    search: Joi.string().trim().allow(''),
    sort: Joi.string().valid('displayname', 'createAt', 'updatedAt').default('createAt'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  })

  try {
    const validatedValue = await correctCondition.validateAsync(req.query, { abortEarly: false })
    req.query = validatedValue // Chuẩn hóa dữ liệu
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, error.message))
  }
}

const refreshToken = async (req, res, next) => {
  const correctCondition = Joi.object({
    refreshToken: Joi.string().required().pattern(JWT_TOKEN_RULE).message(JWT_TOKEN_RULE_MESSAGE)
  })
  const refreshToken = req.cookies['refreshToken']
  try {
    await correctCondition.validateAsync({ refreshToken }, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
  }
}

const forgotPassword = async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .pattern(EMAIL_RULE)
      .message(EMAIL_RULE_MESSAGE)
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, error.message))
  }
}

const resetPassword = async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .pattern(EMAIL_RULE)
      .message(EMAIL_RULE_MESSAGE),
    code: Joi.string().required(),
    newPassword: Joi.string()
      .required()
      .pattern(PASSWORD_RULE)
      .message(PASSWORD_RULE_MESSAGE)
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, error.message))
  }
}

export const userValidation = {
  createNew,
  getUserById,
  updateUser,
  updateUserByUserId,
  deleteAccount,
  getAll,
  signIn,
  refreshToken,
  forgotPassword,
  resetPassword
}
