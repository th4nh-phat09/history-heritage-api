import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { discussModel } from '~/models/discussModel'

const createNew = async (reqBody) => {
  try {
    const newDiscuss = {
      ...reqBody,
      createdAt: Date.now(),
      updatedAt: null
    }
    const createdDiscuss = await discussModel.createNew(newDiscuss)
    if (!createdDiscuss) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create Discuss')
    }
    return createdDiscuss
  } catch (error) {
    throw error
  }
}


const getDiscussByParentId = async (parentId, heritageId) => {
  try {
    const Discusss = await discussModel.getDiscussByParentId(parentId, heritageId)
    if (!Discusss) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Discusss not found')
    }
    return Discusss
  } catch (error) {
    throw error
  }
}

const deleteNestedById = async (heritageId, DiscussId) => {
  try {
    const existingDiscuss = await discussModel.findOneById(DiscussId)
    if (!existingDiscuss) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Discuss not found')
    }
    return await discussModel.deleteNestedById(heritageId, DiscussId)
  } catch (error) {
    throw error
  }
}

export const discussService = {
  createNew,
  getDiscussByParentId,
  deleteNestedById
}