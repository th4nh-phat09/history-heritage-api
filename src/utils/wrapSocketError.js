import { SocketError } from './SocketError'
import { SocketErrorCodes } from './constants'

export const wrapSocketError = (error, defaultCode = SocketErrorCodes.SERVER_ERROR, defaultMessage = 'Đã xảy ra lỗi') => {
    if (error instanceof SocketError) {
        return error
    }

    return new SocketError(
        defaultCode,
        error.message || defaultMessage,
        { originalError: error.stack || error.message }
    )
} 