import { StatusCodes } from 'http-status-codes'
import { mailService } from '~/services/mailService'

const sendVerificationEmail = async (req, res) => {
  const { email } = req.body // Changed from req.query
  await mailService.sendVerificationEmail(email)
  res.status(StatusCodes.OK).json({ success: true }) // Remove code from response
}

const verify_email = async (req, res) => {
  const { email, code } = req.body // Changed from req.query
  const confirm = await mailService.verify_email(email, code)
  res.status(StatusCodes.OK).json(confirm)
}

export { sendVerificationEmail, verify_email }