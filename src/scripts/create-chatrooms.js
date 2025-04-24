/**
 * Script tạo phòng chat cho tất cả di tích lịch sử đã có trong database
 * Chạy một lần duy nhất để tạo phòng chat cho các di tích đã được import trước đó
 * 
 * Cách chạy: node scripts/create-chatrooms.js
 */

import { GET_DB, CONNECT_DB } from '~/config/mongodb'
// import { env } from '~/config/environment'

// Import models
import { heritageModel } from '~/models/heritageModel'
import { chatRoomModel } from '~/models/ChatRoomModel'

async function createChatRoomsForHeritages() {
    try {
        console.log('Connecting to database')
        await CONNECT_DB()
        console.log('Connected to database')

        // Lấy tất cả di tích lịch sử
        const heritages = await heritageModel.findListHeritages({ filter: {}, sort: { createdAt: -1 }, skip: 0, limit: 1000 })
        console.log(`Tìm thấy ${heritages.totalCount} di tích lịch sử`)

        // Lấy danh sách phòng chat hiện có để kiểm tra trùng lặp
        const existingChatRooms = await chatRoomModel.findAll({ page: 1, limit: 1000, sort: { createdAt: -1 }, order: 'asc' })
        console.log(`Tìm thấy ${existingChatRooms.results.length} phòng chat`)
        const existingHeritageIds = existingChatRooms.results.map(room => room.heritageId.toString())

        console.log(`Đã có ${existingChatRooms.results.length} phòng chat di tích`)

        // Tạo phòng chat cho di tích chưa có
        let createdCount = 0
        let skippedCount = 0

        for (const heritage of heritages.results) {
            const heritageId = heritage._id.toString()
            // Kiểm tra xem di tích đã có phòng chat chưa
            if (existingHeritageIds.includes(heritageId)) {
                console.log(`Bỏ qua di tích ${heritage.name} (${heritageId}) - đã có phòng chat`)
                skippedCount++
                continue
            }

            // Tạo phòng chat mới cho di tích
            const newChatRoom = await chatRoomModel.createNew({
                name: 'Phòng chat ' + heritage.name,
                heritageId,
            })

            console.log(`Đã tạo phòng chat cho di tích: ${heritage.name} (${heritageId})`)
            createdCount++
        }

        // console.log('\n=== Kết quả ===')
        // console.log(`Tổng số di tích: ${heritages.length}`)
        // console.log(`Đã tạo mới: ${createdCount} phòng chat`)
        // console.log(`Đã bỏ qua: ${skippedCount} di tích (đã có phòng chat)`)

    } catch (error) {
        console.error('Lỗi:', error)
    } finally {
        // Đóng kết nối database
        await mongoose.connection.close()
        console.log('Đã đóng kết nối database')
    }
}

// Chạy hàm chính
createChatRoomsForHeritages()
    .then(() => console.log('Hoàn thành'))
    .catch(err => console.error('Lỗi:', err)) 