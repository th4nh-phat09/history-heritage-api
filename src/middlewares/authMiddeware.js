// import { StatusCodes } from 'http-status-codes';
// import jwt from 'jsonwebtoken';
// import { env } from '~/configs/environment';
// import ApiError from '~/utils/ApiError';

// export const authenticateToken = async (req, res, next) => {
//   try {
//     // Lấy token từ header
//     const authHeader = req.headers.authorization;
//     const token = authHeader && authHeader.split(' ')[1];
    
//     if (!token) {
//       throw new ApiError(StatusCodes.UNAUTHORIZED, 'Không tìm thấy token xác thực');
//     }
    
//     // Xác thực token
//     jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
//       if (err) {
//         throw new ApiError(StatusCodes.UNAUTHORIZED, 'Token không hợp lệ hoặc đã hết hạn');
//       }
      
//       // Lưu thông tin user vào request
//       req.user = decoded;
//       next();
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const requireAdmin = (req, res, next) => {
//   try {
//     if (!req.user || req.user.role !== 'ADMIN') {
//       throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền thực hiện hành động này');
//     }
//     next();
//   } catch (error) {
//     next(error);
//   }
// };