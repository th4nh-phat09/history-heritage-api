import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { mailService } from './mailService'

const getAll = async () => {
  try {
    const result = await userModel.getAll()
    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'List user is empty')
    }
    return result
  } catch (error) {
    throw error
  }
}
const createNew = async (reqBody) => {
  try {
    // check email có tồn tại hay không
    const checkEmail = await userModel.findOneByEmail(reqBody.email)
    if (checkEmail) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exited!')
    }
    // khởi tạo data
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      displayname: nameFromEmail,
      phone: reqBody.phone,
      account: {
        email: reqBody.email,
        password: bcryptjs.hashSync(reqBody.password, 8),
        verifyToken: uuidv4()
      }
    }
    // lưu data
    const result = await userModel.createNew(newUser)

    const getNewUser = await userModel.findOneById(result.insertedId)
    // verify  email
    await mailService.sendVerificationEmail(reqBody.email)
    // retrun data
    return getNewUser
  } catch (error) {
    throw error
  }
}

const signIn = async (reqBody) => {
  try {
    // check email có tồn tại hay không
    const user = await userModel.findOneByEmail(reqBody.email)
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email not found!')
    }

    const isValidPassword = await bcryptjs.compare(reqBody.password, user.password)
    if (!isValidPassword) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password')
    }

    if (user?.isVerified === false) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email not verified')
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    throw error
  }
}

const getUserById = async (id) => {
  try {
    const result = await userModel.findOneById(id)
    if (!result) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!.')
    return result
  } catch (error) {
    throw error
  }
}

const updateUser = async (id, data) => {
  try {
    const checkExistUser = await userModel.findOneById(id)
    if (!checkExistUser)
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found!')
    const newUser = {
      ...data,
      updatedAt: Date.now()
    }
    const updatedHeritage = await userModel.updateUser(id, newUser)
    return updatedHeritage
  } catch (error) {
    throw error
  }
}

const deleteAccount = async (id) => {
  try {
    await userModel.deleteOneById(id)
    return { deletedResult: 'User was deleted' }
  } catch (error) {
    throw error
  }
}

export const userService = {
  getAll,
  createNew,
  getUserById,
  updateUser,
  deleteAccount,
  signIn
}
