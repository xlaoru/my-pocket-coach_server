import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

function getEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} must be set`)
  }
  return value
}

const accessTokenSecret = getEnvVar('JWT_ACCESS_SECRET')
const refreshTokenSecret = getEnvVar('JWT_REFRESH_SECRET')

async function generateAccessToken(id: mongoose.Types.ObjectId) {
  const accessToken = jwt.sign({ id }, accessTokenSecret, {
    expiresIn: '15m',
  })

  return accessToken
}

async function validateAccessToken(token: string) {
  try {
    const userData = jwt.verify(token, accessTokenSecret)
    return userData
  } catch (error) {
    return null
  }
}

async function generateRefreshToken(id: mongoose.Types.ObjectId) {
  const refreshToken = jwt.sign({ id }, refreshTokenSecret, {
    expiresIn: '1w',
  })

  return refreshToken
}

async function validateRefreshToken(token: string) {
  try {
    const userData = jwt.verify(token, refreshTokenSecret)
    return userData
  } catch (error) {
    return null
  }
}

export { generateAccessToken, generateRefreshToken, validateAccessToken, validateRefreshToken }
