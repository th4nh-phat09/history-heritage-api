import { chatRoomService } from '~/services/chatRoomService.js'

// Tham gia phòng chat (dùng chung cho chatroom và DM)
const joinRoom = async (roomId, userData) => {
    try {
        const result = await chatRoomService.joinRoom(roomId, userData)
        return result
    } catch (error) {
        throw error
    }
}

// Rời phòng chat (dùng chung cho chatroom và DM)
const leaveRoom = async (roomId, userId) => {
    try {
        const result = await chatRoomService.leaveRoom(roomId, userId)
        return result
    } catch (error) {
        console.error('Controller - Error leaving room:', error)
        throw error
    }
}

// Lưu tin nhắn mới (dùng chung cho chatroom và DM)
const saveMessage = async (messageData) => {
    try {
        const message = await chatRoomService.saveMessage(messageData)
        return message
    } catch (error) {
        console.error('Controller - Error saving message:', error)
        throw error
    }
}

// Lấy danh sách tin nhắn của phòng (dùng chung cho chatroom và DM)
const getRoomMessages = async (roomId, limit = 50) => {
    try {
        const messages = await chatRoomService.getRoomMessages(roomId, limit)
        return messages
    } catch (error) {
        console.error('Controller - Error getting room messages:', error)
        throw error
    }
}

// Lấy danh sách người dùng trong phòng (chỉ dùng cho chatroom)
const getRoomUsers = async (roomId) => {
    try {
        const users = await chatRoomService.getRoomUsers(roomId)
        return users
    } catch (error) {
        console.error('Controller - Error getting room users:', error)
        throw error
    }
}

export const chatRoomController = {
    joinRoom,
    leaveRoom,
    saveMessage,
    getRoomMessages,
    getRoomUsers,
}