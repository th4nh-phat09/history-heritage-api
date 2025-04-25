import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'
import { HEADER } from '~/constants/header.constants'
import jwt from 'jsonwebtoken'

const authentication = (async (req, res, next) => {
  const userId = req.headers[HEADER.CLIENT_ID]

  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Not found userId')
  }

  const bearerAccessToken = req.headers[HEADER.AUTHORIZATION]
  const accessToken = bearerAccessToken?.split(' ')[1]

  if (!accessToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid access token')
  }

  try {
    // Synchronously verify access token
    const decodedUser = JwtProvider.verifyToken(accessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
    console.log(decodedUser);

    if (userId !== decodedUser.id) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Token does not match')
    }
    if (!decodedUser.isAdmin) {
      if (req.query?.userId && req.query.userId !== userId) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Not authenticated')
      }
      if (req.params?.userId && req.params.userId !== userId) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Not authenticated')
      }
    }

    req.user = decodedUser

    return next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Token expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token')
    }
    throw error
  }
})

const authorization = (async (req, res, next) => {
  try {
    const bearerAccessToken = req.headers[HEADER.AUTHORIZATION]
    const accessToken = bearerAccessToken?.split(' ')[1]

    const decodedUser = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)

    if (decodedUser.role === 'admin') {
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