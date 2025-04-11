import slugify from 'slugify'
import { heritageModel } from '~/models/heritageModel'
import { GET_DB, CONNECT_DB } from '~/config/mongodb'

const updateHeritagesWithSlug = async () => {
    try {
        console.log('Connecting to database')
        await CONNECT_DB()
        console.log('Connected to database')
        const collection = GET_DB().collection(heritageModel.HERITAGE_COLLECTION_NAME)
        let heritages = collection.find({})
        heritages = await heritages.toArray()

        for await (const heritage of heritages) {
            // create slug for name ,location, tags
            const nameSlug = slugify(heritage.name || '', { lower: true, locale: 'vi', trim: true })
            const rawLocation = heritage.location || ''
            const cleanLocation = rawLocation.replace(/,/g, ', ') // thêm khoảng trắng sau dấu phẩy
            const locationSlug = slugify(cleanLocation, { lower: true, locale: 'vi', trim: true })
            const tagsSlug = (heritage.popularTags || []).map(tag =>
                slugify(tag || '', { lower: true, locale: 'vi', trim: true })
            )

            // update document
            await collection.updateOne(
                { _id: heritage._id },
                {
                    $set: {
                        nameSlug,
                        locationSlug,
                        tagsSlug
                    }
                }
            )
        }

        console.log('Update complete all heritages with slug!')
    } catch (error) {
        console.error('Error when update all heritages with slug', error)
    } finally {
        process.exit(0)
    }
}

updateHeritagesWithSlug()
