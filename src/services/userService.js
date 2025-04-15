import { StatusCodes } from "http-status-codes";
import { userModel } from "~/models/userModel";
import ApiError from "~/utils/ApiError";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { mailService } from "./mailService";

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
    await mailService.sendVerificationEmail(reqBody.email);
    // retrun data
    return getNewUser;
  } catch (error) {
    throw error;
  }
};

export const userService = {
  getAll,
  createNew,
};
