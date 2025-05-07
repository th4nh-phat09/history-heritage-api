import ApiError from '../utils/ApiError.js'
import { StatusCodes } from 'http-status-codes'
import nodemailer from 'nodemailer'
import generateConfirmationCode from '../utils/generateConfirmationCode.js'
import { userModel } from '~/models/userModel'

const sendVerificationEmail = async (email) => {
  try {
    const user = await userModel.findOneByEmail(email)
    const code = generateConfirmationCode()

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
      }
    })
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Xác nhận tài khoản',
      html: `<p>Mã xác nhận của bạn là: <b>${code}</b></p>`
    }
    await transporter.sendMail(mailOptions)
    await userModel.updateUser(user._id, {
      'account.code': code,
      'account.codeExpiry': new Date(Date.now() + 10 * 60 * 1000)
    })
    return 'Send code successfully!!'
  } catch (error) {
    throw error
  }
}

const verify_email = async (email, code) => {
  try {
    const user = await userModel.findOneByEmail(email)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }
    if (user?.account?.code !== code) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid verification code')
    }
    if (!user?.account?.code || !user?.account.codeExpiry) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid verification code')
    }
    const isCodeExpired = new Date() > user.account.codeExpiry
    if (isCodeExpired) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Code has expired')
    }

    await userModel.updateUser(user._id, {
      'account.code': null,
      'account.codeExpiry': null,
      'account.isVerified': true
    })
    return { success: true, message: 'Verified successfully' }
  } catch (error) {
    throw error
  }
}


const sendResetPasswordEmail = async (email, resetCode) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
      }
    })

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        <p>Here is your reset code: <strong>${resetCode}</strong></p>
        <p>This code will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      `
    }

    await transporter.sendMail(mailOptions)
    return 'Reset password email sent successfully'
  } catch (error) {
    throw error
  }
}

export const mailService = { sendVerificationEmail, verify_email, sendResetPasswordEmail }
