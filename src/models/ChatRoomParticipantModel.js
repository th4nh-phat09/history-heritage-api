import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define Collection (name & schema)
const PARTICIPANT_COLLECTION_NAME = 'ChatRoomParticipant'
const PARTICIPANT_COLLECTION_SCHEMA = Joi.object({
  chatRoomId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  userId: Joi.string().required(),
  // socketId: Joi.string(),
  username: Joi.string().default('Khách'),
  status: Joi.string().valid('ONLINE', 'OFFLINE', 'AWAY').default('OFFLINE'),
  lastActive: Joi.date().timestamp('javascript').default(Date.now),
  joinedAt: Joi.date().default(Date.now),
  createAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

// Chỉ định những trường không nên update
const INVALID_DATA_UPDATE = ['_id', 'createAt', 'chatRoomId', 'userId', 'joinedAt']

// Hàm validate của Joi
const validationBeforeCreate = async (data) => {
  return await PARTICIPANT_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

const createNew = async (data) => {
  try {
    const validData = await validationBeforeCreate(data)
    return await GET_DB()
      .collection(PARTICIPANT_COLLECTION_NAME)
      .insertOne({
        ...validData,
        createAt: new Date(),
        updatedAt: new Date(),
        lastActive: new Date(),
        joinedAt: new Date()
      })
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    return await GET_DB()
      .collection(PARTICIPANT_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id)
      })
  } catch (error) {
    throw new Error(error)
  }
}

const findByRoomAndUser = async (chatRoomId, userId) => {
  try {
    return await GET_DB()
      .collection(PARTICIPANT_COLLECTION_NAME)
      .findOne({
        chatRoomId: chatRoomId,
        userId: userId
      })
  } catch (error) {
    throw new Error(error)
  }
}

const findBySocketId = async (socketId) => {
  try {
    return await GET_DB()
      .collection(PARTICIPANT_COLLECTION_NAME)
      .findOne({
        socketId: socketId
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
      .collection(PARTICIPANT_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...data,
            updatedAt: Date.now()
          }
        },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Cập nhật trạng thái người dùng
const updateStatus = async (id, status) => {
  try {
    const result = await GET_DB()
      .collection(PARTICIPANT_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: status,
            lastActive: new Date(),
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

// Cập nhật trạng thái theo socketId
const updateStatusBySocketId = async (socketId, status) => {
  try {
    const result = await GET_DB()
      .collection(PARTICIPANT_COLLECTION_NAME)
      .findOneAndUpdate(
        { socketId: socketId },
        {
          $set: {
            status: status,
            lastActive: new Date(),
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
      .collection(PARTICIPANT_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Xóa người dùng khỏi phòng
const removeFromRoom = async (chatRoomId, userId) => {
  try {
    const result = await GET_DB()
      .collection(PARTICIPANT_COLLECTION_NAME)
      .deleteOne({
        chatRoomId: chatRoomId,
        userId: userId
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Lấy danh sách người dùng trong phòng
const findByRoomId = async (chatRoomId) => {
  try {
    return await GET_DB()
      .collection(PARTICIPANT_COLLECTION_NAME)
      .find({ chatRoomId: chatRoomId })
      .toArray()
  } catch (error) {
    throw new Error(error)
  }
}

// Lấy danh sách người dùng online trong phòng
const findOnlineByRoomId = async (chatRoomId) => {
  try {
    return await GET_DB()
      .collection(PARTICIPANT_COLLECTION_NAME)
      .find({
        chatRoomId: chatRoomId,
        status: 'ONLINE'
      })
      .toArray()
  } catch (error) {
    throw new Error(error)
  }
}

const findByUserId = async (userId) => {
  try {
    return await GET_DB()
      .collection(PARTICIPANT_COLLECTION_NAME)
      .findOne({ userId: userId })
  } catch (error) {
    throw new Error(error)
  }
}
const findByUserIdAndRoomId = async (userId, chatRoomId) => {
  try {
    return await GET_DB()
      .collection(PARTICIPANT_COLLECTION_NAME)
      .findOne({ userId: userId, chatRoomId: chatRoomId })
  } catch (error) {
    throw new Error(error)
  }
}

const updateStatusByUserIdAndRoomId = async (userId, chatRoomId, status) => {
  try {
    return await GET_DB()
      .collection(PARTICIPANT_COLLECTION_NAME)
      .findOneAndUpdate({ userId: userId, chatRoomId: chatRoomId }, { $set: { status: status } })
  } catch (error) {
    throw new Error(error)
  }
}

export const chatRoomParticipantModel = {
  PARTICIPANT_COLLECTION_NAME,
  PARTICIPANT_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findByRoomAndUser,
  findBySocketId,
  update,
  updateStatus,
  updateStatusBySocketId,
  deleteOneById,
  removeFromRoom,
  findByRoomId,
  findOnlineByRoomId,
  findByUserId,
  findByUserIdAndRoomId,
  updateStatusByUserIdAndRoomId
} 