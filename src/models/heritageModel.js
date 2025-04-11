import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'

// Định nghĩa tên Collection
const HERITAGE_COLLECTION_NAME = 'HistoryHeritage'

// Định nghĩa Schema của Collection (Sử dụng Joi để nhất quán và validate nếu cần)
const HERITAGE_COLLECTION_SCHEMA = Joi.object({
    name: Joi.string().required().min(3).max(100).trim(),
    nameSlug: Joi.string().trim(),
    description: Joi.string().required().min(10).trim(),
    images: Joi.array().items(Joi.string().uri()).default([]),
    location: Joi.string().trim(),
    locationSlug: Joi.string().trim(),
    locationNormalized: Joi.string().trim(),
    coordinates: Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required()
    }).required(),
    stats: Joi.object({
        averageRating: Joi.number().default(0),
        totalReviews: Joi.number().default(0),
        totalVisits: Joi.number().default(0),
        totalFavorites: Joi.number().default(0)
    }).default({ averageRating: 0, totalReviews: 0, totalVisits: 0, totalFavorites: 0 }),
    knowledgeTestId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null).default(null),
    leaderboardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null).default(null),
    leaderboardSummary: Joi.object({
        topScore: Joi.number().default(0),
        topUser: Joi.object({
            userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null).default(null),
            userName: Joi.string().allow('').default('')
        }).default({ userId: null, userName: '' }),
        totalParticipants: Joi.number().default(0)
    }).default({ topScore: 0, topUser: { userId: null, userName: '' }, totalParticipants: 0 }),
    knowledgeTestSummary: Joi.object({
        title: Joi.string().allow('').default(''),
        questionCount: Joi.number().default(0),
        difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').default('Medium')
    }).default({ title: '', questionCount: 0, difficulty: 'Medium' }),
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
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false) // Ví dụ nếu muốn soft delete
})

// Hàm lấy collection object để thao tác với DB
const getCollection = () => {
    return GET_DB().collection(HERITAGE_COLLECTION_NAME)
}

// --- Các hàm thao tác với Database --- 

// Tạo mới một di tích
const createNew = async (data) => {
    try {
        // Validate dữ liệu trước khi insert (không bắt buộc nếu đã validate ở tầng trên)
        // const validatedData = await HERITAGE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
        const result = await getCollection().insertOne(data) // Dùng data đã được service chuẩn bị
        // Trả về document vừa tạo bằng cách tìm lại qua ID
        return findOneById(result.insertedId)
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

// --- Các hàm khác (Ví dụ) ---
// const updateOneById = async (id, updateData) => { ... }
// const deleteOneById = async (id) => { ... } // Có thể là soft delete bằng cách cập nhật _destroy: true

// --- Export Model --- 
export const heritageModel = {
    HERITAGE_COLLECTION_NAME,
    HERITAGE_COLLECTION_SCHEMA,
    createNew,
    findOneById,
    findListHeritages
    // updateOneById,
    // deleteOneById
} 