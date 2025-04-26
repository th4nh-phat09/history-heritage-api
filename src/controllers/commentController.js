import { StatusCodes } from 'http-status-codes'
import { commentService } from '~/services/commentService'

// Lấy tất cả comment của một di tích
const getCommentsByHeritageId = async (req, res, next) => {
    try {
        const heritageId = req.params.id
        const result = await commentService.getCommentsByHeritageId(heritageId, req.query)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(error)
    }
}

// Tạo comment mới
const createComment = async (req, res, next) => {
    try {
        // Lấy userId từ thông tin xác thực
        const userId = req.user._id
        const result = await commentService.createComment(userId, req.body)
        res.status(StatusCodes.CREATED).json(result)
    } catch (error) {
        next(error)
    }
}

// Thêm reply vào comment
const createReply = async (req, res, next) => {
    try {
        // Lấy userId từ thông tin xác thực
        const userId = req.user._id
        const commentId = req.params.id
        const result = await commentService.createReply(userId, commentId, req.body)
        res.status(StatusCodes.CREATED).json(result)
    } catch (error) {
        next(error)
    }
}

// Lấy thông tin chi tiết một comment
const getCommentById = async (req, res, next) => {
    try {
        const commentId = req.params.id
        const result = await commentService.getCommentById(commentId)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(error)
    }
}

// Cập nhật nội dung comment
const updateComment = async (req, res, next) => {
    try {
        // Lấy thông tin người dùng
        const userId = req.user._id
        const userRole = req.user.role
        const commentId = req.params.id

        const result = await commentService.updateComment(userId, userRole, commentId, req.body)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(error)
    }
}

// Cập nhật nội dung reply
const updateReply = async (req, res, next) => {
    try {
        // Lấy thông tin người dùng
        const userId = req.user._id
        const userRole = req.user.role
        const commentId = req.params.commentId
        const replyId = req.params.replyId

        const result = await commentService.updateReply(userId, userRole, commentId, replyId, req.body)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(error)
    }
}

// Thích/bỏ thích một comment
const toggleLikeComment = async (req, res, next) => {
    try {
        // Lấy userId từ thông tin xác thực
        const userId = req.user._id
        const commentId = req.params.id

        const result = await commentService.toggleLikeComment(userId, commentId)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(error)
    }
}

// Thích/bỏ thích một reply
const toggleLikeReply = async (req, res, next) => {
    try {
        // Lấy userId từ thông tin xác thực
        const userId = req.user._id
        const commentId = req.params.commentId
        const replyId = req.params.replyId

        const result = await commentService.toggleLikeReply(userId, commentId, replyId)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(error)
    }
}

// Ẩn một comment (soft delete)
const hideComment = async (req, res, next) => {
    try {
        // Lấy thông tin người dùng
        const userId = req.user._id
        const userRole = req.user.role
        const commentId = req.params.id

        const result = await commentService.hideComment(userId, userRole, commentId)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(error)
    }
}

// Ẩn một reply (soft delete)
const hideReply = async (req, res, next) => {
    try {
        // Lấy thông tin người dùng
        const userId = req.user._id
        const userRole = req.user.role
        const commentId = req.params.commentId
        const replyId = req.params.replyId

        const result = await commentService.hideReply(userId, userRole, commentId, replyId)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(error)
    }
}

// Xóa vĩnh viễn một comment (chỉ admin)
const deleteComment = async (req, res, next) => {
    try {
        // Lấy thông tin người dùng
        const userRole = req.user.role
        const commentId = req.params.id

        const result = await commentService.deleteComment(userRole, commentId)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(error)
    }
}

export const commentController = {
    getCommentsByHeritageId,
    createComment,
    createReply,
    getCommentById,
    updateComment,
    updateReply,
    toggleLikeComment,
    toggleLikeReply,
    hideComment,
    hideReply,
    deleteComment
} 