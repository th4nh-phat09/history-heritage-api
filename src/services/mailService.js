import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import nodemailer from "nodemailer";
import generateConfirmationCode from "../utils/generateConfirmationCode.js";
import { userModel } from "~/models/userModel";
const sendVerificationEmail = async (email) => {
  try {
    const user = await userModel.findOneByEmail(email);
    const code = generateConfirmationCode();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Xác nhận tài khoản",
      html: `<p>Mã xác nhận của bạn là: <b>${code}</b></p>`,
    };
    await transporter.sendMail(mailOptions);
    user.code = code;
    user.codeExpiry = new Date(Date.now() + 60 * 1000); // 60s
    await user.save();
    return "Send code successfully!!";
  } catch (error) {
    throw error;
  }
};

const verify_email = async (email, code) => {
  try {
    const user = await userModel.findOneByEmail(email);
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
    if (user?.code !== code) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid verification code");
    }
    if (!user.code || !user.codeExpiry) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid verification code");
    }
    const isCodeExpired = new Date() > user.codeExpiry;
    if (isCodeExpired) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Code has expired");
    }
    user.isVerified = true;
    user.code = null;
    user.codeExpiry = null;
    await user.save();
    return { success: true, message: "Verified successfully" };
  } catch (error) {
    throw error;
  }
};

export const mailService = { sendVerificationEmail, verify_email };
