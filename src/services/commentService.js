/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes'
import { commentModel } from '~/models/commentModel'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'

const getAll = async (queryParams) => {
  try {
    const { page, limit, search, sort, order, heritageId } = queryParams

    // Tính toán skip
    const skip = (page - 1) * limit

    // Xây dựng bộ lọc
    const filter = {}
    if (heritageId) {
      filter.heritageId = heritageId // Lọc theo heritageId nếu có
    }
    if (search) {
      filter.content = { $regex: search, $options: 'i' } // Tìm kiếm theo nội dung bình luận (không phân biệt hoa thường)
    }
    filter.status = 'ACTIVE' // Chỉ lấy các bình luận có trạng thái ACTIVE

    // Xây dựng điều kiện sắp xếp
    const sortOptions = {}
    sortOptions[sort] = order === 'asc' ? 1 : -1

    // Gọi model để lấy dữ liệu
    const comments = await commentModel.getAllWithPagination({ filter, sort: sortOptions, skip, limit })

    // Tính tổng số bản ghi
    const totalCount = await commentModel.countDocuments(filter)

    // Tính tổng số trang
    const totalPages = Math.ceil(totalCount / limit)

    return {
      comments,
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

const createNew = async (reqBody, userId) => {
  try {
    // Kiểm tra user có tồn tại hay không
    const user = await userModel.findOneById(userId)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!')
    }

    // Kiểm tra heritageId có hợp lệ hay không (giả sử chỉ cần kiểm tra định dạng ObjectId)
    if (!reqBody.heritageId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid heritageId!')
    }

    // Khởi tạo data cho comment
    const newComment = {
      heritageId: reqBody.heritageId,
      user: {
        id: userId,
        displayName: user.displayname,
        avatar: user.avatar
      },
      content: reqBody.content,
      images: reqBody.images || [],
      rating: reqBody.rating || null
    }

    // Lưu comment vào database
    const result = await commentModel.createNew(newComment)

    // Lấy comment vừa tạo để trả về
    const createdComment = await commentModel.findOneById(result.insertedId)
    return createdComment
  } catch (error) {
    throw error
  }
}

const getCommentById = async (id) => {
  try {
    const result = await commentModel.findOneById(id)
    if (!result) throw new ApiError(StatusCodes.NOT_FOUND, 'Comment not found!')
    if (result.status !== 'ACTIVE') throw new ApiError(StatusCodes.FORBIDDEN, 'Comment is not active!')
    return result
  } catch (error) {
    throw error
  }
}

const updateComment = async (id, data, userId) => {
  try {
    // Kiểm tra comment có tồn tại hay không
    const comment = await commentModel.findOneById(id)
    if (!comment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Comment not found!')
    }

    // Kiểm tra user có phải là người tạo comment hay không
    if (comment.user.id !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You are not allowed to update this comment!')
    }

    // Cập nhật dữ liệu
    const updatedData = {
      ...data,
      updatedAt: Date.now()
    }

    const updatedComment = await commentModel.updateComment(id, updatedData)
    return updatedComment
  } catch (error) {
    throw error
  }
}

const deleteComment = async (id, userId) => {
  try {
    // Kiểm tra comment có tồn tại hay không
    const comment = await commentModel.findOneById(id)
    if (!comment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Comment not found!')
    }

    // Kiểm tra user có phải là người tạo comment hay không
    if (comment.user.id !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You are not allowed to delete this comment!')
    }

    // Xóa comment (soft delete bằng cách cập nhật status)
    await commentModel.updateComment(id, { status: 'DELETED', updatedAt: Date.now() })
    return { deletedResult: 'Comment was deleted' }
  } catch (error) {
    throw error
  }
}

const likeComment = async (commentId, userId) => {
  try {
    // Kiểm tra comment có tồn tại hay không
    const comment = await commentModel.findOneById(commentId)
    if (!comment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Comment not found!')
    }

    // Kiểm tra user đã thích comment chưa
    const likes = comment.likes || []
    const hasLiked = likes.includes(userId)

    if (hasLiked) {
      // Nếu đã thích, bỏ thích
      const updatedLikes = likes.filter((id) => id !== userId)
      const updatedComment = await commentModel.updateComment(commentId, {
        likes: updatedLikes,
        likesCount: updatedLikes.length,
        updatedAt: Date.now()
      })
      return updatedComment
    } else {
      // Nếu chưa thích, thêm vào danh sách thích
      const updatedLikes = [...likes, userId]
      const updatedComment = await commentModel.updateComment(commentId, {
        likes: updatedLikes,
        likesCount: updatedLikes.length,
        updatedAt: Date.now()
      })
      return updatedComment
    }
  } catch (error) {
    throw error
  }
}

export const commentService = {
  getAll,
  createNew,
  getCommentById,
  updateComment,
  deleteComment,
  likeComment
}