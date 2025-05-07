import { chatRoomModel } from '~/models/ChatRoomModel.js'
import { chatRoomParticipantModel } from '~/models/ChatRoomParticipantModel.js'
import { messageModel } from '~/models/MessageModel.js'
import { SocketError } from '~/utils/SocketError.js'
import { SocketErrorCodes } from '~/utils/constants.js'
import { wrapSocketError } from '~/utils/wrapSocketError.js'

// Lấy thông tin phòng chat theo ID
const getRoomById = async (roomId) => {
  try {
    const room = await chatRoomModel.findOneById(roomId)
    if (!room) {
      throw new SocketError(
        SocketErrorCodes.ROOM_NOT_FOUND,
        'Phòng chat không tồn tại',
        { roomId }
      )
    }
    return room
  } catch (error) {
    // Bọc lỗi thông thường thành SocketError nếu không phải là SocketError
    throw wrapSocketError(error, SocketErrorCodes.DATABASE_ERROR, 'Lỗi khi truy vấn phòng chat')
  }
}

// Tạo phòng chat mới
const createChatRoom = async (roomData) => {
  try {
    // Kiểm tra dữ liệu đầu vào
    if (!roomData || !roomData.name) {
      throw new SocketError(
        SocketErrorCodes.VALIDATION_ERROR,
        'Tên phòng chat không được để trống',
        { roomData }
      )
    }

    // Tạo phòng chat mới
    const result = await chatRoomModel.createNew(roomData)
    if (!result.insertedId) {
      throw new SocketError(
        SocketErrorCodes.DATABASE_ERROR,
        'Không thể tạo phòng chat mới',
        { roomData }
      )
    }

    return await chatRoomModel.findOneById(result.insertedId)
  } catch (error) {
    throw wrapSocketError(error, SocketErrorCodes.SERVER_ERROR, 'Lỗi khi tạo phòng chat')
  }
}

// Tham gia phòng chat
const joinRoom = async (roomId, userData) => {
  try {
    // Kiểm tra dữ liệu
    if (!userData || !userData.socketId)
      throw new SocketError(SocketErrorCodes.VALIDATION_ERROR, 'Thiếu thông tin người dùng', { userData })

    // Kiểm tra phòng tồn tại
    let room = await chatRoomModel.findOneById(roomId)
    if (!room)
      throw new SocketError(SocketErrorCodes.ROOM_NOT_FOUND, 'Phòng chat không tồn tại', { roomId })

    // Tìm người dùng đã tồn tại trong phòng chưa
    const existingParticipant = await chatRoomParticipantModel.findByRoomAndUser(
      room._id.toString(),
      userData.userId || userData.socketId
    )

    if (existingParticipant) {
      // Người dùng đã tồn tại, cập nhật trạng thái
      const result = await chatRoomParticipantModel.update(
        existingParticipant._id,
        {
          //socketId: userData.socketId,
          status: 'ONLINE',
          lastActive: Date.now()
        }
      )
      return result
    } else {
      // Tạo mới nếu chưa tồn tại
      const participantData = {
        chatRoomId: room._id.toString(),
        userId: userData.userId,
        // socketId: userData.socketId,
        username: userData.username,
        status: 'ONLINE'
      }

      const result = await chatRoomParticipantModel.createNew(participantData)
      if (!result.insertedId)
        throw new SocketError(SocketErrorCodes.DATABASE_ERROR, 'Không thể thêm người dùng vào phòng', { participantData })

      // Cập nhật danh sách người tham gia trong phòng
      await chatRoomModel.addParticipant(room._id.toString(), participantData.userId)

      return await chatRoomParticipantModel.findOneById(result.insertedId)
    }
  } catch (error) {
    throw wrapSocketError(error, SocketErrorCodes.SERVER_ERROR, 'Lỗi khi tham gia phòng chat')
  }
}

// Rời phòng chat
const leaveRoom = async (roomId, userId) => {
  try {
    // Kiểm tra dữ liệu
    if (!userId) {
      throw new SocketError(
        SocketErrorCodes.VALIDATION_ERROR,
        'Thiếu thông tin kết nối',
        { socketId }
      )
    }

    // Kiểm tra phòng tồn tại
    const room = await chatRoomModel.findOneById(roomId)
    if (!room) {
      throw new SocketError(
        SocketErrorCodes.ROOM_NOT_FOUND,
        'Phòng chat không tồn tại',
        { roomId }
      )
    }

    // Tìm người tham gia
    const participant = await chatRoomParticipantModel.findByUserIdAndRoomId(userId, roomId)

    if (!participant) {
      throw new SocketError(
        SocketErrorCodes.NOT_IN_ROOM,
        'Người dùng không có trong phòng',
        { userId, roomId }
      )
    }

    // Cập nhật trạng thái
    await chatRoomParticipantModel.updateStatusByUserIdAndRoomId(userId, roomId, 'OFFLINE')

    return { success: true, message: 'Đã rời phòng chat' }
  } catch (error) {
    throw wrapSocketError(error, SocketErrorCodes.SERVER_ERROR, 'Lỗi khi rời phòng chat')
  }
}

// Gửi tin nhắn mới
const saveMessage = async (messageData) => {
  try {
    // Kiểm tra dữ liệu đầu vào
    if (!messageData.roomId) {
      throw new SocketError(
        SocketErrorCodes.VALIDATION_ERROR,
        'Thiếu thông tin phòng chat',
        { messageData }
      )
    }

    if (!messageData.userId) {
      throw new SocketError(
        SocketErrorCodes.VALIDATION_ERROR,
        'Thiếu thông tin người gửi',
        { messageData }
      )
    }

    if (!messageData.content || messageData.content.trim() === '') {
      throw new SocketError(
        SocketErrorCodes.VALIDATION_ERROR,
        'Nội dung tin nhắn không được để trống',
        { messageData }
      )
    }

    // Kiểm tra phòng tồn tại
    const room = await chatRoomModel.findOneById(messageData.roomId)
    if (!room) {
      throw new SocketError(
        SocketErrorCodes.ROOM_NOT_FOUND,
        'Phòng chat không tồn tại',
        { roomId: messageData.roomId }
      )
    }

    // Lấy thông tin người gửi
    const sender = await chatRoomParticipantModel.findByRoomAndUser(messageData.roomId, messageData.userId)

    // Kiểm tra người dùng đã tham gia phòng chưa
    if (!sender) {
      throw new SocketError(
        SocketErrorCodes.NOT_IN_ROOM,
        'Bạn chưa tham gia phòng chat này',
        { userId: messageData.userId, roomId: messageData.roomId }
      )
    }

    // Tạo tin nhắn mới
    const msgData = {
      chatRoomId: messageData.roomId,
      userId: messageData.userId,
      content: messageData.content,
      type: messageData.type || 'TEXT',
      status: 'SENT'
    }

    const result = await messageModel.createNew(msgData)
    if (!result.insertedId) {
      throw new SocketError(
        SocketErrorCodes.DATABASE_ERROR,
        'Không thể lưu tin nhắn',
        { msgData }
      )
    }

    const newMessage = await messageModel.findOneById(result.insertedId)

    // Cập nhật tin nhắn cuối cùng trong phòng
    await chatRoomModel.updateLastMessage(messageData.roomId, {
      content: messageData.content,
      userId: messageData.userId,
      username: sender ? sender.username : 'Khách'
    })

    return newMessage
  } catch (error) {
    throw wrapSocketError(error, SocketErrorCodes.SERVER_ERROR, 'Lỗi khi gửi tin nhắn')
  }
}

// Lấy danh sách tin nhắn theo phòng
const getRoomMessages = async (roomId, limit = 50) => {
  try {
    // Kiểm tra phòng tồn tại
    const room = await chatRoomModel.findOneById(roomId)
    if (!room) {
      throw new SocketError(
        SocketErrorCodes.ROOM_NOT_FOUND,
        'Phòng chat không tồn tại',
        { roomId }
      )
    }

    // Lấy tin nhắn
    return await messageModel.findByChatRoomId(roomId, limit)
  } catch (error) {
    throw wrapSocketError(error, SocketErrorCodes.SERVER_ERROR, 'Lỗi khi lấy tin nhắn')
  }
}

// Lấy danh sách người dùng trong phòng
const getRoomUsers = async (roomId) => {
  try {
    // Kiểm tra phòng tồn tại
    const room = await chatRoomModel.findOneById(roomId)
    if (!room) {
      throw new SocketError(
        SocketErrorCodes.ROOM_NOT_FOUND,
        'Phòng chat không tồn tại',
        { roomId }
      )
    }

    // Lấy danh sách người dùng
    return await chatRoomParticipantModel.findOnlineByRoomId(roomId)
  } catch (error) {
    throw wrapSocketError(error, SocketErrorCodes.SERVER_ERROR, 'Lỗi khi lấy danh sách người dùng')
  }
}

// Xuất các phương thức
export const chatRoomService = {
  getRoomById,
  createChatRoom,
  joinRoom,
  leaveRoom,
  saveMessage,
  getRoomMessages,
  getRoomUsers
} 