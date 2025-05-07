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
    const newAccessToken = await userService.refreshToken(req.cookies['refreshToken'])
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

const getUserProfile = async (req, res, next) => {
  try {
    const result = await userService.getUserById(req.userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateUser = async (req, res, next) => {
  try {
    const result = await userService.updateUser(req.userId, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateUserByUserId = async (req, res, next) => {
  try {
    const result = await userService.updateUserByUserId(req.params.id, req.body)
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

const forgotPassword = async (req, res, next) => {
  try {
    const result = await userService.forgotPassword(req.body.email)
    res.status(StatusCodes.OK).json(result)
      } catch (error) {
    next(error)
  }
}

const getUsersByCreationDate = async (req, res, next) => {
  try {
    const { date } = req.params // Lấy ngày từ parameters (ví dụ: /users/report/date/07-05-2025)
    const report = await userService.getUsersByCreationDate(date)
    res.status(StatusCodes.OK).json(report)
  } catch (error) {
    next(error)
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body
    const result = await userService.resetPassword(email, code, newPassword)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  getAll,
  createNew,
  getUserById,
  getUserProfile,
  updateUser,
  updateUserByUserId,
  deleteAccount,
  signIn,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getUsersByCreationDate
}
