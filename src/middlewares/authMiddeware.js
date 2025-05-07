import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'
import { HEADER } from '~/constants/header.constants'
import jwt from 'jsonwebtoken'

const authentication = (async (req, res, next) => {
  const userId = req?.headers[HEADER.CLIENT_ID]
  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Not found userId')
  }

  const bearerAccessToken = req?.headers[HEADER.AUTHORIZATION]
  const accessToken = bearerAccessToken?.split(' ')[1]

  if (!accessToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid access token')
  }

  try {
    // Synchronously verify access token
    const decodedUser = await JwtProvider.verifyToken(accessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
    if (userId?.toString() !== decodedUser?.id?.toString()) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Token does not match')
    }
    req.userId = decodedUser?.id
    req.userRole = decodedUser?.role

    return next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError(StatusCodes.UNAUTHORIZED, 'Token expired'))
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token'))
    }
    next(error)
  }
})

const authorization = (async (req, res, next) => {
  try {
    if (req?.userRole === 'admin') {
      return next()
    } else {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied')
    }
  } catch (error) {
    next(error)
  }
})

export const authMiddlewares = {
  authentication,
  authorization
}