import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const getComments = async (req, res, next) => {
    const correctCondition = Joi.object({
        page: Joi.number().integer().min(1).default(1).messages({
            'number.base': 'Trang phải là một số',
            'number.integer': 'Trang phải là số nguyên',
            'number.min': 'Trang phải lớn hơn hoặc bằng 1'
        }),
        limit: Joi.number().integer().min(5).max(50).default(10).messages({
            'number.base': 'Số lượng phải là một số',
            'number.integer': 'Số lượng phải là số nguyên',
            'number.min': 'Số lượng phải lớn hơn hoặc bằng 5',
            'number.max': 'Số lượng phải nhỏ hơn hoặc bằng 50'
        }),
        sort: Joi.string().valid('createdAt', 'likes').default('createdAt').messages({
            'string.base': 'Sắp xếp phải là một chuỗi',
            'any.only': 'Sắp xếp phải là một trong các giá trị: createdAt, likes'
        }),
        order: Joi.string().valid('asc', 'desc').default('desc').messages({
            'string.base': 'Thứ tự phải là một chuỗi',
            'any.only': 'Thứ tự phải là asc hoặc desc'
        }),
        status: Joi.string().valid('ACTIVE', 'HIDDEN', 'ALL').default('ACTIVE').messages({
            'string.base': 'Trạng thái phải là một chuỗi',
            'any.only': 'Trạng thái phải là một trong các giá trị: ACTIVE, HIDDEN, ALL'
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

const getCommentsByHeritageId = async (req, res, next) => {
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

const createComment = async (req, res, next) => {
    const correctCondition = Joi.object({
        content: Joi.string().required().min(1).trim().messages({
            'any.required': 'Nội dung bình luận là bắt buộc',
            'string.empty': 'Nội dung bình luận không được để trống',
            'string.min': 'Nội dung bình luận phải có ít nhất 1 ký tự'
        }),
        heritageId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    })

    try {
        await correctCondition.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
    }
}

const createReply = async (req, res, next) => {
    const idCondition = Joi.object({
        id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    })

    const bodyCondition = Joi.object({
        content: Joi.string().required().min(1).trim().messages({
            'any.required': 'Nội dung phản hồi là bắt buộc',
            'string.empty': 'Nội dung phản hồi không được để trống',
            'string.min': 'Nội dung phản hồi phải có ít nhất 1 ký tự'
        })
    })

    try {
        await idCondition.validateAsync(req.params, { abortEarly: false })
        await bodyCondition.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
    }
}

const getCommentById = async (req, res, next) => {
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

const updateComment = async (req, res, next) => {
    const idCondition = Joi.object({
        id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    })

    const bodyCondition = Joi.object({
        content: Joi.string().required().min(1).trim().messages({
            'any.required': 'Nội dung bình luận là bắt buộc',
            'string.empty': 'Nội dung bình luận không được để trống',
            'string.min': 'Nội dung bình luận phải có ít nhất 1 ký tự'
        })
    })

    try {
        await idCondition.validateAsync(req.params, { abortEarly: false })
        await bodyCondition.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
    }
}

const updateReply = async (req, res, next) => {
    const idCondition = Joi.object({
        commentId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        replyId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    })

    const bodyCondition = Joi.object({
        content: Joi.string().required().min(1).trim().messages({
            'any.required': 'Nội dung phản hồi là bắt buộc',
            'string.empty': 'Nội dung phản hồi không được để trống',
            'string.min': 'Nội dung phản hồi phải có ít nhất 1 ký tự'
        })
    })

    try {
        await idCondition.validateAsync(req.params, { abortEarly: false })
        await bodyCondition.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
    }
}

const toggleLike = async (req, res, next) => {
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

const toggleReplyLike = async (req, res, next) => {
    const correctCondition = Joi.object({
        commentId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        replyId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    })

    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
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

const deleteReply = async (req, res, next) => {
    const correctCondition = Joi.object({
        commentId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        replyId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    })

    try {
        await correctCondition.validateAsync(req.params, { abortEarly: false })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message))
    }
}

export const commentValidation = {
    getComments,
    getCommentsByHeritageId,
    createComment,
    createReply,
    getCommentById,
    updateComment,
    updateReply,
    toggleLike,
    toggleReplyLike,
    deleteComment,
    deleteReply
} 