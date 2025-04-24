import { chatRoomService } from '~/services/chatRoomService.js'

//Tham gia phòng chat

const joinRoom = async (roomId, userData) => {
    try {
        // Kiểm tra phòng tồn tại không
        const result = await chatRoomService.joinRoom(roomId, userData)
        return result
    } catch (error) { throw error }
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

export const chatRoomController = {
    joinRoom,
    leaveRoom,
    saveMessage,
    getRoomMessages,
    getRoomUsers
}