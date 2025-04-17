import { StatusCodes } from 'http-status-codes'
import { leaderBoardModel } from '~/models/leaderBoardModel'
import ApiError from '~/utils/ApiError'

const getAll = async (queryParams) => {
  try {
    const { page, limit, search, sort, order } = queryParams

    // Tính toán skip
    const skip = (page - 1) * limit

    // Xây dựng bộ lọc
    const filter = {}
    if (search) {
      filter['rankings.displayName'] = { $regex: search, $options: 'i' } // Tìm kiếm theo displayName (không phân biệt hoa thường)
    }

    // Xây dựng điều kiện sắp xếp
    const sortOptions = {}
    sortOptions[sort] = order === 'asc' ? 1 : -1

    // Gọi model để lấy dữ liệu
    const leaderBoards = await leaderBoardModel.getAllWithPagination({ filter, sort: sortOptions, skip, limit })

    // Tính tổng số bản ghi
    const totalCount = await leaderBoardModel.countDocuments(filter)

    // Tính tổng số trang
    const totalPages = Math.ceil(totalCount / limit)

    return {
      leaderBoards,
      pagination: {
        totalItems: totalCount,
        currentPage: parseInt(page, 10),
        totalPages,
        itemsPerPage: parseInt(limit, 10)
      }
    }
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
