import chatRoomService from '~/services/chatRoomService.js'

//Tham gia phòng chat

const joinRoom = async (roomId, userData) => {
    try {
        // Kiểm tra phòng tồn tại không
        let room = await chatRoomService.getChatRoomById(roomId)

        // Nếu phòng không tồn tại, tạo mới
        if (!room) {
            room = await chatRoomService.createChatRoom({
                name: `Phòng chat ${roomId}`,
                heritageId: roomId, // Trong thực tế, cần xác thực heritageId hợp lệ
                type: 'HERITAGE',
                status: 'ACTIVE'
            })
        }

        // Thêm người dùng vào phòng
        const result = await chatRoomService.addUserToRoom(room.id, userData)

        return result
    } catch (error) {
        console.error('Controller - Error joining room:', error)
        throw error
    }
}

//Rời phòng chat

const leaveRoom = async (roomId, socketId) => {
    try {
        const result = await chatRoomService.removeUserFromRoom(roomId, socketId)
        return result
    } catch (error) {
        console.error('Controller - Error leaving room:', error)
        throw error
    }
}

//Lưu tin nhắn mới

const saveMessage = async (messageData) => {
    try {
        const message = await chatRoomService.createMessage(messageData)
        return message
    } catch (error) {
        console.error('Controller - Error saving message:', error)
        throw error
    }
}

//Lấy danh sách tin nhắn của phòng

const getRoomMessages = async (roomId, limit = 50) => {
    try {
        const messages = await chatRoomService.getMessagesByRoomId(roomId, limit)
        return messages
    } catch (error) {
        console.error('Controller - Error getting room messages:', error)
        throw error
    }
}

//Lấy danh sách người dùng trong phòng

const getRoomUsers = async (roomId) => {
    try {
        const users = await chatRoomService.getUsersByRoomId(roomId)
        return users
    } catch (error) {
        console.error('Controller - Error getting room users:', error)
        throw error
    }
}

export default {
    joinRoom,
    leaveRoom,
    saveMessage,
    getRoomMessages,
    getRoomUsers
}