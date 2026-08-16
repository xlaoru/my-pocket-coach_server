import { Router } from 'express'
import { logIn, refresh, signUp } from '../controllers/auth.controller'

const authRouter = Router()

authRouter.post('/auth/sign-up', signUp)

authRouter.post('/auth/log-in', logIn)

authRouter.post('/auth/refresh', refresh)

export { authRouter }
