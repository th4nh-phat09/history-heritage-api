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

export const userController = {
  getAll,
  createNew
}
