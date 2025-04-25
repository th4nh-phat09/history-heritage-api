import { userService } from '~/services/userService'
import { StatusCodes } from 'http-status-codes'
import ms from 'ms'

const getAll = async (req, res, next) => {
  try {
    const result = await userService.getAll(req.query)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const createNew = async (req, res, next) => {
  try {
    const newUser = await userService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(newUser)
  } catch (error) {
    next(error)
  }
}

const signIn = async (req, res, next) => {
  try {
    const newUser = await userService.signIn(req.body, res)
    res.status(StatusCodes.OK).json(newUser)
  } catch (error) {
    next(error)
  }
}

const logout = async (req, res) => {
  try {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.status(StatusCodes.OK).json({ message: 'Logout API success!' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const refreshToken = async (req, res) => {
  try {
    const newAccessToken = await userService.refreshToken(req.body?.refreshToken)
    //set lại cookie cho client
    res.cookie(
      'accessToken',
      newAccessToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: ms('14 days')
      }
    )
    res.status(StatusCodes.OK).json({
      message: ' Access Token genarated again',
      accessToken: newAccessToken
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Please Login again' })
  }
}

const getUserById = async (req, res, next) => {
  try {
    const result = await userService.getUserById(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateUser = async (req, res, next) => {
  try {
    const result = await userService.updateUser(req.params.id, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteAccount = async (req, res, next) => {
  try {
    const result = await userService.deleteAccount(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}


export const userController = {
  getAll,
  createNew,
  getUserById,
  updateUser,
  deleteAccount,
  signIn,
  refreshToken,
  logout
}
