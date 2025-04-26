import { chatRoomService } from '~/services/chatRoomService'
import { SocketError } from '~/utils/SocketError.js'
import { SocketErrorCodes } from '~/utils/constants.js'
import { chatRoomController } from '~/controllers/chatRoomController.js'
import { handleSocketError } from '~/utils/handleSocketError.js'
import { chatRoomModel } from '~/models/ChatRoomModel.js'

export function chatRoomSocket(io, socket) {
    // Tham gia phòng chat cộng đồng
    socket.on('join-room', async ({ heritageId, userData }) => {
        try {
            console.log('join-room', heritageId, userData)
            // Kiểm tra dữ liệu đầu vào
            if (!heritageId) {
                throw new SocketError(
                    SocketErrorCodes.VALIDATION_ERROR,
                    'Thiếu thông tin di tích',
                    { event: 'join-room' }
                )
            }

            if (!userData) {
                throw new SocketError(
                    SocketErrorCodes.VALIDATION_ERROR,
                    'Thiếu thông tin người dùng',
                    { event: 'join-room', heritageId }
                )
            }

            // Tìm phòng theo heritageId
            const room = await chatRoomModel.findByHeritageId(heritageId)
            if (!room) {
                throw new SocketError(
                    SocketErrorCodes.ROOM_NOT_FOUND,
                    'Phòng chat không tồn tại cho di tích này',
                    { event: 'join-room', heritageId }
                )
            }
            const roomId = room._id.toString()

            // Thêm người dùng vào phòng
            await chatRoomController.joinRoom(roomId, {
                socketId: socket.id,
                userId: userData.userId,
                username: userData.username,
            })

            // Thêm socket vào phòng
            socket.join(roomId)

            // Thông báo cho người vừa tham gia
            socket.emit('room-joined', {
                roomId,
                success: true,
                message: `Đã tham gia phòng chat ${roomId}`,
            })

            // Thông báo cho tất cả người trong phòng
            socket.to(roomId).emit('user-joined', {
                userId: userData.userId,
                username: userData.username,
                timestamp: new Date(),
            })

            // Gửi danh sách người dùng trong phòng
            const users = await chatRoomService.getRoomUsers(roomId)
            io.to(roomId).emit('room-users', { roomId, users })

        } catch (error) {
            handleSocketError(socket, error, 'join-room')
        }
    })

    // Tham gia phòng chat riêng tư (DM)
    socket.on('join-dm', async ({ userId1, userId2 }) => {
        try {
            console.log('join-dm', userId1, userId2)
            // Kiểm tra dữ liệu đầu vào
            if (!userId1 || !userId2) {
                throw new SocketError(
                    SocketErrorCodes.VALIDATION_ERROR,
                    'Thiếu thông tin người dùng',
                    { event: 'join-dm' }
                )
            }

            // Tìm hoặc tạo phòng DM
            const userIds = [userId1, userId2].sort() // Sắp xếp để đảm bảo tính duy nhất
            // console.log('userIds', userIds)
            let room = await chatRoomModel.findDirectRoom(userIds)
            // console.log('room-dm', room)
            if (!room) {
                // Tạo phòng DM mới
                const roomData = {
                    name: `DM_${userId1}_${userId2}`,
                    type: 'DIRECT',
                    participants: userIds,
                }
                room = await chatRoomService.createChatRoom(roomData)
            }
            const dmRoomId = room._id.toString()

            // Thêm người dùng vào phòng (userId1)
            await chatRoomController.joinRoom(dmRoomId, {
                socketId: socket.id,
                userId: userId1,
                username: socket.handshake.query.userName,
            })
            // console.log('du lieu join-dm-1', {
            //     socketId: socket.id,
            //     userId: userId1,
            //     username: socket.handshake.query.userName,
            // })

            // Thêm socket vào phòng DM
            socket.join(dmRoomId)

            // Thông báo cho người vừa tham gia
            socket.emit('join-dm', {
                dmRoomId,
                success: true,
                message: `Đã tham gia phòng chat riêng tư ${dmRoomId}`,
            })

        } catch (error) {
            handleSocketError(socket, error, 'join-dm')
        }
    })

    // Rời phòng chat cộng đồng
    socket.on('leave-room', async ({ heritageId, userId }) => {
        try {
            if (!heritageId) {
                throw new SocketError(
                    SocketErrorCodes.VALIDATION_ERROR,
                    'Thiếu thông tin di tích',
                    { event: 'leave-room' }
                )
            }

            if (!userId) {
                throw new SocketError(
                    SocketErrorCodes.VALIDATION_ERROR,
                    'Thiếu thông tin người dùng',
                    { event: 'leave-room', heritageId }
                )
            }
            const room = await chatRoomModel.findByHeritageId(heritageId)
            if (!room) {
                throw new SocketError(
                    SocketErrorCodes.ROOM_NOT_FOUND,
                    'Phòng chat không tồn tại',
                    { heritageId }
                )
            }
            const roomId = room._id.toString()

            console.log(`User ${socket.id} leaving room ${roomId}`)

            // Xử lý logic rời phòng
            await chatRoomController.leaveRoom(roomId, userId)

            // Rời phòng
            socket.leave(roomId)

            // Thông báo cho mọi người trong phòng
            socket.to(roomId).emit('user-left', {
                userId: socket.handshake.query.userId,
                username: socket.handshake.query.userName,
                timestamp: new Date(),
            })

            // Gửi danh sách người dùng mới trong phòng
            const users = await chatRoomService.getRoomUsers(roomId)
            io.to(roomId).emit('room-users', { roomId, users })

        } catch (error) {
            handleSocketError(socket, error, 'leave-room')
        }
    })

    // Gửi tin nhắn trong phòng cộng đồng
    socket.on('new-message', async ({ roomId, message }) => {
        try {
            if (!roomId) {
                throw new SocketError(
                    SocketErrorCodes.VALIDATION_ERROR,
                    'Thiếu thông tin phòng chat',
                    { event: 'new-message' }
                )
            }

            if (!message || !message.content || message.content.trim() === '') {
                throw new SocketError(
                    SocketErrorCodes.VALIDATION_ERROR,
                    'Tin nhắn không được để trống',
                    { event: 'new-message', roomId }
                )
            }

            if (!message.userId) {
                throw new SocketError(
                    SocketErrorCodes.VALIDATION_ERROR,
                    'Thiếu thông tin người dùng',
                    { event: 'new-message', roomId }
                )
            }
            console.log(`User ${socket.id} sending message to room ${roomId}: ${message.content}`)

            // Xử lý gửi tin nhắn qua service
            const newMessage = await chatRoomService.saveMessage({
                roomId,
                userId: message.userId,
                content: message.content,
                type: message.type || 'TEXT',
            })

            // Gửi tin nhắn mới cho tất cả người trong phòng
            io.to(roomId).emit('new-message', newMessage)

        } catch (error) {
            handleSocketError(socket, error, 'new-message')
        }
    })

    //Gửi tin nhắn trong phòng DM
    socket.on('send-dm', async ({ dmRoomId, userId, message }) => {
        console.log('send-dm', dmRoomId, userId, message)
        try {
            if (!dmRoomId) {
                throw new SocketError(
                    SocketErrorCodes.VALIDATION_ERROR,
                    'Thiếu thông tin phòng chat riêng tư',
                    { event: 'send-dm' }
                )
            }

            if (!message || !message.content || message.content.trim() === '') {
                throw new SocketError(
                    SocketErrorCodes.VALIDATION_ERROR,
                    'Tin nhắn không được để trống',
                    { event: 'send-dm', dmRoomId }
                )
            }

            if (!userId) {
                throw new SocketError(
                    SocketErrorCodes.VALIDATION_ERROR,
                    'Thiếu thông tin người dùng',
                    { event: 'send-dm', dmRoomId }
                )
            }
            console.log(`User ${socket.id} sending DM to room ${dmRoomId}: ${message.content}`)

            // Xử lý gửi tin nhắn qua service
            const newMessage = await chatRoomService.saveMessage({
                roomId: dmRoomId,
                userId,
                content: message.content,
                type: message.type || 'TEXT',
            })

            // Gửi tin nhắn mới cho tất cả người trong phòng DM
            io.to(dmRoomId).emit('new-dm', newMessage)

        } catch (error) {
            handleSocketError(socket, error, 'send-dm')
        }
    })

    // Lấy danh sách tin nhắn của phòng cộng đồng
    socket.on('get-messages', async ({ roomId, limit = 50 }) => {
        try {
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
                messages,
            })

        } catch (error) {
            handleSocketError(socket, error, 'get-messages')
        }
    })

    // // Lấy danh sách tin nhắn của phòng DM
    socket.on('get-dm-messages', async ({ dmRoomId, limit = 50 }) => {
        try {
            console.log(`User ${socket.id} requesting DM messages for room ${dmRoomId}`)
            if (!dmRoomId) {
                throw new SocketError(
                    SocketErrorCodes.VALIDATION_ERROR,
                    'Thiếu thông tin phòng chat riêng tư',
                    { event: 'get-dm-messages' }
                )
            }


            // Lấy tin nhắn từ service
            const messages = await chatRoomService.getRoomMessages(dmRoomId, limit)

            // Gửi tin nhắn cho người dùng yêu cầu
            socket.emit('dm-messages', {
                dmRoomId,
                messages,
            })

        } catch (error) {
            handleSocketError(socket, error, 'get-dm-messages')
        }
    })

    // Trạng thái đang gõ (dùng chung cho cả chatroom và DM)
    socket.on('typing', ({ roomId, isTyping }) => {
        try {
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
                userId: socket.handshake.query.userId,
                username: socket.handshake.query.userName,
                isTyping,
            })
        } catch (error) {
            handleSocketError(socket, error, 'typing')
        }
    })

    // Xử lý sự kiện disconnect
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`)
    })
}