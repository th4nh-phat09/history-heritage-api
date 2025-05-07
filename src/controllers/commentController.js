import { commentService } from '~/services/commentService'
import { StatusCodes } from 'http-status-codes'


const getAll = async (req, res, next) => {
  try {
    const result = await commentService.getAll(req.query)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}


const createNew = async (req, res, next) => {
  try {
    const newComment = await commentService.createNew(req.body, req.userId)
    res.status(StatusCodes.CREATED).json(newComment)
  } catch (error) {
    next(error)
  }
}


const getCommentById = async (req, res, next) => {
  try {
    const result = await commentService.getCommentById(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateComment = async (req, res, next) => {
  try {

    const result = await commentService.updateComment(req.params.id, req.body, req.userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteComment = async (req, res, next) => {
  try {
    const result = await commentService.deleteComment(req.params.id, req.userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const likeComment = async (req, res, next) => {
  try {
    const result = await commentService.likeComment(req.params.id, req.userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const commentController = {
  getAll,
  createNew,
  getCommentById,
  updateComment,
  deleteComment,
  likeComment
}