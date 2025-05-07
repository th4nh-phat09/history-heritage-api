import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { OBJECT_ID_RULE } from '~/utils/validators'
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  PHONE_RULE,
  PHONE_RULE_MESSAGE
} from '~/utils/validators'

const USER_ROLE = {
  MEMBER: 'member',
  STAFF: 'staff',
  ADMIN: 'admin'
}

const GENDER_OPTION = {
  MEN: 'men',
  WOMAN: 'woman',
  OTHER: 'other'
}
// Define Collection (name & schema)
const USER_COLLECTION_NAME = 'User'
const USER_COLLECTION_SCHEMA = Joi.object({
  role: Joi.string()
    .valid(USER_ROLE.STAFF, USER_ROLE.ADMIN, USER_ROLE.MEMBER)
    .default(USER_ROLE.MEMBER),
  displayname: Joi.string().required().trim().strict(),
  phone: Joi.string().pattern(PHONE_RULE).message(PHONE_RULE_MESSAGE),
  gender: Joi.string().valid(GENDER_OPTION.MEN, GENDER_OPTION.WOMAN, GENDER_OPTION.OTHER).default(GENDER_OPTION.OTHER),

  dateOfBirth: Joi.date().default(null),
  avatar: Joi.string().default(null),

  account: Joi.object({
    email: Joi.string()
      .required()
      .pattern(EMAIL_RULE)
      .message(EMAIL_RULE_MESSAGE), // unique
    password: Joi.string().required(),
    isActive: Joi.boolean().default(false),
    verifyToken: Joi.string(),
    code: Joi.string(),
    codeExpiry: Joi.date().default(null),
    isVerified: Joi.boolean().default(false),
    codeVerify: Joi.string(),
    resetPasswordToken: Joi.string().allow(null).default(null),
    resetPasswordExpires: Joi.date().allow(null).default(null),
  }),

  heritageIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  notifications: Joi.object({
    unreadCount: Joi.number().default(0),
    recentNotifications: Joi.array()
      .items(
        Joi.object({
          id: Joi.string()
            .pattern(OBJECT_ID_RULE)
            .message(OBJECT_ID_RULE_MESSAGE),
          message: Joi.string(),
          date: Joi.date(),
          isRead: Joi.boolean()
        })
      )
      .default([])
  }).default({}),

  // leaderboardStats: Joi.object({
  //   bestRank: Joi.number().default(null),
  //   bestScore: Joi.number().default(0),
  //   totalParticipations: Joi.number().default(0)
  // }).default({}),

  stats: Joi.object({
    totalVisitedHeritages: Joi.number().default(0),
    totalCompletedTests: Joi.number().default(0),
    averageScore: Joi.number().default(0),
    totalReviews: Joi.number().default(0)
  }).default({
    totalVisitedHeritages: 0,
    totalCompletedTests: 0,
    averageScore: 0,
    totalReviews: 0
  }),

  createAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

// chỉ định những trường ko nên update
const INVALID_DATA_UPDATE = ['_id', 'createAt']

// hàm validate của Joi
const validationBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

// tạo user
const createNew = async (data) => {
  try {
    const validation = await validationBeforeCreate(data)
    return await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .insertOne(validation)
  } catch (error) {
    throw new Error(error)
  }
}


// Lấy danh sách user với phân trang
const getAllWithPagination = async ({ filter, sort, skip, limit }) => {
  try {
    return await GET_DB()
      .collection(USER_COLLECTION_NAME)
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
      .collection(USER_COLLECTION_NAME)
      .countDocuments(filter)
  } catch (error) {
    throw new Error(error)
  }
}

// Tìm user bằng userId
const findOneById = async (id) => {
  try {
    return await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id)
      })
  } catch (error) {
    throw new Error(error)
  }
}

// Tìm user bằng email
const findOneByEmail = async (emailValue) => {
  try {
    return await GET_DB().collection(USER_COLLECTION_NAME).findOne({
      'account.email': emailValue
    })
  } catch (error) {
    throw new Error(error)
  }
}

// update thông tin user
const updateUser = async (id, data) => {
  try {
    // lọc những field ko cho phép update
    Object.keys(data).forEach((key) => {
      if (INVALID_DATA_UPDATE.includes(key)) {
        delete data[key]
      }
    })

    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
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

// xóa user
const deleteOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const countUsersBySpecificDate = async (dateString) => {
  try {
    // Chuyển đổi chuỗi ngày tháng năm thành đối tượng Date
    const [day, month, year] = dateString.split('-').map(Number)
    if (!day || !month || !year || month < 1 || month > 12 || day < 1 || day > new Date(year, month, 0).getDate()) {
      throw new Error('Invalid date format. Please use DD-MM-YYYY.')
    }

    const startDate = new Date(year, month - 1, day) // Month trong Date object bắt đầu từ 0
    const endDate = new Date(year, month - 1, day, 23, 59, 59, 999)

    const query = {
      createAt: {
        $gte: startDate,
        $lte: endDate
      }
    }

    return await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .countDocuments(query)
  } catch (error) {
    throw new Error(error)
  }
}

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  createNew,
  getAllWithPagination,
  countDocuments,
  findOneById,
  findOneByEmail,
  updateUser,
  deleteOneById,
  countUsersBySpecificDate
}
