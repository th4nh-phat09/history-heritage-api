import { SocketError } from './SocketError'
import { SocketErrorCodes } from './constants'
export const handleSocketError = (socket, error, context) => {
    console.error(`Socket Error [${context}]:`, error)

    // Nếu đã là SocketError, gửi thông tin lỗi đã được định dạng
    if (error instanceof SocketError) {
        socket.emit('error', {
            code: error.code,
            message: error.message,
            context: error.context || context,
            timestamp: error.timestamp
        })
    }
    // Nếu là lỗi thông thường, chuyển thành dạng SocketError
    else {
        socket.emit('error', {
            code: SocketErrorCodes.SERVER_ERROR,
            message: error.message || 'Đã xảy ra lỗi không mong đợi',
            context: context,
            timestamp: new Date()
        })
    }
}