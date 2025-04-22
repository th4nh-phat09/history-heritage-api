import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { mailService } from './mailService'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ms from 'ms'



const getAll = async (queryParams) => {
  try {
    const { page, limit, search, sort, order } = queryParams

    // Tính toán skip
    const skip = (page - 1) * limit

    // Xây dựng bộ lọc
    const filter = {}
    if (search) {
      filter.displayname = { $regex: search, $options: 'i' } // Tìm kiếm theo displayname (không phân biệt hoa thường)
    }

    // Xây dựng điều kiện sắp xếp
    const sortOptions = {}
    sortOptions[sort] = order === 'asc' ? 1 : -1

    // Gọi model để lấy dữ liệu
    const users = await userModel.getAllWithPagination({ filter, sort: sortOptions, skip, limit })

    // Tính tổng số bản ghi
    const totalCount = await userModel.countDocuments(filter)

    // Tính tổng số trang
    const totalPages = Math.ceil(totalCount / limit)

    return {
      users,
      pagination: {
        totalItems: totalCount,
        currentPage: parseInt(page, 10),
        totalPages,
        itemsPerPage: parseInt(limit, 10)
      }
    }
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

    delete getNewUser.account
    // retrun data
    return getNewUser
  } catch (error) {
    throw error
  }
}

const signIn = async (reqBody, res) => {
  try {
    // check email có tồn tại hay không
    const user = await userModel.findOneByEmail(reqBody.email)
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email not found!')
    }

    const isValidPassword = await bcryptjs.compare(reqBody.password, user.account.password)
    if (!isValidPassword) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password')
    }

    if (user?.account?.isVerified === false) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email not verified')
    }

    const { password: _, ...userWithoutPassword } = user
    // tạo token


    // Trường hợp nhập đúng thông tin tài khoản, tạo token và trả về cho phía Client
    //Tạo thông tin cho payload gửi về cho client
    const userInfo = {
      id: userWithoutPassword._id,
      email: userWithoutPassword.account.email,
      role: userWithoutPassword.role
    }
    //tạo access token gửi về cho client
    const accessToken = await JwtProvider.generateToken(userInfo, env.ACCESS_TOKEN_SECRET_SIGNATURE, '5s')
    //tạo refresh token gửi về cho client
    const refreshToken = await JwtProvider.generateToken(userInfo, env.REFRESH_TOKEN_SECRET_SIGNATURE, '14 days')

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    delete userWithoutPassword.account
    delete userWithoutPassword._id
    //trả về kqua cho client
    return {
      userInfo: userWithoutPassword,
      accessToken,
    }
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
    const checkId = await userModel.findOneById(id)
    if (!checkId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    await userModel.deleteOneById(id)
    return { deletedResult: 'User was deleted' }
  } catch (error) {
    throw error
  }
}

const refreshToken = async (refreshToken) => {
  try {
    const verifyToken = await JwtProvider.verifyToken(refreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)
    //tạo lại payload để tạo accessToken
    const userInfo = {
      id: verifyToken.id,
      email: verifyToken.email,
      role: verifyToken.role
    }
    //tạo access token gửi về cho client
    const accessToken = await JwtProvider.generateToken(userInfo, env.ACCESS_TOKEN_SECRET_SIGNATURE, 5)
    return accessToken
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
  signIn,
  refreshToken
}
