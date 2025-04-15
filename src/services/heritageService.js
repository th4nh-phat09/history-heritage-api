import { StatusCodes } from 'http-status-codes'
import { heritageModel } from '~/models/heritageModel'
import ApiError from '~/utils/ApiError'
import { createSlug } from '~/utils/validators'

const getHeritages = async (queryParams) => {
  try {
    // Loại bỏ các giá trị default ở đây vì queryParams đã được validation xử lý
    const { page, limit, name, location, tags, sort, order, status } = queryParams
    // Tính toán skip
    const skip = (page - 1) * limit

    // Xây dựng filter
    const filter = {}
    if (status !== 'ALL') filter.status = status
    if (name) {
      const nameSlug = createSlug(name)
      filter.nameSlug = { $regex: nameSlug, $options: 'i' }
    }
    if (location) {
      const locationSlug = createSlug(location)
      filter.locationSlug = { $regex: locationSlug, $options: 'i' }
    }
    if (tags && tags.length > 0) {
      const tagsSlug = tags.map(tag => createSlug(tag))
      filter.tagsSlug = { $all: tagsSlug }
    }
    // Xây dựng sort
    const sortOptions = {}
    sortOptions[sort] = order === 'asc' ? 1 : -1
    const { results, totalCount } = await heritageModel.findListHeritages({
      filter,
      sort: sortOptions,
      skip,
      limit
    })

    // Tính toán tổng số trang
    const totalPages = Math.ceil(totalCount / limit)

    return {
      heritages: results,
      pagination: {
        totalItems: totalCount,
        currentPage: parseInt(page, 10),
        totalPages,
        itemsPerPage: parseInt(limit, 10)
      }
    }
  } catch (error) {
    throw error
  }
}

const createHeritage = async (data) => {
  try {
    // Tạo slug cho các trường cần thiết
    // Tạo slug cho các trường cần thiết
    const nameSlug = createSlug(data.name || '')
    const rawLocation = data.location || ''
    const cleanLocation = rawLocation.replace(/,/g, ', ')
    const locationSlug = createSlug(cleanLocation)
    const tagsSlug = (data.popularTags || []).map(tag => createSlug(tag || ''))

    const dataWithSlug = {
      ...data,
      nameSlug,
      locationSlug,
      tagsSlug
    }

    const createdHeritage = await heritageModel.createNew(dataWithSlug)
    const getNewHeritage = await heritageModel.findOneById(createdHeritage.insertedId)
    return getNewHeritage
  } catch (error) {
    throw error
  }
}

const updateHeritage = async (id, data) => {
  try {
    const existingHeritage = await heritageModel.findOneById(id)
    if (!existingHeritage)
      throw new ApiError(StatusCodes.NOT_FOUND, 'The specified heritage site could not be found.')
    const { name, location, popularTags, ...rest } = data
    const dataUpdate = {
      ...rest,
      updatedAt: Date.now(),
      nameSlug: name ? createSlug(name) : undefined,
      locationSlug: location ? createSlug(location.replace(/,/g, ', ')) : undefined,
      tagsSlug: popularTags ? popularTags.map(tag => createSlug(tag || '')) : []
    }
    const updatedHeritage = await heritageModel.updateOneById(id, dataUpdate)
    return updatedHeritage
  } catch (error) {
    throw error
  }
}

const deleteHeritage = async (id) => {
  try {
    await heritageModel.deleteOneById(id)
    return { deletedResult: 'Heritage was deleted' }
  } catch (error) {
    throw error
  }
}

const getHeritageDetail = async (id) => {
  try {
    const result = await heritageModel.getDetailById(id)
    if (!result)
      throw new ApiError(StatusCodes.NOT_FOUND, 'The specified heritage site could not be found.')
    return result
  } catch (error) {
    throw error
  }
}

export const heritageService = {
  getHeritages,
  createHeritage,
  updateHeritage,
  deleteHeritage,
  getHeritageDetail
}