import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define Collection (name & schema)
const CHATROOM_COLLECTION_NAME = 'ChatRoom'
const CHATROOM_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().trim(),
  heritageId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  type: Joi.string().valid('HERITAGE', 'DIRECT').default('HERITAGE'),
  participants: Joi.array().items(Joi.string()).default([]),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
  lastMessage: Joi.object({
    content: Joi.string().required().trim().min(1).max(1000),
    userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    username: Joi.string().required().trim().min(1).max(50),
    sentAt: Joi.date().timestamp('javascript').default(Date.now)
  }).default(null),
  createAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

// Chỉ định những trường không nên update
const INVALID_DATA_UPDATE = ['_id', 'createAt']

// Hàm validate của Joi
const validationBeforeCreate = async (data) => {
  return await CHATROOM_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
    allowUnknown: true
  })
}

const createNew = async (data) => {
  try {
    // Đảm bảo phòng chat direct chỉ có 2 người tham gia
    if (data.type === 'DIRECT' && data.participants && data.participants.length > 2) {
      data.participants = data.participants.slice(0, 2)
    }

    const validData = await validationBeforeCreate(data)
    return await GET_DB()
      .collection(CHATROOM_COLLECTION_NAME)
      .insertOne({
        ...validData,
        createAt: Date.now(),
        updatedAt: Date.now()
      })
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    return await GET_DB()
      .collection(CHATROOM_COLLECTION_NAME)
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

    // Đảm bảo phòng chat direct chỉ có 2 người tham gia
    if (data.type === 'DIRECT' && data.participants && data.participants.length > 2) {
      data.participants = data.participants.slice(0, 2)
    }

    const result = await GET_DB()
      .collection(CHATROOM_COLLECTION_NAME)
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

// Thêm người dùng vào phòng
const addParticipant = async (roomId, userId) => {
  try {
    const result = await GET_DB()
      .collection(CHATROOM_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(roomId),
          participants: { $ne: userId }
        },
        {
          $push: { participants: userId },
          $set: { updatedAt: new Date() }
        },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Xóa người dùng khỏi phòng
const removeParticipant = async (roomId, userId) => {
  try {
    const result = await GET_DB()
      .collection(CHATROOM_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(roomId) },
        {
          $pull: { participants: userId },
          $set: { updatedAt: new Date() }
        },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Cập nhật tin nhắn cuối cùng
const updateLastMessage = async (roomId, messageData) => {
  try {
    const result = await GET_DB()
      .collection(CHATROOM_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(roomId) },
        {
          $set: {
            lastMessage: {
              content: messageData.content,
              userId: messageData.userId,
              username: messageData.username,
              sentAt: Date.now()
            },
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

// Xóa theo id
const deleteOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(CHATROOM_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Tìm kiếm tất cả với phân trang
const findAll = async ({ page, limit, sort, order }) => {
  try {
    const skip = (page - 1) * limit
    const sortCriteria = { [sort]: order === 'asc' ? 1 : -1 }
    console.log(page, limit, sort, order)

    const results = await GET_DB()
      .collection(CHATROOM_COLLECTION_NAME)
      .find({})
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await GET_DB()
      .collection(CHATROOM_COLLECTION_NAME)
      .countDocuments()

    return { results, total }
  } catch (error) {
    throw new Error(error)
  }
}

// Tìm kiếm theo heritageId
const findByHeritageId = async (heritageId) => {
  try {
    return await GET_DB()
      .collection(CHATROOM_COLLECTION_NAME)
      .findOne({
        heritageId: heritageId,
        type: 'HERITAGE'
      })
  } catch (error) {
    throw new Error(error)
  }
}

// Tìm kiếm phòng chat trực tiếp giữa hai người dùng
const findDirectRoom = async (userIds) => {
  try {
    if (!Array.isArray(userIds) || userIds.length !== 2) {
      throw new Error('Cần chính xác 2 người dùng để tìm phòng chat trực tiếp')
    }

    return await GET_DB()
      .collection(CHATROOM_COLLECTION_NAME)
      .findOne({
        type: 'DIRECT',
        participants: { $all: userIds }
      })
  } catch (error) {
    throw new Error(error)
  }
}

export const chatRoomModel = {
  CHATROOM_COLLECTION_NAME,
  CHATROOM_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  update,
  addParticipant,
  removeParticipant,
  updateLastMessage,
  deleteOneById,
  findAll,
  findByHeritageId,
  findDirectRoom
}