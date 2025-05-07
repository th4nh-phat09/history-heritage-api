import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'

const HERITAGE_COLLECTION_NAME = 'HistoryHeritage'
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']
const HERITAGE_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(3).max(100).trim(),
  nameSlug: Joi.string().trim(),
  description: Joi.string().required().min(10).trim(),
  images: Joi.array().items(Joi.string().uri()).default([]),
  location: Joi.string().trim(),
  locationSlug: Joi.string().trim(),
  locationNormalized: Joi.string().trim(),
  coordinates: Joi.object({
    latitude: Joi.string().trim().required(),
    longitude: Joi.string().trim().required()
  }).required(),
  stats: Joi.object({
    averageRating: Joi.string().trim().default('0'),
    totalReviews: Joi.string().trim().default('0'),
    totalVisits: Joi.string().trim().default('0'),
    totalFavorites: Joi.string().trim().default('0')
  }).default({ averageRating: '0', totalReviews: '0', totalVisits: '0', totalFavorites: '0' }),
  knowledgeTestId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null).default(null),
  leaderboardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null).default(null),

  leaderboardSummary: Joi.object({
    topScore: Joi.string().trim().default('0'),
    topUsers: Joi.array().items(
      Joi.object({
        userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        userName: Joi.string().allow(''),
        score: Joi.number()
      })
    ).max(10).default([]),
    totalParticipants: Joi.string().trim().default('0')
  }).default({ topScore: '0', topUsers: [], totalParticipants: '0' }),

  knowledgeTestSummary: Joi.object({
    title: Joi.string().allow('').default(''),
    questionCount: Joi.string().trim().default('0'),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').default('Medium')
  }).default({ title: '', questionCount: '0', difficulty: 'Medium' }),
  rolePlayIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  additionalInfo: Joi.object({
    architectural: Joi.string().allow(null).default(null),
    culturalFestival: Joi.string().allow(null).default(null),
    historicalEvents: Joi.array().items(
      Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required()
      })
    ).default([])
  }).default({ architectural: null, culturalFestival: null, historicalEvents: [] }),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
  popularTags: Joi.array().items(Joi.string().trim()).default([]),
  tagsSlug: Joi.array().items(Joi.string().trim()).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

// Hàm lấy collection object để thao tác với DB
const getCollection = () => {
  return GET_DB().collection(HERITAGE_COLLECTION_NAME)
}

// --- Các hàm thao tác với Database ---

// Tạo mới một di tích
const createNew = async (data) => {
  try {
    // Validate dữ liệu trước khi insert
    const validatedData = await HERITAGE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    const result = await getCollection().insertOne(validatedData) // Dùng validatedData đã được validate và áp dụng default
    return result
  } catch (error) { throw new Error(error) }
}

// Tìm một di tích theo ID
const findOneById = async (heritageId) => {
  try {
    // Cần chuyển heritageId thành ObjectId
    const result = await getCollection().findOne({ _id: new ObjectId(heritageId) })
    return result
  } catch (error) { throw new Error(error) }
}

const findOneBySlug = async (nameSlug) => {
  try {
    // Cần chuyển heritageId thành ObjectId
    const result = await getCollection().findOne({ nameSlug: nameSlug })
    return result
  } catch (error) { throw new Error(error) }
}

// Lấy danh sách di tích với bộ lọc, sắp xếp và phân trang
const findListHeritages = async ({ filter, sort, skip, limit }) => {
  try {
    const listHeritages = getCollection().find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
    // Lấy kết quả dạng Mảng
    const results = await listHeritages.toArray()
    // Đếm tổng số bản ghi khớp với filter (không tính limit, skip)
    const totalCount = await getCollection().countDocuments(filter)
    return { results, totalCount }
  } catch (error) { throw new Error(error) }
}

// Cập nhật một di tích
const updateOneById = async (id, dataUpdate) => {
  try {
    Object.keys(dataUpdate).forEach(fieldname => {
      if (INVALID_UPDATE_FIELDS.includes(fieldname))
        delete dataUpdate[fieldname]
    })
    const result = await getCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: dataUpdate },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

// Xóa một di tích
const deleteOneById = async (id) => {
  try {
    const result = await getCollection().deleteOne({ _id: new ObjectId(id) })
    return result
  } catch (error) { throw new Error(error) }
}

// Lấy chi tiết một di tích
const getDetailById = async (id) => {
  try {
    const result = await getCollection().findOne({
      _id: new ObjectId(id),
      _destroy: { $ne: true }
    })
    return result
  } catch (error) { throw new Error(error) }
}

const getAllHerritageName = async () => {
  try {
    const result = await getCollection().find(
      { _destroy: { $ne: true } },
      { projection: { _id: 1, name: 1 } }
    ).toArray()
    return result
  } catch (error) { throw new Error(error) }
}


// --- Export Model ---
export const heritageModel = {
  HERITAGE_COLLECTION_NAME,
  HERITAGE_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findListHeritages,
  updateOneById,
  deleteOneById,
  getDetailById,
  findOneBySlug,
  getAllHerritageName
}