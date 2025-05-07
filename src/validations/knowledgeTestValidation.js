/* eslint-disable no-console */
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createTest = async (req, res, next) => {
  const condition = Joi.object({
    heritageId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required().messages({
      'any.required': 'HeritageId là bắt buộc',
      'string.empty': 'HeritageId không được để trống'
    }),
    title: Joi.string().required().min(3).max(200).trim().messages({
      'any.required': 'Tiêu đề là bắt buộc',
      'string.empty': 'Tiêu đề không được để trống',
      'string.min': 'Tiêu đề phải có ít nhất 3 ký tự',
      'string.max': 'Tiêu đề không được vượt quá 200 ký tự'
    }),
    content: Joi.string().required().trim().messages({
      'any.required': 'Nội dung là bắt buộc',
      'string.empty': 'Nội dung không được để trống'
    }),
    questions: Joi.array().items(
      Joi.object({
        content: Joi.string().required().trim().messages({
          'any.required': 'Nội dung câu hỏi là bắt buộc',
          'string.empty': 'Nội dung câu hỏi không được để trống'
        }),
        explanation: Joi.string().allow('').trim(),
        image: Joi.string().allow('').trim(),
        options: Joi.array().items(
          Joi.object({
            optionText: Joi.string().required().trim().messages({
              'any.required': 'Nội dung lựa chọn là bắt buộc',
              'string.empty': 'Nội dung lựa chọn không được để trống'
            }),
            isCorrect: Joi.boolean().required().messages({
              'any.required': 'isCorrect là bắt buộc'
            })
          })
        ).min(2).required().messages({
          'array.min': 'Phải có ít nhất 2 lựa chọn cho mỗi câu hỏi'
        })
      })
    ).default([]).messages({
      'array.base': 'Questions phải là một mảng',
      'any.required': 'Phải có ít nhất 1 câu hỏi'
    }),
    topPerformersLimit: Joi.number().min(5).default(10).messages({
      'number.base': 'Top performers limit phải là một số',
      'number.min': 'Top performers limit phải lớn hơn 5'
    })
  })

  try {
    await condition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const updateTest = async (req, res, next) => {
  const condition = Joi.object({
    title: Joi.string().min(3).max(200).trim(),
    content: Joi.string().trim(),
    questions: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        content: Joi.string().required().trim(),
        explanation: Joi.string().allow('').trim(),
        image: Joi.string().allow('').trim(),
        options: Joi.array().items(
          Joi.object({
            id: Joi.string().required(),
            optionText: Joi.string().required().trim(),
            isCorrect: Joi.boolean().required()
          })
        ).min(2).required()
      })
    ).min(1)
  })

  try {
    await condition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const deleteTest = async (req, res, next) => {
  const condition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  try {
    await condition.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const submitAttempt = async (req, res, next) => {
  try {
    console.log('Request body:', JSON.stringify(req.body))

    // Định nghĩa schema cho cấu trúc đáp án với nhiều định dạng
    const answerItem = Joi.object({
      questionId: Joi.string().required(),
      selectedOptions: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string()
      ).required()
    })

    // Định nghĩa schema linh hoạt cho các kiểu dữ liệu đầu vào
    const condition = Joi.alternatives().try(
      // Cấu trúc chuẩn
      Joi.object({
        userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).optional(),
        userName: Joi.string().trim().optional(),
        answers: Joi.array().items(answerItem).min(1).required()
      }),
      // Cấu trúc nồng (nested answers)
      Joi.object({
        userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).optional(),
        userName: Joi.string().trim().optional(),
        answers: Joi.object({
          answers: Joi.array().items(answerItem).min(1).required()
        }).required()
      })
    )

    const validationResult = await condition.validateAsync(req.body, { abortEarly: false })
    console.log('Validation passed:', JSON.stringify(validationResult))
    next()
  } catch (error) {
    console.error('Validation error:', error)
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const getTests = async (req, res, next) => {
  const condition = Joi.object({
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
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'ALL').default('ACTIVE').messages({
      'string.base': 'Status must be a string',
      'any.only': 'Status must be one of ACTIVE, INACTIVE, ALL'
    })
  })

  try {
    const validatedValue = await condition.validateAsync(req.query, { abortEarly: false })
    req.query = validatedValue
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const getTestById = async (req, res, next) => {
  console.log(11111111)
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

const updateBasicInfo = async (req, res, next) => {
  try {
    const idCondition = Joi.object({
      id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    })

    const correctCondition = Joi.object({
      title: Joi.string().required().min(5).max(200).messages({
        'string.empty': 'Tiêu đề không được để trống',
        'string.min': 'Tiêu đề phải có ít nhất 5 ký tự',
        'string.max': 'Tiêu đề không được vượt quá 200 ký tự'
      }),
      content: Joi.string().allow('').max(1000).default('').messages({
        'string.max': 'Nội dung không được vượt quá 1000 ký tự'
      }),
      topPerformersLimit: Joi.number().integer().min(5).max(100).default(10).messages({
        'number.base': 'Giới hạn người thực hiện tốt nhất phải là số',
        'number.min': 'Giới hạn người thực hiện tốt nhất phải ít nhất 5',
        'number.max': 'Giới hạn người thực hiện tốt nhất không được vượt quá 100'
      }),
      status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE').messages({
        'any.only': 'Trạng thái phải là một trong các giá trị: ACTIVE, INACTIVE, ALL'
      })
    })
    await idCondition.validateAsync(req.params, { abortEarly: false })
    const validatedValue = await correctCondition.validateAsync(req.body, { abortEarly: false })
    req.body = validatedValue
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const getQuestions = async (req, res, next) => {
  try {
    const condition = Joi.object({
      testId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    })
    await condition.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const addQuestion = async (req, res, next) => {
  try {
    const idCondition = Joi.object({
      testId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    })

    const corectCodition = Joi.object({
      content: Joi.string().required().min(5).max(1000).messages({
        'string.empty': 'Nội dung câu hỏi không được để trống',
        'string.min': 'Nội dung câu hỏi phải có ít nhất 5 ký tự',
        'string.max': 'Nội dung câu hỏi không được vượt quá 1000 ký tự',
        'any.required': 'Nội dung câu hỏi là bắt buộc'
      }),
      explanation: Joi.string().allow('').max(1000).messages({
        'string.max': 'Giải thích không được vượt quá 1000 ký tự'
      }),
      image: Joi.string().allow('').uri().messages({
        'string.uri': 'Đường dẫn ảnh không hợp lệ'
      }),
      options: Joi.array().items(
        Joi.object({
          optionText: Joi.string().required().min(1).max(500).messages({
            'string.empty': 'Nội dung lựa chọn không được để trống',
            'string.min': 'Nội dung lựa chọn phải có ít nhất 1 ký tự',
            'string.max': 'Nội dung lựa chọn không được vượt quá 500 ký tự',
            'any.required': 'Nội dung lựa chọn là bắt buộc'
          }),
          isCorrect: Joi.boolean().required().messages({
            'boolean.base': 'Trạng thái đúng/sai phải là boolean',
            'any.required': 'Trạng thái đúng/sai là bắt buộc'
          })
        })
      ).min(2).required().messages({
        'array.min': 'Câu hỏi phải có ít nhất 2 lựa chọn',
        'any.required': 'Danh sách lựa chọn là bắt buộc'
      })
    })

    await idCondition.validateAsync(req.params, { abortEarly: false })
    await corectCodition.validateAsync(req.body, { abortEarly: false })

    // Kiểm tra có ít nhất một đáp án đúng
    const hasCorrectOption = req.body.options.some(option => option.isCorrect)
    if (!hasCorrectOption) {
      throw new Error('Câu hỏi phải có ít nhất một đáp án đúng')
    }
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const getQuestionById = async (req, res, next) => {
  try {
    const condition = Joi.object({
      testId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      questionId: Joi.string().required().messages({
        'string.empty': 'ID câu hỏi không được để trống',
        'any.required': 'ID câu hỏi là bắt buộc'
      })
    })

    await condition.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const updateQuestion = async (req, res, next) => {
  try {
    const idCondition = Joi.object({
      testId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      questionId: Joi.string().required().messages({
        'string.empty': 'ID câu hỏi không được để trống',
        'any.required': 'ID câu hỏi là bắt buộc'
      })
    })
    const corectCondition = Joi.object({
      content: Joi.string().min(5).max(1000).messages({
        'string.min': 'Nội dung câu hỏi phải có ít nhất 5 ký tự',
        'string.max': 'Nội dung câu hỏi không được vượt quá 1000 ký tự'
      }),
      explanation: Joi.string().allow('').max(1000).messages({
        'string.max': 'Giải thích không được vượt quá 1000 ký tự'
      }),
      image: Joi.string().allow('').uri().messages({
        'string.uri': 'Đường dẫn ảnh không hợp lệ'
      }),
      options: Joi.array().items(
        Joi.object({
          id: Joi.string().allow(null, ''),
          optionText: Joi.string().required().min(1).max(500).messages({
            'string.empty': 'Nội dung lựa chọn không được để trống',
            'string.min': 'Nội dung lựa chọn phải có ít nhất 1 ký tự',
            'string.max': 'Nội dung lựa chọn không được vượt quá 500 ký tự',
            'any.required': 'Nội dung lựa chọn là bắt buộc'
          }),
          isCorrect: Joi.boolean().required().messages({
            'boolean.base': 'Trạng thái đúng/sai phải là boolean',
            'any.required': 'Trạng thái đúng/sai là bắt buộc'
          })
        })
      ).min(2).messages({
        'array.min': 'Câu hỏi phải có ít nhất 2 lựa chọn'
      })
    })

    await idCondition.validateAsync(req.params, { abortEarly: false })
    await corectCondition.validateAsync(req.body, { abortEarly: false })
    if (req.body.options) {
      const hasCorrectOption = req.body.options.some(option => option.isCorrect)
      if (!hasCorrectOption) {
        throw new Error('Câu hỏi phải có ít nhất một đáp án đúng')
      }
    }
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const deleteQuestion = async (req, res, next) => {
  try {
    const idCondition = Joi.object({
      testId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      questionId: Joi.string().required().messages({
        'string.empty': 'ID câu hỏi không được để trống',
        'any.required': 'ID câu hỏi là bắt buộc'
      })
    })
    await idCondition.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const getOptions = async (req, res, next) => {
  try {
    const idCondition = Joi.object({
      testId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      questionId: Joi.string().required().messages({
        'string.empty': 'ID câu hỏi không được để trống',
        'any.required': 'ID câu hỏi là bắt buộc'
      })
    })

    await idCondition.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const addOption = async (req, res, next) => {
  try {
    const idCondition = Joi.object({
      testId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      questionId: Joi.string().required().messages({
        'string.empty': 'ID câu hỏi không được để trống',
        'any.required': 'ID câu hỏi là bắt buộc'
      })
    })

    const corectCondition = Joi.object({
      optionText: Joi.string().required().min(1).max(500).messages({
        'string.empty': 'Nội dung lựa chọn không được để trống',
        'string.min': 'Nội dung lựa chọn phải có ít nhất 1 ký tự',
        'string.max': 'Nội dung lựa chọn không được vượt quá 500 ký tự',
        'any.required': 'Nội dung lựa chọn là bắt buộc'
      }),
      isCorrect: Joi.boolean().required().messages({
        'boolean.base': 'Trạng thái đúng/sai phải là boolean',
        'any.required': 'Trạng thái đúng/sai là bắt buộc'
      })
    })

    await idCondition.validateAsync(req.params, { abortEarly: false })
    await corectCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const updateOption = async (req, res, next) => {
  const idCondition = Joi.object({
    testId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    questionId: Joi.string().required().messages({
      'string.empty': 'ID câu hỏi không được để trống',
      'any.required': 'ID câu hỏi là bắt buộc'
    }),
    optionId: Joi.string().required().messages({
      'string.empty': 'ID lựa chọn không được để trống',
      'any.required': 'ID lựa chọn là bắt buộc'
    })
  })

  const corectCondition = Joi.object({
    optionText: Joi.string().required().min(1).max(500).messages({
      'string.empty': 'Nội dung lựa chọn không được để trống',
      'string.min': 'Nội dung lựa chọn phải có ít nhất 1 ký tự',
      'string.max': 'Nội dung lựa chọn không được vượt quá 500 ký tự',
      'any.required': 'Nội dung lựa chọn là bắt buộc'
    }),
    isCorrect: Joi.boolean().required().messages({
      'boolean.base': 'Trạng thái đúng/sai phải là boolean',
      'any.required': 'Trạng thái đúng/sai là bắt buộc'
    })
  })

  try {
    await idCondition.validateAsync(req.params, { abortEarly: false })
    await corectCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const deleteOption = async (req, res, next) => {
  const condition = Joi.object({
    testId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    questionId: Joi.string().required().messages({
      'string.empty': 'ID câu hỏi không được để trống',
      'any.required': 'ID câu hỏi là bắt buộc'
    }),
    optionId: Joi.string().required().messages({
      'string.empty': 'ID lựa chọn không được để trống',
      'any.required': 'ID lựa chọn là bắt buộc'
    })
  })

  try {
    await condition.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

export const knowledgeTestValidation = {
  createTest,
  updateTest,
  submitAttempt,
  getTests,
  getTestById,
  updateBasicInfo,
  getQuestions,
  addQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getOptions,
  addOption,
  updateOption,
  deleteOption,
  deleteTest
}