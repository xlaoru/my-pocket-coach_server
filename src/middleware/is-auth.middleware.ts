import { NextFunction, Request, Response } from 'express'
import { validateAccessToken } from '../services/token.service'

async function isAuth(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'OPTIONS') {
    return next()
  }

  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(403).json({ message: 'Auth error: no authorization header.' })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(403).json({ message: 'Auth error: no token provided.' })
    }

    const decodedData = await validateAccessToken(token)

    if (!decodedData) {
      return res.status(403).json({ message: 'Auth error: token verification failed.' })
    }

    req.user = decodedData

    next()
  } catch (error) {
    console.log(error)
    res.status(403).json({ message: 'Auth error: token verification failed.' })
  }
}

export { isAuth }
