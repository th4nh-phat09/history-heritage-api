import { StatusCodes } from "http-status-codes";
import { userModel } from "~/models/userModel";
import ApiError from "~/utils/ApiError";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const getAll = async () => {
  // try {
  //   const result = await userModel.getAll()
  //   if (!result) {
  //     throw new ApiError(StatusCodes.NOT_FOUND, 'board not found!')
  //   }
  // } catch (error) {
  //   throw error
  // }
};

const createNew = async (reqBody) => {
  try {
    // check email có tồn tại hay không
    const checkEmail = await userModel.findOneByEmail(reqBody.email);
    if (checkEmail) {
      throw new ApiError(StatusCodes.CONFLICT, "Email already exited!");
    }
    // khởi tạo data
    const nameFromEmail = reqBody.email.split("@")[0];
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8),
      username: nameFromEmail,
      displayname: nameFromEmail,
      verifyToken: uuidv4(),
    };
    // lưu data
    const result = await userModel.createNew(newUser);
    const getNewUser = await userModel.findOneById(result.insertedId);
    // verify  email
    // retrun data
    return getNewUser;
  } catch (error) {
    throw error;
  }
};

const signIn = async (reqBody) => {
  try {
    // check email có tồn tại hay không
    const user = await userModel.findOneByEmail(reqBody.email);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
    }

    const isValidPassword = await bcryptjs.compare(
      reqBody.password,
      user.password
    );
    if (!isValidPassword) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid email or password!"
      );
    }
    if (user?.isVerified === false) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Email not verified");
    }

    const { password: _, ...userWithoutPassword } = user;

    // retrun data
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

export const userService = {
  getAll,
  createNew,
};
