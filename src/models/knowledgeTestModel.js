import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'

const KNOWLEDGE_TEST_COLLECTION_NAME = 'knowledgeTest'
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

// Define Schema
const KNOWLEDGE_TEST_COLLECTION_SCHEMA = Joi.object({
  heritageId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  title: Joi.string().required().min(3).max(200).trim(),
  content: Joi.string().required().trim(),
  questions: Joi.array().items(
    Joi.object({
      content: Joi.string().required().trim(),
      explanation: Joi.string().allow('').trim(),
      image: Joi.string().allow('').trim(),
      options: Joi.array().items(
        Joi.object({
          optionText: Joi.string().required().trim(),
          isCorrect: Joi.boolean().required()
        })
      ).min(2).required()
    })
  ).default([]),
  stats: Joi.object({
    totalAttempts: Joi.number().default(0),
    averageScore: Joi.number().default(0),
    highestScore: Joi.number().default(0)
  }).default({
    totalAttempts: 0,
    averageScore: 0,
    highestScore: 0
  }),
  topPerformersLimit: Joi.number().default(10),
  topPerformers: Joi.array().items(
    Joi.object({
      userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      userName: Joi.string().required(),
      score: Joi.number().required(),
      date: Joi.date().timestamp('javascript').default(Date.now)
    })
  ).default([]),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

// Get Collection
const getCollection = () => {
  return GET_DB().collection(KNOWLEDGE_TEST_COLLECTION_NAME)
}

// Create new test
const createNew = async (data) => {
  try {
    const validatedData = await KNOWLEDGE_TEST_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false, allowUnknown: true })
    const result = await getCollection().insertOne(validatedData)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Find one by id
const findOneById = async (id) => {
  try {
    const result = await getCollection().findOne({ _id: new ObjectId(id) })
    return result
  } catch (error) { throw new Error(error) }
}

// Find by heritage id
const findByHeritageId = async (heritageId) => {
  try {
    const result = await getCollection().find({
      heritageId: heritageId,
      status: 'ACTIVE'
    }).toArray()
    return result
  } catch (error) { throw new Error(error) }
}


const updateOneById = async (id, dataUpdate) => {
  try {
    // Loại bỏ các trường không hợp lệ
    Object.keys(dataUpdate).forEach(fieldname => {
      if (INVALID_UPDATE_FIELDS.includes(fieldname))
        delete dataUpdate[fieldname]
    })

    // Kiểm tra xem có cập nhật option hoặc question không
    if (dataUpdate.questionId && dataUpdate.options) {
      const { questionId, options } = dataUpdate

      const result = await getCollection().findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            'questions.$[q].options': options,
            updatedAt: Date.now()
          }
        },
        {
          arrayFilters: [{ 'q.questionId': questionId }],
          returnDocument: 'after'
        }
      )
      return result
    } else if (dataUpdate.questionId) {
      // Cập nhật một question cụ thể
      const { questionId, ...questionData } = dataUpdate

      const result = await getCollection().findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            'questions.$[q]': questionData,
            updatedAt: Date.now()
          }
        },
        {
          arrayFilters: [{ 'q.questionId': questionId }],
          returnDocument: 'after'
        }
      )
      return result
    } else {
      const result = await getCollection().findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: dataUpdate },
        { returnDocument: 'after' }
      )
      return result
    }
  } catch (error) { throw new Error(error) }
}

// Soft delete
const deleteOneById = async (id) => {
  try {
    const result = await getCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'INACTIVE',
          updatedAt: Date.now()
        }
      },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

// Update stats and top performers
const updateTestStats = async (id, userId, userName, newScore) => {

    try {
        const test = await findOneById(id)
        if (!test) throw new Error('Test not found')

        if (Object.keys(test.stats).length === 0) {
            test.stats = {
                totalAttempts: 0,
                averageScore: 0,
                highestScore: 0
            }
        }

    // Calculate new stats
    const newStats = {
      totalAttempts: test.stats.totalAttempts + 1,
      averageScore: ((test.stats.averageScore * test.stats.totalAttempts) + newScore) / (test.stats.totalAttempts + 1),
      highestScore: Math.max(test.stats.highestScore, newScore)
    }

    // Update top performers
    let topPerformers = [...test.topPerformers]
    const newPerformer = {
      userId: userId,
      userName: userName,
      score: newScore,
      date: new Date()
    }

    // Tìm performer cũ nếu đã có
    const existingIndex = topPerformers.findIndex(p => p.userId.toString() === userId.toString())

    // Nếu chưa có hoặc điểm mới cao hơn điểm cũ
    if (existingIndex === -1 || newScore > topPerformers[existingIndex].score) {
      if (existingIndex !== -1)
        topPerformers.splice(existingIndex, 1)

      // Thêm bản mới
      topPerformers.push(newPerformer)

      // Sắp xếp và giới hạn
      topPerformers.sort((a, b) => b.score - a.score)
      topPerformers = topPerformers.slice(0, test.topPerformersLimit)
    }

    const result = await getCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          stats: newStats,
          topPerformers: topPerformers,
          updatedAt: Date.now()
        }
      },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }

}

const findList = async ({ filter, skip, limit }) => {
  try {
    const results = await getCollection().find(filter)
      .skip(skip)
      .limit(limit)
      .toArray()
    const totalCount = await getCollection().countDocuments(filter)
    return { results, totalCount }
  } catch (error) {
    throw new Error(error)
  }
}

export const knowledgeTestModel = {
  KNOWLEDGE_TEST_COLLECTION_NAME,
  KNOWLEDGE_TEST_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findByHeritageId,
  updateOneById,
  deleteOneById,
  updateTestStats,
  findList
}