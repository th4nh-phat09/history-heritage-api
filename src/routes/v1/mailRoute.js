import express from 'express'
import { sendVerificationEmail, verify_email } from '~/controllers/mailController'


const Router = express.Router()

Router.route('/send-verification-email').post(sendVerificationEmail)

Router.route('/verify-email').post(verify_email)

export const mailRoute = Router
