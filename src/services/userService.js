import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

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

const createNew = async ( reqBody ) => {
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
    // retrun data
    return getNewUser
  }
  catch (error) {
    throw error
  }
}

export const userService = {
  getAll,
  createNew
}