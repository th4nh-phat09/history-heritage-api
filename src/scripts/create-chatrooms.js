/**
 * Script tạo phòng chat cho tất cả di tích lịch sử đã có trong database
 * Chạy một lần duy nhất để tạo phòng chat cho các di tích đã được import trước đó
 * 
 * Cách chạy: node scripts/create-chatrooms.js
 */

const mongoose = require('mongoose');
const config = require('../src/config');

// Import models
const Heritage = require('../src/models/Heritage');
const ChatRoom = require('../src/models/ChatRoom');

async function createChatRoomsForHeritages() {
    try {
        // Kết nối database
        await mongoose.connect(config.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Kết nối MongoDB thành công');

        // Lấy tất cả di tích lịch sử
        const heritages = await Heritage.find({ isDeleted: false });
        console.log(`Tìm thấy ${heritages.length} di tích lịch sử`);

        // Lấy danh sách phòng chat hiện có để kiểm tra trùng lặp
        const existingChatRooms = await ChatRoom.find({ type: 'heritage' });
        const existingHeritageIds = existingChatRooms.map(room => room.heritageId.toString());

        console.log(`Đã có ${existingChatRooms.length} phòng chat di tích`);

        // Tạo phòng chat cho di tích chưa có
        let createdCount = 0;
        let skippedCount = 0;

        for (const heritage of heritages) {
            const heritageId = heritage._id.toString();

            // Kiểm tra xem di tích đã có phòng chat chưa
            if (existingHeritageIds.includes(heritageId)) {
                console.log(`Bỏ qua di tích ${heritage.name} (${heritageId}) - đã có phòng chat`);
                skippedCount++;
                continue;
            }

            // Tạo phòng chat mới cho di tích
            const newChatRoom = new ChatRoom({
                name: `Thảo luận: ${heritage.name}`,
                description: `Phòng thảo luận về di tích ${heritage.name}`,
                type: 'heritage',
                heritageId: heritage._id,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await newChatRoom.save();
            console.log(`Đã tạo phòng chat cho di tích: ${heritage.name} (${heritageId})`);
            createdCount++;
        }

        console.log('\n=== Kết quả ===');
        console.log(`Tổng số di tích: ${heritages.length}`);
        console.log(`Đã tạo mới: ${createdCount} phòng chat`);
        console.log(`Đã bỏ qua: ${skippedCount} di tích (đã có phòng chat)`);

    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        // Đóng kết nối database
        await mongoose.connection.close();
        console.log('Đã đóng kết nối database');
    }
}

// Chạy hàm chính
createChatRoomsForHeritages()
    .then(() => console.log('Hoàn thành'))
    .catch(err => console.error('Lỗi:', err)); 