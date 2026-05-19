import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByUsername, createUser } from '../repositories/user.repository';
import HttpError from '../errors/HttpError';
import { ERROR_CODES } from '../constants/errors';

const SALT_ROUNDS = 10;


export const register = async (username: string, password: string) => {
  const existing = await findUserByUsername(username);
  if (existing) {
    const err = ERROR_CODES.AUTH_USERNAME_TAKEN;
    throw new HttpError(err.message, err.status, err.code);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser(username, hashedPassword);

  return { id: user.id, username: user.username, role: user.role };
};


export const login = async (username: string, password: string) => {
  const user = await findUserByUsername(username);
  if (!user) {
    const err = ERROR_CODES.AUTH_INVALID_CREDENTIALS;
    throw new HttpError(err.message, err.status, err.code);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = ERROR_CODES.AUTH_INVALID_CREDENTIALS;
    throw new HttpError(err.message, err.status, err.code);
  }

  if (!process.env.JWT_SECRET) {
    const err = ERROR_CODES.AUTH_JWT_SECRET_MISSING;
    throw new HttpError(err.message, err.status, err.code);
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });

  return { token };
};
