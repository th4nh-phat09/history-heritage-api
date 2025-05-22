import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { OBJECT_ID_RULE } from '~/utils/validators'

const COMMENT_STATUS = {
  DELETED: 'DELETED',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
}

// Define Collection (name & schema)
const COMMENT_COLLECTION_NAME = 'Comment'
const COMMENT_COLLECTION_SCHEMA = Joi.object({
  heritageId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE), // ID của di tích mà bình luận thuộc về
  user: Joi.object({
    id: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE), // ID của người gửi bình luận
    displayName: Joi.string().required().trim().strict(), // Tên hiển thị của người gửi bình luận
    avatar: Joi.string().allow(null).default(null) // Ảnh đại diện của người gửi bình luận
  }).required(),
  content: Joi.string().required().trim().strict(), // Nội dung bình luận
  likes: Joi.array()
    .items(
      Joi.string()
        .pattern(OBJECT_ID_RULE)
        .message(OBJECT_ID_RULE_MESSAGE)
    )
    .default([]), // Danh sách ID người dùng đã thích
  likesCount: Joi.number().default(0), // Số lượng lượt thích
  status: Joi.string()
    .valid(COMMENT_STATUS.DELETED, COMMENT_STATUS.ACTIVE, COMMENT_STATUS.INACTIVE)
    .default(COMMENT_STATUS.ACTIVE), // Trạng thái bình luận
  rating: Joi.number().min(1).max(5).default(null), // Đánh giá
  images: Joi.array().items(Joi.string()).default([]), // URL của hình ảnh
  createdAt: Joi.date().timestamp('javascript').default(Date.now), // Thời gian tạo
  updatedAt: Joi.date().timestamp('javascript').default(null) // Thời gian cập nhật
})

// Chỉ định những trường không nên update
const INVALID_DATA_UPDATE = ['_id', 'createdAt', 'heritageId', 'user']

// Hàm validate của Joi
const validationBeforeCreate = async (data) => {
  return await COMMENT_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

// Tạo comment mới
const createNew = async (data) => {
  try {
    const validation = await validationBeforeCreate(data)
    return await GET_DB()
      .collection(COMMENT_COLLECTION_NAME)
      .insertOne(validation)
  } catch (error) {
    throw new Error(error)
  }
}

// Lấy danh sách comment với phân trang
const getAllWithPagination = async ({ filter, sort, skip, limit }) => {
  try {
    return await GET_DB()
      .collection(COMMENT_COLLECTION_NAME)
      .find(filter) // Áp dụng bộ lọc
      .sort(sort) // Sắp xếp
      .skip(skip) // Bỏ qua số bản ghi
      .limit(limit) // Giới hạn số bản ghi
      .toArray()
  } catch (error) {
    throw new Error(error)
  }
}

// Đếm tổng số bản ghi phù hợp với bộ lọc
const countDocuments = async (filter) => {
  try {
    return await GET_DB()
      .collection(COMMENT_COLLECTION_NAME)
      .countDocuments(filter)
  } catch (error) {
    throw new Error(error)
  }
}

// Tìm comment bằng commentId
const findOneById = async (id) => {
  try {
    return await GET_DB()
      .collection(COMMENT_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id)
      })
  } catch (error) {
    throw new Error(error)
  }
}

// Cập nhật thông tin comment
const updateComment = async (id, data) => {
  try {
    // Lọc những field không cho phép update
    Object.keys(data).forEach((key) => {
      if (INVALID_DATA_UPDATE.includes(key)) {
        delete data[key]
      }
    })

    const result = await GET_DB()
      .collection(COMMENT_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: data },
        { returnDocument: 'after' } // Trả về kết quả mới sau khi update
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Xóa comment
const deleteOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(COMMENT_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const commentModel = {
  COMMENT_COLLECTION_NAME,
  COMMENT_COLLECTION_SCHEMA,
  createNew,
  getAllWithPagination,
  countDocuments,
  findOneById,
  updateComment,
  deleteOneById
}