import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment'

let historyHeritageDatabaseInstance = null

const mongoDBClient = new MongoClient(env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
}
)

export const CONNECT_DB = async () => {
    await mongoDBClient.connect()
    historyHeritageDatabaseInstance = mongoDBClient.db(env.DATABASE_NAME)
}

export const CLOSE_DB = async () => {
    await mongoDBClient.close()
}

export const GET_DB = () => {
    if (!historyHeritageDatabaseInstance)
        throw new Error('Database not connected')
    return historyHeritageDatabaseInstance
}
