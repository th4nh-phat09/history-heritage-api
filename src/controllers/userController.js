import { userService } from '~/services/userService'
import { StatusCodes } from 'http-status-codes'

const getAll = async (req, res, next) => {
  try {
    const result = await userService.getAll()
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
    const newUser = await userService.signIn(req.body)
    res.status(StatusCodes.CREATED).json(newUser)
  } catch (error) {
    next(error)
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
  signIn
}
