import { env } from '~/config/environment'

export const WHITELIST_DOMAINS = [
  'http://localhost',
  'http://localhost:80',
  'http://localhost:443',
  'http://localhost:4200', // nếu dev dùng Vite/React
  'http://localhost:4173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://heritage_frontend',
  'https://heritage_frontend',
  'https://heritage.thuandev.id.vn',
  'https://heritage.thuandev.id.vn/'
  ]
export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT
/**
 * Các mã lỗi tiêu chuẩn cho Socket.IO
 * Tương tự như HTTP status code nhưng được điều chỉnh cho Socket.IO
 */
export const SocketErrorCodes = {
    // Lỗi xác thực & phân quyền
    UNAUTHORIZED: 'UNAUTHORIZED', // Người dùng chưa đăng nhập hoặc phiên đã hết hạn
    FORBIDDEN: 'FORBIDDEN', // Người dùng không có quyền thực hiện hành động

    // Lỗi dữ liệu
    VALIDATION_ERROR: 'VALIDATION_ERROR', // Dữ liệu không hợp lệ
    BAD_REQUEST: 'BAD_REQUEST', // Yêu cầu không hợp lệ

    // Lỗi tài nguyên
    ROOM_NOT_FOUND: 'ROOM_NOT_FOUND', // Không tìm thấy phòng chat
    USER_NOT_FOUND: 'USER_NOT_FOUND', // Không tìm thấy người dùng
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND', // Không tìm thấy tài nguyên

    // Lỗi nghiệp vụ
    ROOM_FULL: 'ROOM_FULL', // Phòng chat đã đầy
    ALREADY_IN_ROOM: 'ALREADY_IN_ROOM', // Đã tham gia phòng chat
    NOT_IN_ROOM: 'NOT_IN_ROOM', // Chưa tham gia phòng chat

    // Lỗi server
    SERVER_ERROR: 'SERVER_ERROR', // Lỗi không xác định từ server
    DATABASE_ERROR: 'DATABASE_ERROR', // Lỗi từ cơ sở dữ liệu
    TIMEOUT: 'TIMEOUT', // Thời gian xử lý quá lâu

    // Lỗi kết nối
    CONNECTION_ERROR: 'CONNECTION_ERROR', // Lỗi kết nối
    SOCKET_DISCONNECTED: 'SOCKET_DISCONNECTED' // Mất kết nối socket
}