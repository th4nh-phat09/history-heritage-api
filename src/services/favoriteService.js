import { StatusCodes } from 'http-status-codes'
import { favoriteModel } from '~/models/favoriteModel'
import ApiError from '~/utils/ApiError'
import { heritageModel } from '~/models/heritageModel'

const getAll = async (queryParams) => {
  try {
    const { results, total } = await favoriteModel.findAll(queryParams)
    const totalPages = Math.ceil(total / queryParams.limit)

    return {
      items: results,
      pagination: {
        page: queryParams.page,
        limit: queryParams.limit,
        totalPages,
        totalItems: total
      }
    }
  } catch (error) {
    throw error
  }
}

const getFavoriteById = async (id) => {
  try {
    const favorite = await favoriteModel.findOneById(id)
    if (!favorite) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Favorite not found')
    }
    return favorite
  } catch (error) {
    throw error
  }
}

const update = async (id, data) => {
  try {
    const updatedData = {
      ...data,
      updatedAt: Date.now()
    }

    const result = await favoriteModel.update(id, updatedData)
    return result
  } catch (error) {
    throw error
  }
}

const getByUserId = async (userId, queryParams) => {
  try {
    const favorite = await favoriteModel.findByUserIdAndPagination({
      userId,
      ...queryParams
    })

    if (!favorite) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Favorite list not found')
    }

    return {
      items: favorite.items || [],
      pagination: favorite.pagination || []
    }
  } catch (error) {
    throw error
  }
}

const addToFavorites = async (userId, heritageId) => {
  try {
    // Kiểm tra heritage có tồn tại không
    const heritage = await heritageModel.findOneById(heritageId)
    if (!heritage) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Heritage not found')
    }

    // Kiểm tra favorite list của user
    const existingFavorite = await favoriteModel.findByUserId(userId)

    // Nếu chưa có favorite list thì tạo mới
    if (!existingFavorite) {
      const newData = {
        userId,
        items: [{ heritageId, addedAt: new Date() }]
      }
      const newFavorite = await favoriteModel.createNew(newData)

      // Cập nhật totalFavorites trong heritage
      const currentTotalFavorites = parseInt(heritage.stats.totalFavorites) || 0
      await heritageModel.updateOneById(heritageId, {
        'stats.totalFavorites': (currentTotalFavorites + 1).toString()
      })

      return await favoriteModel.findOneById(newFavorite.insertedId)
    }

    // Kiểm tra xem heritage đã tồn tại trong list chưa
    const isDuplicate = existingFavorite.items.some(
      item => item.heritageId === heritageId
    )

    if (isDuplicate) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Heritage already exists in favorites'
      )
    }

    // Thêm heritage mới vào list
    const updatedData = {
      items: [...existingFavorite.items, { heritageId, addedAt: new Date() }],
      updatedAt: Date.now()
    }

    // Cập nhật totalFavorites trong heritage
    const currentTotalFavorites = parseInt(heritage.stats.totalFavorites) || 0
    await heritageModel.updateOneById(heritageId, {
      'stats.totalFavorites': (currentTotalFavorites + 1).toString()
    })

    const result = await favoriteModel.update(existingFavorite._id, updatedData)
    return result
  } catch (error) {
    throw error
  }
}

const deleteFavoriteByHeritageId = async (userId, heritageId) => {
  try {
    // Kiểm tra heritage có tồn tại không
    const heritage = await heritageModel.findOneById(heritageId)
    if (!heritage) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Heritage not found')
    }

    // Tìm favorite list của user
    const favorite = await favoriteModel.findByUserId(userId)
    if (!favorite) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Favorite list not found')
    }

    // Lọc ra các items không chứa heritageId cần xóa
    const updatedItems = favorite.items.filter(item => item.heritageId !== heritageId)

    // Nếu sau khi xóa không còn items nào
    if (updatedItems.length === 0) {
      // Xóa toàn bộ favorite list
      await favoriteModel.deleteOneById(favorite._id)
    } else {
      // Cập nhật lại favorite list với items đã lọc
      await favoriteModel.update(favorite._id, {
        items: updatedItems,
        updatedAt: Date.now()
      })
    }

    // Cập nhật lại totalFavorites trong heritage
    const currentTotalFavorites = parseInt(heritage.stats.totalFavorites) || 0
    if (currentTotalFavorites > 0) {
      await heritageModel.updateOneById(heritageId, {
        'stats.totalFavorites': (currentTotalFavorites - 1).toString()
      })
    }

    return { message: 'Removed from favorites successfully' }
  } catch (error) {
    throw error
  }
}

export const favoriteService = {
  getAll,
  getFavoriteById,
  update,
  getByUserId,
  addToFavorites,
  deleteFavoriteByHeritageId
}
