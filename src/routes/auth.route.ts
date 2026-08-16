import { Router } from 'express'
import { logIn, signUp } from '../controllers/auth.controller'

const authRouter = Router()

authRouter.post('/auth/sign-up', signUp)

authRouter.post('/auth/log-in', logIn)

export { authRouter }
