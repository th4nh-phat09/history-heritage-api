import slugify from 'slugify'
export const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/
export const OBJECT_ID_RULE_MESSAGE = 'Your string fails to match the Object Id pattern!'
export const EMAIL_RULE = /^\S+@\S+\.\S+$/
export const EMAIL_RULE_MESSAGE = 'Email is invalid. (example@thanhphat123.com)'
export const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/
export const PASSWORD_RULE_MESSAGE = 'Password must include at least 1 letter, a number, and at least 8 characters.'
export const PHONE_RULE = /^0\d{9}$/
export const PHONE_RULE_MESSAGE = 'Phone number must start with 0 and be exactly 10 digits.'
export const JWT_TOKEN_RULE = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
export const JWT_TOKEN_RULE_MESSAGE = 'Token is invalid. It must be a valid JWT format.'
export const createSlug = (value) => {
  return slugify(value, {
    lower: true,
    locale: 'vi',
    trim: true
  })
}

