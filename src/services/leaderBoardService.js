import { StatusCodes } from 'http-status-codes'
import { leaderBoardModel } from '~/models/leaderBoardModel'
import ApiError from '~/utils/ApiError'

const getAll = async () => {
  try {
    const result = await leaderBoardModel.getAll()
    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'List leaderBoard is empty')
    }
    return result
  } catch (error) {
    throw error
  }
}
const createNew = async (reqBody) => {
  try {
    // khởi tạo data
    const newData = {
      ...reqBody
    }
    // lưu data
    const result = await leaderBoardModel.createNew(newData)
    const getNewLeaderBoard = await leaderBoardModel.findOneById(result.insertedId)
    // retrun data
    return getNewLeaderBoard
  } catch (error) {
    throw error
  }
}


const getLeaderBoardById = async (id) => {
  try {
    const result = await leaderBoardModel.findOneById(id)
    if (!result) throw new ApiError(StatusCodes.NOT_FOUND, 'Leader Board not found!.')
    return result
  } catch (error) {
    throw error
  }
}

const updateLeaderBoard = async (id, data) => {
  try {
    const checkExistUser = await leaderBoardModel.findOneById(id)
    if (!checkExistUser)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Leader Board not found!')
    const newData = {
      ...data,
      updatedAt: Date.now()
    }
    const updatedHeritage = await leaderBoardModel.update(id, newData)
    return updatedHeritage
  } catch (error) {
    throw error
  }
}

const deleteLeaderBoard = async (id) => {
  try {
    const checkId = await leaderBoardModel.findOneById(id)
    if (!checkId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'LeaderBoard not found')
    }
    await leaderBoardModel.deleteOneById(id)
    return { deletedResult: 'Leader Board was deleted' }
  } catch (error) {
    throw error
  }
}

export const leaderBoardService = {
  getAll,
  createNew,
  getLeaderBoardById,
  updateLeaderBoard,
  deleteLeaderBoard
}
