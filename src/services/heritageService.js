import { heritageModel } from '~/models/heritageModel'
import { removeVietnameseTones } from '~/utils/validators'
import slugify from 'slugify'

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
            const nameSlug = slugify(name, { lower: true, locale: 'vi', trim: true })
            filter.nameSlug = { $regex: nameSlug, $options: 'i' }
        }
        if (location) {
            const locationSlug = slugify(location, { lower: true, locale: 'vi', trim: true })
            filter.locationSlug = { $regex: locationSlug, $options: 'i' }
        }
        if (tags && tags.length > 0) {
            const tagsSlug = tags.map(tag => slugify(tag, { lower: true, locale: 'vi', trim: true }))
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

export const heritageService = {
    getHeritages
}