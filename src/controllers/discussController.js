import { StatusCodes } from 'http-status-codes'
import { discussService } from '~/services/discussService'

const createNew = async (req, res, next) => {
  try {
    const newDiscuss = await discussService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(newDiscuss)
  } catch (error) {
    next(error)
  }
}

const getDiscusssByParentId = async (req, res, next) => {
  try {
    const { parentId, heritageId } = req.query
    const result = await discussService.getDiscussByParentId(parentId, heritageId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteNesstedById = async (req, res, next) => {
  try {
    const result = await discussService.deleteNestedById(req.query.heritageId, req.query.DiscussId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}


export const discussController = {
  createNew,
  getDiscusssByParentId,
  deleteNesstedById
}