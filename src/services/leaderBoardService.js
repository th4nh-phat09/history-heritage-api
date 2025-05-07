import { StatusCodes } from 'http-status-codes'
import { leaderBoardModel } from '~/models/leaderBoardModel'
import { heritageModel } from '~/models/heritageModel'
import ApiError from '~/utils/ApiError'

const getAll = async (queryParams) => {
  try {
    console.log(11111111111);

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
    const { heritageId, rankings } = reqBody

    // Kiểm tra heritage tồn tại
    const heritage = await heritageModel.findOneById(heritageId)
    if (!heritage) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Heritage not found')
    }

    // Kiểm tra leaderboard đã tồn tại chưa
    const existingLeaderboard = await leaderBoardModel.findOneByHeritageId(heritageId)

    let result
    if (!existingLeaderboard) {
      // Tạo mới leaderboard
      const stats = calculateStats([rankings[0]])
      const newData = {
        heritageId,
        rankings: [rankings[0]],
        stats
      }
      result = await leaderBoardModel.createNew(newData)
    } else {
      // Thêm ranking mới vào mảng rankings hiện có
      const newRankings = [...existingLeaderboard.rankings, rankings[0]]
      // Sort rankings theo score giảm dần
      newRankings.sort((a, b) => b.score - a.score)
      // Cập nhật rank cho mỗi item
      newRankings.forEach((item, index) => {
        item.rank = index + 1
      })

      const stats = calculateStats(newRankings)
      const updateData = {
        rankings: newRankings,
        stats,
        updatedAt: Date.now()
      }
      result = await leaderBoardModel.update(existingLeaderboard._id, updateData)
    }

    // Cập nhật leaderboardSummary trong heritage
    const topTenUsers = result.rankings.slice(0, 10).map(r => ({
      userId: r.userId,
      userName: r.displayName,
      score: r.score
    }))

    await heritageModel.updateOneById(heritageId, {
      leaderboardSummary: {
        topScore: result.stats.highestScore.toString(),
        topUsers: topTenUsers,
        totalParticipants: result.stats.totalParticipants.toString()
      }
    })

    return result
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
    const leaderboard = await leaderBoardModel.findOneById(id)
    if (!leaderboard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'LeaderBoard not found')
    }

    // Xóa leaderboard
    await leaderBoardModel.deleteOneById(id)

    // Reset leaderboardSummary trong heritage
    await heritageModel.updateOneById(leaderboard.heritageId, {
      leaderboardSummary: {
        topScore: '0',
        topUsers: [],
        totalParticipants: '0'
      }
    })

    return { message: 'Leaderboard deleted successfully' }
  } catch (error) {
    throw error
  }
}

const getByHeritageId = async (heritageId, queryParams) => {
  try {
    const { page = 1, limit = 20 } = queryParams

    // Tính toán skip cho pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Lấy data từ database
    const leaderBoard = await leaderBoardModel.getByHeritageId({
      heritageId,
      skip,
      limit: parseInt(limit)
    })

    if (!leaderBoard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Leaderboard not found!')
    }

    // Đếm tổng số rankings
    const totalItems = await leaderBoardModel.countRankings(heritageId)

    // Tính tổng số trang
    const totalPages = Math.ceil(totalItems / limit)

    // Format response
    return {
      rankings: leaderBoard.rankings || [],
      stats: leaderBoard.stats || {
        totalParticipants: 0,
        highestScore: 0,
        averageScore: 0
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        totalItems
      }
    }
  } catch (error) {
    throw error
  }
}

// Helper function để tính toán stats
const calculateStats = (rankings) => {
  const totalParticipants = rankings.length
  const highestScore = rankings.length > 0
    ? Math.max(...rankings.map(r => r.score))
    : 0
  const averageScore = rankings.length > 0
    ? (rankings.reduce((sum, r) => sum + r.score, 0) / totalParticipants)
    : 0

  return {
    totalParticipants,
    highestScore,
    averageScore: parseFloat(averageScore.toFixed(2))
  }
}

export const leaderBoardService = {
  getAll,
  createNew,
  getLeaderBoardById,
  updateLeaderBoard,
  deleteLeaderBoard,
  getByHeritageId
}
