import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const getHeritages = async (req, res, next) => {
  const correctCondition = Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
    limit: Joi.number().integer().min(5).max(50).default(10).messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 5',
      'number.max': 'Limit must be at most 50'
    }),
    name: Joi.string().trim().allow('').messages({
      'string.base': 'Name must be a string'
    }),
    location: Joi.string().trim().allow('').messages({
      'string.base': 'Location must be a string'
    }),
    tags: Joi.array().items(Joi.string().trim()).allow(null).messages({
      'array.base': 'Tags must be an array'
    }),
    sort: Joi.string().valid('name', 'createdAt', 'updatedAt', 'averageRating')
      .default('createdAt').messages({
        'string.base': 'Sort must be a string',
        'any.only': 'Sort must be one of name, createdAt, updatedAt, averageRating'
      }),
    order: Joi.string().valid('asc', 'desc').default('desc').messages({
      'string.base': 'Order must be a string',
      'any.only': 'Order must be either asc or desc'
    }),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'ALL').default('ACTIVE').messages({
      'string.base': 'Status must be a string',
      'any.only': 'Status must be one of ACTIVE, INACTIVE, ALL'
    })
  })

  try {
    const validatedValue = await correctCondition.validateAsync(req.query, { abortEarly: false })
    req.query = validatedValue
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
  }
}

const getHeritageById = async (req, res, next) => {
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

const getHeritageBySlug = async (req, res, next) => {
  const correctCondition = Joi.object({
    nameSlug: Joi.string().required()
  })

  try {
    await correctCondition.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
  }
}

const createHeritage = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().min(3).max(100).trim().strict().messages({
      'any.required': 'Tên di tích là bắt buộc',
      'string.empty': 'Tên di tích không được để trống',
      'string.min': 'Tên di tích phải có ít nhất 3 ký tự',
      'string.max': 'Tên di tích không được vượt quá 100 ký tự'
    }),
    description: Joi.string().required().min(10).trim().messages({
      'any.required': 'Mô tả di tích là bắt buộc',
      'string.empty': 'Mô tả di tích không được để trống',
      'string.min': 'Mô tả di tích phải có ít nhất 10 ký tự'
    }),
    images: Joi.array().items(Joi.string().uri().messages({
      'string.uri': 'URL hình ảnh không hợp lệ'
    })).default([]),
    location: Joi.string().required().trim().messages({
      'any.required': 'Vị trí di tích là bắt buộc',
      'string.empty': 'Vị trí di tích không được để trống'
    }),
    coordinates: Joi.object({
      latitude: Joi.string().trim().required().messages({
        'any.required': 'Vĩ độ là bắt buộc',
        'string.empty': 'Vị trí di tích không được để trống'
      }),
      longitude: Joi.string().trim().required().messages({
        'any.required': 'Kinh độ là bắt buộc',
        'string.empty': 'Vị trí di tích không được để trống'
      })
    }).required().messages({
      'any.required': 'Tọa độ là bắt buộc',
      'object.base': 'Tọa độ phải là một object'
    }),
    status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE').messages({
      'any.only': 'Trạng thái phải là ACTIVE hoặc INACTIVE'
    }),
    popularTags: Joi.array().items(Joi.string().trim().messages({
      'string.empty': 'Tag không được để trống'
    })).default([]),
    additionalInfo: Joi.object({
      architectural: Joi.string().allow(null).messages({
        'string.empty': 'Thông tin kiến trúc không được để trống'
      }),
      culturalFestival: Joi.string().allow(null).messages({
        'string.empty': 'Thông tin lễ hội không được để trống'
      }),
      historicalEvents: Joi.array().items(
        Joi.object({
          title: Joi.string().required().messages({
            'any.required': 'Tiêu đề sự kiện là bắt buộc',
            'string.empty': 'Tiêu đề sự kiện không được để trống'
          }),
          description: Joi.string().required().messages({
            'any.required': 'Mô tả sự kiện là bắt buộc',
            'string.empty': 'Mô tả sự kiện không được để trống'
          })
        })
      ).default([])
    }).default({})
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
  }
}

const updateHeritage = async (req, res, next) => {
  const idCondition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  const bodyCondition = Joi.object({
    name: Joi.string().required().min(3).max(100).trim().strict().messages({
      'any.required': 'Tên di tích là bắt buộc',
      'string.empty': 'Tên di tích không được để trống',
      'string.min': 'Tên di tích phải có ít nhất 3 ký tự',
      'string.max': 'Tên di tích không được vượt quá 100 ký tự'
    }),
    description: Joi.string().required().min(10).trim().messages({
      'any.required': 'Mô tả di tích là bắt buộc',
      'string.empty': 'Mô tả di tích không được để trống',
      'string.min': 'Mô tả di tích phải có ít nhất 10 ký tự'
    }),
    images: Joi.array().items(Joi.string().uri().messages({
      'string.uri': 'URL hình ảnh không hợp lệ'
    })).default([]),
    location: Joi.string().required().trim().messages({
      'any.required': 'Vị trí di tích là bắt buộc',
      'string.empty': 'Vị trí di tích không được để trống'
    }),
    coordinates: Joi.object({
      latitude: Joi.string().trim().required().messages({
        'any.required': 'Vĩ độ là bắt buộc',
        'string.empty': 'Vị trí di tích không được để trống'
      }),
      longitude: Joi.string().trim().required().messages({
        'any.required': 'Kinh độ là bắt buộc',
        'string.empty': 'Vị trí di tích không được để trống'
      })
    }).required().messages({
      'any.required': 'Tọa độ là bắt buộc',
      'object.base': 'Tọa độ phải là một object'
    }),
    status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE').messages({
      'any.only': 'Trạng thái phải là ACTIVE hoặc INACTIVE'
    }),
    popularTags: Joi.array().items(Joi.string().trim().messages({
      'string.empty': 'Tag không được để trống'
    })).default([]),
    additionalInfo: Joi.object({
      architectural: Joi.string().allow(null).messages({
        'string.empty': 'Thông tin kiến trúc không được để trống'
      }),
      culturalFestival: Joi.string().allow(null).messages({
        'string.empty': 'Thông tin lễ hội không được để trống'
      }),
      historicalEvents: Joi.array().items(
        Joi.object({
          title: Joi.string().required().messages({
            'any.required': 'Tiêu đề sự kiện là bắt buộc',
            'string.empty': 'Tiêu đề sự kiện không được để trống'
          }),
          description: Joi.string().required().messages({
            'any.required': 'Mô tả sự kiện là bắt buộc',
            'string.empty': 'Mô tả sự kiện không được để trống'
          })
        })
      ).default([])
    }).default({})
  })

  try {
    await idCondition.validateAsync(req.params, { abortEarly: false })
    await bodyCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
  }
}

const deleteHeritage = async (req, res, next) => {
  const idCondition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  try {
    await idCondition.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
  }
}

export const heritageValidation = {
  getHeritages,
  getHeritageById,
  createHeritage,
  updateHeritage,
  deleteHeritage,
  getHeritageBySlug
}