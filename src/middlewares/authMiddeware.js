import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'

const isAuthorized = async (req, res, next) => {
  //lấy token từ cookie từ req mà client gửi lên
  const accessTokenFromCookie = req.cookies?.accessToken
  if (!accessTokenFromCookie) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'UNAUTHORIZED!' })
    return
  }
  try {
    //verify token từ cookie
    const verifyAccessTokenCookie = await JwtProvider.verifyToken(accessTokenFromCookie, env.ACCESS_TOKEN_SECRET_SIGNATURE)

    //gắn payload vào req để khi đi đến các tầng sau như Controller có thể sử dụng
    req.jwtDecoded = verifyAccessTokenCookie
    next()
  } catch (error) {
    if (error?.message?.includes('jwt expired')) {
      res.status(StatusCodes.GONE).json({ message: 'token expired!' })
      return
    }
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Please Login!' })
  }
}

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.jwtDecoded)
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' })

    if (!roles.includes(req.jwtDecoded.role))
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied' })

    req.user = req.jwtDecoded
    next()
  }
}

export const authMiddlewares = {
  isAuthorized,
  checkRole
}