import prisma from '../config/prisma';
import { Role } from '@prisma/client';

export const findUserByUsername = (username: string) => {
  return prisma.user.findUnique({ where: { username } });
};

export const findUserById = (id: string) => {
  return prisma.user.findUnique({ where: { id } });
};

export const createUser = (username: string, hashedPassword: string, role: Role = Role.USER) => {
  return prisma.user.create({
    data: { username, password: hashedPassword, role },
  });
};
