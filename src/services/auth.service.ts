import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { findUserByUsername, createUser } from '../repositories/user.repository'

const SALT_ROUNDS = 10

export const register = async (username: string, password: string) => {
  const existing = await findUserByUsername(username)
  if (existing) throw new Error('Username already taken')

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await createUser(username, hashedPassword)

  return { id: user.id, username: user.username, role: user.role }
}

export const login = async (username: string, password: string) => {
  const user = await findUserByUsername(username)
  if (!user) throw new Error('Invalid credentials')

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new Error('Invalid credentials')

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  )

  return { token }
}