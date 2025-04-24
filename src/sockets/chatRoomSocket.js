import { chatRoomService } from '~/services/chatRoomService'
import { SocketError } from '~/utils/SocketError.js'
import { SocketErrorCodes } from '~/utils/constants.js'
import { chatRoomController } from '~/controllers/chatRoomController.js'
import { handleSocketError } from '~/utils/handleSocketError.js'
/**
 * Xử lý các sự kiện socket cho chat room
 */
export function chatRoomSocket(io, socket) {
    // Tham gia phòng chat
    socket.on('join-room', async ({ roomId, userData }) => {
        try {
            console.log('join-room', roomId, userData)
            // Kiểm tra dữ liệu đầu vào
            if (!roomId) {
                throw new SocketError(
                    SocketErrorCodes.VALIDATION_ERROR,
                    'Thiếu thông tin phòng chat',
                    { event: 'join-room' }
                )
            }

            if (!userData) {
                throw new SocketError(
                    SocketErrorCodes.VALIDATION_ERROR,
                    'Thiếu thông tin người dùng',
                    { event: 'join-room', roomId }
                )
            }
            // console.log(`User ${userData.username} trying to join room ${roomId}`)
            await chatRoomController.joinRoom(roomId, {
                socketId: socket.id,
                userId: userData.userId,
                username: userData.username
            })

            // Thêm socket vào phòng
            socket.join(roomId)

            // Thông báo cho người vừa tham gia
            socket.emit('room-joined', {
                roomId,
                success: true,
                message: `Đã tham gia phòng chat ${roomId}`
            })

            // Thông báo cho tất cả người trong phòng
            socket.to(roomId).emit('user-joined', {
                userId: userData.userId,
                username: userData.username,
                timestamp: new Date()
            })

            // Gửi danh sách người dùng trong phòng
            const users = await chatRoomService.getRoomUsers(roomId)
            io.to(roomId).emit('room-users', { roomId, users })

        } catch (error) {
            // Sử dụng hàm xử lý lỗi tập trung
            handleSocketError(socket, error, 'join-room')
        }
    })

    // Rời phòng chat
    socket.on('leave-room', async ({ roomId }) => {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!roomId) {
                throw new SocketError(
                    SocketErrorCodes.VALIDATION_ERROR,
                    'Thiếu thông tin phòng chat',
                    { event: 'leave-room' }
                )
            }

            console.log(`User ${socket.id} leaving room ${roomId}`)

            // Xử lý logic leave phòng
            await chatRoomService.leaveRoom(roomId, socket.id)

            // Rời phòng
            socket.leave(roomId)

            // Thông báo cho mọi người trong phòng
            io.to(roomId).emit('user-left', {
                userId: userData.userId,
                username: userData.username,
                timestamp: new Date()
            })

            // Gửi danh sách người dùng mới trong phòng
            const users = await chatRoomService.getRoomUsers(roomId)
            io.to(roomId).emit('room-users', { roomId, users })

        } catch (error) {
            // Sử dụng hàm xử lý lỗi tập trung
            handleSocketError(socket, error, 'leave-room')
        }
    })

    // Gửi tin nhắn
    socket.on('send-message', async ({ roomId, message }) => {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!roomId) {
                throw new SocketError(
                    SocketErrorCodes.VALIDATION_ERROR,
                    'Thiếu thông tin phòng chat',
                    { event: 'send-message' }
                )
            }

            if (!message || message.trim() === '') {
                throw new SocketError(
                    SocketErrorCodes.VALIDATION_ERROR,
                    'Tin nhắn không được để trống',
                    { event: 'send-message', roomId }
                )
            }

            console.log(`User ${socket.id} sending message to room ${roomId}: ${message}`)

            // Xử lý gửi tin nhắn qua service
            const newMessage = await chatRoomService.saveMessage({
                roomId,
                userId: socket.id, // Trong thực tế nên lấy userId thực từ authentication
                content: message,
                type: 'TEXT'
            })

            // Gửi tin nhắn mới cho tất cả người trong phòng
            io.to(roomId).emit('new-message', newMessage)

        } catch (error) {
            // Sử dụng hàm xử lý lỗi tập trung
            handleSocketError(socket, error, 'send-message')
        }
    })

    // Lấy danh sách tin nhắn của phòng
    socket.on('get-messages', async ({ roomId, limit = 50 }) => {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!roomId) {
                throw new SocketError(
                    SocketErrorCodes.VALIDATION_ERROR,
                    'Thiếu thông tin phòng chat',
                    { event: 'get-messages' }
                )
            }

            console.log(`User ${socket.id} requesting messages for room ${roomId}`)

            // Lấy tin nhắn từ service
            const messages = await chatRoomService.getRoomMessages(roomId, limit)

            // Gửi tin nhắn cho người dùng yêu cầu
            socket.emit('room-messages', {
                roomId,
                messages
            })

        } catch (error) {
            // Sử dụng hàm xử lý lỗi tập trung
            handleSocketError(socket, error, 'get-messages')
        }
    })

    // Trạng thái đang gõ
    socket.on('typing', ({ roomId, isTyping }) => {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (!roomId) {
                throw new SocketError(
                    SocketErrorCodes.VALIDATION_ERROR,
                    'Thiếu thông tin phòng chat',
                    { event: 'typing' }
                )
            }

            console.log(`User ${socket.id} ${isTyping ? 'is' : 'stopped'} typing in room ${roomId}`)

            // Gửi thông báo đến mọi người khác trong phòng
            socket.to(roomId).emit('user-typing', {
                userId: socket.id,
                isTyping
            })
        } catch (error) {
            // Sử dụng hàm xử lý lỗi tập trung
            handleSocketError(socket, error, 'typing')
        }
    })

    // Xử lý sự kiện disconnect
    socket.on('disconnect', () => {
        // Ghi log khi client ngắt kết nối
        console.log(`Socket disconnected: ${socket.id}`)

        // Trong trường hợp thực tế, cần cập nhật trạng thái người dùng về offline
        // và thông báo cho các phòng chat mà người dùng đang tham gia
    })
}

