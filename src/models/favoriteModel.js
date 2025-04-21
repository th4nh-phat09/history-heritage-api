import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { OBJECT_ID_RULE } from '~/utils/validators'

// Define Collection (name & schema)
const FAVORITE_COLLECTION_NAME = 'Favorite'
const FAVORITE_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  items: Joi.array()
    .items(
      Joi.object({
        heritageId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        addedAt: Joi.date().default(Date.now)
      })
    )
    .default([]),

  createAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

// chỉ định những trường ko nên update
const INVALID_DATA_UPDATE = ['_id', 'createAt']

// hàm validate của Joi
const validationBeforeCreate = async (data) => {
  return await FAVORITE_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}


const createNew = async (data) => {
  try {
    const validation = await validationBeforeCreate(data)
    return await GET_DB()
      .collection(FAVORITE_COLLECTION_NAME)
      .insertOne(validation)
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    return await GET_DB()
      .collection(FAVORITE_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id)
      })
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {
    // lọc những field ko cho phép update
    Object.keys(data).forEach((key) => {
      if (INVALID_DATA_UPDATE.includes(key)) {
        delete data[key]
      }
    })

    const result = await GET_DB()
      .collection(FAVORITE_COLLECTION_NAME)
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

// xóa theo id
const deleteOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(FAVORITE_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// tìm kiếm tất cả với phân trang
const findAll = async ({ page, limit, sort, order }) => {
  try {
    const skip = (page - 1) * limit
    const sortCriteria = { [sort]: order === 'asc' ? 1 : -1 }

    const results = await GET_DB()
      .collection(FAVORITE_COLLECTION_NAME)
      .find()
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await GET_DB()
      .collection(FAVORITE_COLLECTION_NAME)
      .countDocuments()

    return { results, total }
  } catch (error) {
    throw new Error(error)
  }
}

// tìm kiếm theo userId với phân trang
const findByUserIdAndPagination = async ({ userId, page, limit }) => {
  // Tính vị trí bắt đầu lấy items dựa vào page và limit
  const skip = (page - 1) * limit

  // Sử dụng MongoDB Aggregation để:
  return await GET_DB()
    .collection(FAVORITE_COLLECTION_NAME)
    .findOne(
      { userId: userId },  // Tìm document theo userId
      {
        projection: {
          items: { $slice: [skip, limit] },  // Lấy một phần của array items
          total: { $size: '$items' }         // Đếm tổng số items
        }
      }
    )
}

const findByUserId = async (userId) => {
  try {
    return await GET_DB()
      .collection(FAVORITE_COLLECTION_NAME)
      .findOne({ userId: userId })
  } catch (error) {
    throw new Error(error)
  }
}

export const favoriteModel = {
  FAVORITE_COLLECTION_NAME,
  FAVORITE_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  update,
  deleteOneById,
  findAll,
  findByUserId,
  findByUserIdAndPagination
}
