import prisma from '../config/prisma';
import { Role } from '@prisma/client';

export const getAllRolePermissions = () => {
  return prisma.rolePermission.findMany({
    include: { permission: { select: { name: true } } },
  });
};

export const getPermissionsByRole = (role: Role) => {
  return prisma.rolePermission.findMany({
    where: { role },
    include: { permission: { select: { name: true } } },
  });
};
