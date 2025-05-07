import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const DISSCUSS_COLLECTION_NAME = 'Discuss'

const DISCUSS_COLLECTION_SCHEMA = Joi.object({
  _id: Joi.object({}).keys({
    _id: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required()
  }),
  heritageId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  parentId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null, ''),
  userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  content: Joi.string().required().trim(),
  comment_left: Joi.number().integer().default(0),
  comment_right: Joi.number().integer().default(0),
  isDeleted: Joi.boolean().default(false),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null).allow(null)
})

const validateBeforeCreate = async (data) => {
  return await DISCUSS_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validatedData = await validateBeforeCreate(data)
    let newCommentData = {
      ...validatedData
    }
    let rightValue
    if (validatedData.parentId) {
      const parentComment = await GET_DB().collection(DISSCUSS_COLLECTION_NAME).findOne({ _id: new ObjectId(validatedData.parentId) })
      if (!parentComment) {
        throw new Error('Parent comment not found')
      }
      // Find the parent comment to determine the left and right values
      rightValue = parentComment.comment_right
      newCommentData.comment_left = rightValue
      newCommentData.comment_right = rightValue + 1
      // Update the right value of the parent comment and all its descendants
      await GET_DB().collection(DISSCUSS_COLLECTION_NAME).updateMany(
        { comment_left: { $gte: rightValue } },
        { $inc: { comment_left: 2 } }
      )
      await GET_DB().collection(DISSCUSS_COLLECTION_NAME).updateMany(
        { comment_right: { $gte: rightValue } },
        { $inc: { comment_right: 2 } }
      )
      // Set the left and right values for the new comment

      await GET_DB().collection(DISSCUSS_COLLECTION_NAME).insertOne(newCommentData)
      return newCommentData

    } else {
      // If no parentId, set left and right values for root comment
      const maxRightValue = await GET_DB().collection(DISSCUSS_COLLECTION_NAME).findOne({ heritageId: validatedData.heritageId }, { sort: { comment_right: -1 } })
      if (maxRightValue) {
        rightValue = maxRightValue.comment_right + 1
      }
      else {
        rightValue = 1
      }
    }

    newCommentData.comment_left = rightValue
    newCommentData.comment_right = rightValue + 1
    return await GET_DB().collection(DISSCUSS_COLLECTION_NAME).insertOne(newCommentData)
  } catch (error) {
    throw new Error(error)
  }
}

const updateOneById = async (id, data) => {
  try {
    const result = await GET_DB().collection(DISSCUSS_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getDiscussByParentId = async (parentId, heritageId) => {
  try {
    if (!ObjectId.isValid(heritageId)) {
      throw new Error('Invalid product ID')
    }

    let comments

    if (parentId) {
      if (!ObjectId.isValid(parentId)) {
        throw new Error('Invalid parent comment ID')
      }

      const parentComment = await GET_DB().collection(DISSCUSS_COLLECTION_NAME).findOne({ _id: new ObjectId(parentId) })
      if (!parentComment) {
        throw new Error('Parent comment not found')
      }

      comments = await GET_DB().collection(DISSCUSS_COLLECTION_NAME)
        .find({
          heritageId: heritageId,
          parentId: parentId,
          comment_left: { $gte: parentComment.comment_left, $lte: parentComment.comment_right },
          isDeleted: false
        })
        .project({
          comment_left: 1,
          comment_right: 1,
          content: 1,
          parentId: 1,
          userId: 1
        })
        .sort({ comment_left: 1 })
        .toArray()
    } else {
      comments = await GET_DB().collection(DISSCUSS_COLLECTION_NAME)
        .find({
          heritageId: heritageId,
          parentId: null,
          isDeleted: false
        })
        .project({
          comment_left: 1,
          comment_right: 1,
          content: 1,
          parentId: 1,
          userId: 1
        })
        .sort({ comment_left: 1 })
        .toArray()
    }

    const userIds = comments.map(comment => comment.userId)
    const users = await GET_DB().collection('User')
      .find({ _id: { $in: userIds.map(id => new ObjectId(id)) } })
      .project({
        _id: 1,
        displayname: 1,
        avatar: 1
      })
      .toArray()

    // Tạo một map để dễ dàng truy cập thông tin người dùng
    const userMap = new Map(users.map(user => [user._id.toString(), user]))

    // Kết hợp thông tin người dùng vào kết quả bình luận
    const commentsWithUser = comments.map(comment => {
      const user = userMap.get(comment.userId.toString())
      return {
        ...comment,
        user: user || { _id: comment.userId, name: 'Unknown User', avatar: null } // Xử lý trường hợp không tìm thấy user
      }
    })
    return commentsWithUser
  } catch (error) {
    throw new Error(`Failed to retrieve comments: ${error.message}`)
  }
}

const findOneById = async (id) => {
  try {
    const objectId = new ObjectId(id)
    return await GET_DB().collection(DISSCUSS_COLLECTION_NAME).findOne({ _id: objectId })
  } catch (error) {
    return null
  }
}

const deleteById = async (id) => {
  try {
    const objectId = new ObjectId(id)
    const result = await GET_DB().collection(DISSCUSS_COLLECTION_NAME).deleteOne({ _id: objectId })
    return result
  } catch (error) {
    return { acknowledged: false, deletedCount: 0 }
  }
}

const deleteNestedById = async (heritageId, commentId) => {
  try {
    if (!ObjectId.isValid(heritageId) || !ObjectId.isValid(commentId)) {
      return { acknowledged: false, deletedCount: 0 }
    }

    const objectId = new ObjectId(commentId)

    const comment = await GET_DB()
      .collection(DISSCUSS_COLLECTION_NAME)
      .findOne({
        _id: objectId
      })

    if (!comment) {
      return { acknowledged: false, deletedCount: 0 }
    }

    const left = comment.comment_left
    const right = comment.comment_right

    const width = right - left + 1


    const result = await GET_DB()
      .collection(DISSCUSS_COLLECTION_NAME)
      .deleteMany({
        heritageId: (heritageId),
        comment_left: { $gte: left, $lte: right }
      })


    await GET_DB()
      .collection(DISSCUSS_COLLECTION_NAME)
      .updateMany(
        {
          heritageId: (heritageId),
          comment_left: { $gt: right }
        },
        {
          $inc: { comment_left: -width }
        }
      )
    await GET_DB()
      .collection(DISSCUSS_COLLECTION_NAME)
      .updateMany(
        {
          heritageId: (heritageId),
          comment_right: { $gt: right }
        },
        {
          $inc: { comment_right: -width }
        }
      )

    return result
  } catch (error) {
    return { acknowledged: false, deletedCount: 0, heritageId, parentId: null }
  }
}

export const discussModel = {
  DISSCUSS_COLLECTION_NAME,
  DISCUSS_COLLECTION_SCHEMA,
  createNew,
  updateOneById,
  getDiscussByParentId,
  findOneById,
  deleteById,
  deleteNestedById
}
