import JWT from 'jsonwebtoken'

const generateToken = (payload, secretSignature, tokenLife) => {
  try {
    return JWT.sign(payload, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) {
    throw new Error(error)
  }
}

//Hàm verify của thư viện này sẽ trả về payload nếu đúng
const verifyToken = async (token, secretSignature) => {
  try {
    const decodedPayload = JWT.verify(token, secretSignature)
    return decodedPayload // Return the decoded payload from verify
  } catch (error) {
    return error
  }
}

const decodeToken = (token) => {
  try {
    const decoded = JWT.decode(token)
    return decoded
  } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken,
  decodeToken
}