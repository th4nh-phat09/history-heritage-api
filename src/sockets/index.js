import { chatRoomSocket } from '~/sockets/chatRoomSocket.js'

export const registerSockets = (io) => {
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
