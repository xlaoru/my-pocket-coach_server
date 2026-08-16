import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import { User } from '../models/user.model'

async function signUp(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body

    const candidate = await User.findOne({ email })

    if (candidate) {
      return res.status(400).json({ message: 'User with this email already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 7)

    const user = new User({
      name,
      email,
      password: hashedPassword,
    })

    await user.save()

    return res.status(201).json({ message: 'User created successfully.' })
  } catch (error) {
    res.status(500).json({ message: 'Sign Up error' })
  }
}

async function logIn(req: Request, res: Response) {}

async function refresh(req: Request, res: Response) {}

export { logIn, refresh, signUp }
