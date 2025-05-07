import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { log } from 'node:console'
import { GET_DB } from '~/config/mongodb'
import {
  OBJECT_ID_RULE_MESSAGE,
  OBJECT_ID_RULE
} from '~/utils/validators'


// Define Collection (name & schema)
const LEADER_BOARD_COLLECTION_NAME = 'LeaderBoard'
const LEADER_BOARD_COLLECTION_SCHEMA = Joi.object({
  heritageId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  rankings: Joi.array()
    .items(
      Joi.object({
        userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        score: Joi.number().required(),
        rank: Joi.number(),
        avatar: Joi.string().default(null),
        displayName: Joi.string().trim().strict(),
        completeDate: Joi.date()
      })
    )
    .default([]),

  stats: Joi.object({
    totalParticipants: Joi.number().default(0),
    highestScore: Joi.number().default(0),
    averageScore: Joi.number().default(0)
  }).default({
    totalParticipants: 0,
    highestScore: 0,
    averageScore: 0
  }),

  createAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

// chỉ định những trường ko nên update
const INVALID_DATA_UPDATE = ['_id', 'createAt']

// hàm validate của Joi
const validationBeforeCreate = async (data) => {
  return await LEADER_BOARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

// tạo leaderBoard
const createNew = async (data) => {
  try {
    const validation = await validationBeforeCreate(data)
    return await GET_DB()
      .collection(LEADER_BOARD_COLLECTION_NAME)
      .insertOne(validation)
  } catch (error) {
    throw new Error(error)
  }
}


// Lấy danh sách leaderBoard với phân trang
const getAllWithPagination = async ({ filter, sort, skip, limit }) => {
  try {
    return await GET_DB()
      .collection(LEADER_BOARD_COLLECTION_NAME)
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
      .collection(LEADER_BOARD_COLLECTION_NAME)
      .countDocuments(filter)
  } catch (error) {
    throw new Error(error)
  }
}

// Tìm leaderBoard bằng Id
const findOneById = async (id) => {
  try {
    return await GET_DB()
      .collection(LEADER_BOARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id)
      })
  } catch (error) {
    throw new Error(error)
  }
}

// Tìm leaderBoard bằng heritageId không có phân trang
const findOneByHeritageId = async (heritageId) => {
  try {
    return await GET_DB()
      .collection(LEADER_BOARD_COLLECTION_NAME)
      .findOne({ heritageId: heritageId })
  } catch (error) {
    throw new Error(error)
  }
}

// update thông tin
const update = async (id, data) => {
  try {
    // lọc những field ko cho phép update
    Object.keys(data).forEach((key) => {
      if (INVALID_DATA_UPDATE.includes(key)) {
        delete data[key]
      }
    })

    const result = await GET_DB()
      .collection(LEADER_BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: data },
        { returnDocument: 'after' } // trả về kết quả mới sau khi update
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

// xóa leaderBoard bằng id
const deleteOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(LEADER_BOARD_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Lấy leaderBoard bằng heritageId với phân trang
const getByHeritageId = async ({ heritageId, skip, limit }) => {
  try {
    const result = await GET_DB()
      .collection(LEADER_BOARD_COLLECTION_NAME)
      .findOne(
        { heritageId: heritageId },
        {
          projection: {
            rankings: { $slice: [skip, limit] },
            stats: 1
          }
        }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Đếm số lượng rankings trong leaderBoard
const countRankings = async (heritageId) => {
  try {
    const result = await GET_DB()
      .collection(LEADER_BOARD_COLLECTION_NAME)
      .findOne(
        { heritageId: heritageId },
        { projection: { rankingsCount: { $size: '$rankings' } } }
      )
    return result?.rankingsCount || 0
  } catch (error) {
    throw new Error(error)
  }
}

export const leaderBoardModel = {
  LEADER_BOARD_COLLECTION_NAME,
  LEADER_BOARD_COLLECTION_SCHEMA,
  createNew,
  getAllWithPagination,
  countDocuments,
  findOneById,
  update,
  deleteOneById,
  getByHeritageId,
  countRankings,
  findOneByHeritageId
}
