import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define Collection (name & schema)
const MESSAGE_COLLECTION_NAME = 'Message'
const MESSAGE_COLLECTION_SCHEMA = Joi.object({
  chatRoomId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  userId: Joi.string().required(),
  content: Joi.string().required(),
  type: Joi.string().valid('TEXT', 'IMAGE', 'FILE', 'AUDIO', 'VIDEO', 'SYSTEM').default('TEXT'),
  status: Joi.string().valid('SENT', 'DELIVERED', 'READ', 'DELETED').default('SENT'),
  // sender: Joi.object({
  //     userId: Joi.string(),
  //     username: Joi.string()
  // }),
  // metadata: Joi.object().default({}),
  createAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

// Chỉ định những trường không nên update
const INVALID_DATA_UPDATE = ['_id', 'createAt', 'chatRoomId', 'userId']

// Hàm validate của Joi
const validationBeforeCreate = async (data) => {
  return await MESSAGE_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

const createNew = async (data) => {
  try {
    const validData = await validationBeforeCreate(data)
    return await GET_DB()
      .collection(MESSAGE_COLLECTION_NAME)
      .insertOne({
        ...validData,
        createAt: new Date(),
        updatedAt: new Date()
      })
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    return await GET_DB()
      .collection(MESSAGE_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id)
      })
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {
    // Lọc những field không cho phép update
    Object.keys(data).forEach((key) => {
      if (INVALID_DATA_UPDATE.includes(key)) {
        delete data[key]
      }
    })

    const result = await GET_DB()
      .collection(MESSAGE_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...data,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Cập nhật trạng thái tin nhắn
const updateStatus = async (id, status) => {
  try {
    const result = await GET_DB()
      .collection(MESSAGE_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: status,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Xóa tin nhắn (đánh dấu là đã xóa)
const softDelete = async (id) => {
  try {
    const result = await GET_DB()
      .collection(MESSAGE_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: 'DELETED',
            content: 'Tin nhắn đã bị xóa',
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Xóa theo id
const deleteOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(MESSAGE_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Lấy tin nhắn theo phòng chat
const findByChatRoomId = async (chatRoomId, limit = 2) => {
  try {
    return await GET_DB()
      .collection(MESSAGE_COLLECTION_NAME)
      .find({ chatRoomId: chatRoomId })
      .sort({ createAt: 1 })
      .limit(limit)
      .toArray()
  } catch (error) {
    throw new Error(error)
  }
}

// Lấy tin nhắn theo phòng chat với phân trang
const findByChatRoomIdPaginated = async (chatRoomId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit

    const results = await GET_DB()
      .collection(MESSAGE_COLLECTION_NAME)
      .find({ chatRoomId: chatRoomId })
      .sort({ createAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await GET_DB()
      .collection(MESSAGE_COLLECTION_NAME)
      .countDocuments({ chatRoomId: chatRoomId })

    return { results, total, page, limit }
  } catch (error) {
    throw new Error(error)
  }
}

export const messageModel = {
  MESSAGE_COLLECTION_NAME,
  MESSAGE_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  update,
  updateStatus,
  softDelete,
  deleteOneById,
  findByChatRoomId,
  findByChatRoomIdPaginated
}