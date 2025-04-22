import { chatRoomSocket } from './chatRoomSocket.js'

/**
 * Đăng ký tất cả các socket cho ứng dụng
 * @param {object} io - Socket.io server instance
 */
export function registerSockets(io) {
    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id)

        // Đăng ký sự kiện chat room
        chatRoomSocket(io, socket)

        //chatSocket(io, socket)
        //notifySocket(io, socket)

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id)
        })
    })
}
